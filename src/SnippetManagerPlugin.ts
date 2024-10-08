import { Plugin, Notice, TFile, TFolder, CachedMetadata } from 'obsidian';
import SnippetSuggestModal from './SnippetSuggestModal';
import SnippetManagerSettingTab from './SnippetManagerSettingTab';
import ChatGPTPromptManager from './ChatGPTPromptManager';

export interface SnippetManagerSettings {
    snippetPath: string; // Can be either a file or a directory
    alfredSupport: boolean; 
}

const DEFAULT_SETTINGS: SnippetManagerSettings = {
    snippetPath: "Snippets.md", // Default to single file for backward compatibility
    alfredSupport: false,
};

export default class SnippetManagerPlugin extends Plugin {
    settings: SnippetManagerSettings;
    snippets: Record<string, string> = {};
    lastModifiedTimes: Record<string, number> = {}; // Track modified times for multiple files
    isSnippetsReloaded = false;

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

        // Add command to sync Awesome ChatGPT prompts
        this.addCommand({
            id: 'sync-chatgpt-prompts',
            name: 'Sync Awesome ChatGPT Prompts',
            callback: async () => {
                const snippetPath = this.settings.snippetPath; // You can make this dynamic based on user settings
                const fileOrFolder = this.app.vault.getAbstractFileByPath(snippetPath);
                if (!fileOrFolder) {
                    new Notice(`Snippet path not found: ${snippetPath}`);
                    return;
                }
                if (fileOrFolder instanceof TFolder) {
                    const promptManager = new ChatGPTPromptManager(this);
                    // Define your snippets folder path, e.g., 'Snippets/'
                    await promptManager.fetchLatestChatGPTPrompts(snippetPath);
                    this.loadSnippets();
                }
                else {
                    new Notice(`Error: Snippet path should be an folder.`);
                }

            }
        });

        // Wait for the layout to be ready before loading snippets
        this.app.workspace.onLayoutReady(() => {
            this.loadSnippets();
        });
    }

    clearSnippets() {
        this.snippets = {};
        this.lastModifiedTimes = {};
    }

    async loadSnippets() {
        this.isSnippetsReloaded = false;
        const snippetPath = this.settings.snippetPath;
        const fileOrFolder = this.app.vault.getAbstractFileByPath(snippetPath);

        if (!fileOrFolder) {
            new Notice(`Snippet path not found: ${snippetPath}`);
            return;
        }

        if (fileOrFolder instanceof TFolder) {
            const markdownFiles = this.getAllMarkdownFiles(fileOrFolder);
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

        if(this.isSnippetsReloaded) {
            await this.saveSnippetsAsAlfredJson();
            this.isSnippetsReloaded = false;
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
            const filePrefix = addFilePrefix ? this.getRelativePath(file, this.settings.snippetPath) : null;
            Object.assign(this.snippets, this.getSnippets(content, contentCache, filePrefix));

            this.lastModifiedTimes[filePath] = modifiedTime;
            // new Notice(`Snippets reloaded from: ${filePath}`);
            this.isSnippetsReloaded = true;
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
            const snippetKey = filePrefix && filePrefix !== '' ? `${filePrefix}: ${currentHeading.heading}` : currentHeading.heading;

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


    // Save the snippets as a JSON file in Alfred's snippet format
    async saveSnippetsAsAlfredJson() {
        if(!this.settings.alfredSupport) {
            return;
        }

        let idCounter = 1; // Initialize a counter for sequential UIDs
        const alfredSnippets = Object.keys(this.snippets).map((key) => {
            return {
                    "uid": idCounter++, // Unique ID for each snippet
                    "title": key, // Snippet title
                    "subtitle": this.snippets[key], // Snippet content
                    "arg": this.snippets[key], // Snippet content
                    "key": key // Set the key as the trigger keyword
            };
        });

        const jsonContent = JSON.stringify({ items: alfredSnippets }, null, 2); // Format the JSON
        const jsonFilePath = `${this.manifest.dir}/alfred-snippets.json`; // Path to store the JSON file in the plugin's directory

        try {
            await this.app.vault.adapter.write(jsonFilePath, jsonContent); // Save the JSON file
            // new Notice(`Snippets saved as Alfred JSON in: ${jsonFilePath}`);
        } catch (error) {
            console.error('Error saving snippets as Alfred JSON:', error);
            new Notice('Failed to save snippets as Alfred JSON');
        }
    }

    async loadSettings() {
        const data = await this.loadData();

        // Migrate old setting (snippetFilePath) to the new one (snippetPath) if it exists
        if (data?.snippetFilePath && !data.snippetPath) {
            data.snippetPath = data.snippetFilePath; // Copy old setting to the new key
            delete data.snippetFilePath; // Optionally remove the old key if no longer needed
        }

        // Merge default settings with loaded/migrated settings
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);

        // Save settings after migration to ensure future consistency
        await this.saveSettings();
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    getRelativePath(file: TFile, rootPath: string): string {
        let relativePath = file.path.slice(rootPath.length);
        if (relativePath.startsWith('/')) {
            relativePath = relativePath.slice(1);
        }
        return relativePath.replace(/\.md$/, '');
    }

    getAllMarkdownFiles(folder: TFolder): TFile[] {
        let markdownFiles: TFile[] = [];
        folder.children.forEach((child) => {
            if (child instanceof TFile && child.extension === "md") {
                markdownFiles.push(child);
            } else if (child instanceof TFolder) {
                markdownFiles = markdownFiles.concat(this.getAllMarkdownFiles(child));
            }
        });
        return markdownFiles;
    }
}
