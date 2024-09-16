import { Plugin, Notice, TFile, TFolder, CachedMetadata } from 'obsidian';
import SnippetSuggestModal from './SnippetSuggestModal';
import SnippetManagerSettingTab from './SnippetManagerSettingTab';

export interface SnippetManagerSettings {
    snippetPath: string; // Can be either a file or a directory
}

const DEFAULT_SETTINGS: SnippetManagerSettings = {
    snippetPath: "Snippets.md" // Default to single file for backward compatibility
};

export default class SnippetManagerPlugin extends Plugin {
    settings: SnippetManagerSettings;
    snippets: Record<string, string> = {};
    lastModifiedTimes: Record<string, number> = {}; // Track modified times for multiple files

    async onload() {
        // Load settings
        await this.loadSettings();

        // Add settings tab
        this.addSettingTab(new SnippetManagerSettingTab(this.app, this));

        // Add command to trigger the fuzzy suggester
        this.addCommand({
            id: 'open-snippet-search',
            name: 'Search Snippets',
            editorCallback: (editor, view) => {
                new SnippetSuggestModal(this.app, this, editor).open();
            }
        });
    }

    clearSnippets() {
        this.snippets = {};
        this.lastModifiedTimes = {};
    }

    async loadSnippets() {
        const snippetPath = this.settings.snippetPath;
        const fileOrFolder = this.app.vault.getAbstractFileByPath(snippetPath);

        if (!fileOrFolder) {
            new Notice(`Snippet path not found: ${snippetPath}`);
            return;
        }

        if (fileOrFolder instanceof TFolder) {
            // Check if the folder contains more than one file
            const markdownFiles = fileOrFolder.children.filter(
                (file) => file instanceof TFile && file.extension === 'md'
            );

            const addFilePrefix = markdownFiles.length > 1;

            // Handle directory: load snippets from all markdown files in the folder
            for (let file of markdownFiles) {
                if (file instanceof TFile) {
                    await this.loadSnippetsFromFile(file, addFilePrefix);
                }
            }
        } else if (fileOrFolder instanceof TFile && fileOrFolder.extension === 'md') {
            // Handle single file
            await this.loadSnippetsFromFile(fileOrFolder, false);
        } else {
            new Notice(`Invalid snippet path: ${snippetPath}`);
        }
    }

    async loadSnippetsFromFile(file: TFile, addFilePrefix: boolean) {
        const filePath = file.path;
        const fileStat = await this.app.vault.adapter.stat(filePath);
        const modifiedTime = fileStat?.mtime;

        // Check if the file has been modified since the last load
        if (modifiedTime && (!this.lastModifiedTimes[filePath] || modifiedTime > this.lastModifiedTimes[filePath])) {
            const content = await this.app.vault.cachedRead(file);
            const contentCache = this.app.metadataCache.getFileCache(file);

            // Merge snippets from this file into the global snippets
            Object.assign(this.snippets, this.getSnippets(content, contentCache, addFilePrefix ? file.basename : null));

            this.lastModifiedTimes[filePath] = modifiedTime;
            new Notice(`Snippets reloaded from: ${filePath}`);
        }
    }

    getSnippets(content: string, contentCache: CachedMetadata | null, filePrefix: string | null): Record<string, string> {
        const snippets: Record<string, string> = {};

        if (!contentCache?.headings) {
            return snippets; // No headings found, return empty snippets
        }

        const headings = contentCache.headings;
        const level = headings[0].level;

        // Ensure all headings are at the same level
        for (let i = 0; i < headings.length; i++) {
            if (headings[i].level !== level) {
                new Notice(`Please follow the same heading level throughout the file`);
                return snippets;
            }
        }

        // Iterate over headings and capture content
        for (let i = 0; i < headings.length; i++) {
            const currentHeading = headings[i];
            let sectionContent = '';

            if (i + 1 === headings.length) {
                sectionContent = content.slice(currentHeading.position.end.offset + 1);
            } else {
                const nextHeading = headings[i + 1];
                sectionContent = content.slice(
                    currentHeading.position.end.offset + 1,
                    nextHeading.position.start.offset - 1
                );
            }

            // Remove code block formatting
            sectionContent = this.stripCodeBlockFormatting(sectionContent).trim();

            // Prefix with file name if needed
            const snippetKey = filePrefix ? `${filePrefix}: ${currentHeading.heading}` : currentHeading.heading;

            // Store the section content with the heading as the key
            snippets[snippetKey] = sectionContent;
        }

        return snippets;
    }

    stripCodeBlockFormatting(content: string): string {
        return content.replace(/```[\s\S]*?```/g, (match) => {
            // Remove the starting and ending backticks, and any language identifier
            return match.replace(/```(\w+)?\n?/, '').replace(/\n?```$/, '');
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.clearSnippets();
    }
}
