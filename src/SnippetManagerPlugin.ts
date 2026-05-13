import { Plugin, Notice, TFile, TFolder, CachedMetadata, MarkdownView, getAllTags } from 'obsidian';
import SnippetSuggestModal from './SnippetSuggestModal';
import SnippetManagerSettingTab from './SnippetManagerSettingTab';

export interface SnippetManagerSettings {
    snippetPath: string; // Can be either a file or a directory
    snippetTags: string; // Comma-separated list of tags
    showFullPathAsPrefix: boolean; // Whether to show full path as prefix
    alfredSupport: boolean;
    useEnterToInsert: boolean; // Whether to use ↵ or ⌘ ↵ to insert snippet
    stripCodeBlockFormatting: boolean; // Whether to strip code block formatting from snippets
}

const DEFAULT_SETTINGS: SnippetManagerSettings = {
    snippetPath: "Snippets.md", // Default to single file for backward compatibility
    snippetTags: "",
    showFullPathAsPrefix: true,
    alfredSupport: false,
    useEnterToInsert: false,
    stripCodeBlockFormatting: true,
};

export default class SnippetManagerPlugin extends Plugin {
    settings: SnippetManagerSettings;
    snippets: Record<string, string> = {};
    snippetsByFile: Record<string, Record<string, string>> = {}; // Track snippets per file
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
            callback: () => {
                const activeMarkdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
                const editor = activeMarkdownView?.getMode() === 'source' ? activeMarkdownView.editor : null;
                new SnippetSuggestModal(this.app, this, editor).open();
            }
        });

        // Wait for the layout to be ready before loading snippets
        this.app.workspace.onLayoutReady(() => {
            this.loadSnippets().catch(console.error);
        });
    }

    clearSnippets() {
        this.snippets = {};
        this.snippetsByFile = {};
        this.lastModifiedTimes = {};
    }

    async loadSnippets() {
        this.isSnippetsReloaded = false;
        
        const rawPaths = this.settings.snippetPath ? this.settings.snippetPath.split(',').map(s => s.trim()).filter(Boolean) : [];
        const rawTags = this.settings.snippetTags ? this.settings.snippetTags.split(',').map(s => s.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`) : [];

        // Check if there are any configured sources at all
        if (rawPaths.length === 0 && rawTags.length === 0) {
            new Notice('No snippet locations or tags provided.');
            return;
        }

        const activeFiles: string[] = [];
        const addFilePrefix = rawPaths.length > 1 || rawTags.length > 0;

        for (const rawPath of rawPaths) {
            const fileOrFolder = this.app.vault.getAbstractFileByPath(rawPath);

            if (!fileOrFolder) {
                new Notice(`Snippet location not found: ${rawPath}`);
                continue;
            }

            if (fileOrFolder instanceof TFolder) {
                const markdownFiles = this.getAllMarkdownFiles(fileOrFolder);
                const shouldAddPrefix = addFilePrefix || markdownFiles.length > 1;

                // Handle directory: load snippets from all markdown files in the folder
                for (const file of markdownFiles) {
                    activeFiles.push(file.path);
                    await this.loadSnippetsFromFile(file, shouldAddPrefix, rawPath);
                }
            } else if (fileOrFolder instanceof TFile && fileOrFolder.extension === 'md') {
                // Handle single file
                activeFiles.push(fileOrFolder.path);
                await this.loadSnippetsFromFile(fileOrFolder, addFilePrefix, "");
            } else {
                new Notice(`Invalid snippet location: ${rawPath}`);
            }
        }

        if (rawTags.length > 0) {
            const allFiles = this.app.vault.getMarkdownFiles();
            for (const file of allFiles) {
                const cache = this.app.metadataCache.getFileCache(file);
                if (cache) {
                    const fileTags = getAllTags(cache) || [];
                    for (const tag of rawTags) {
                        if (fileTags.includes(tag)) {
                            // Don't double-process files loaded from paths
                            if (!activeFiles.includes(file.path)) {
                                activeFiles.push(file.path);
                                await this.loadSnippetsFromFile(file, true, "");
                            }
                            break; // Avoid processing the same tagged file multiple times if it has multiple matching tags
                        }
                    }
                }
            }
        }

        // Clean up snippets from files that no longer exist or were removed from scope
        for (const filePath in this.snippetsByFile) {
            if (!activeFiles.includes(filePath)) {
                delete this.snippetsByFile[filePath];
                delete this.lastModifiedTimes[filePath];
                this.isSnippetsReloaded = true;
            }
        }

        // Rebuild the flat snippets object if any changes occurred
        if (this.isSnippetsReloaded) {
            this.snippets = {};
            for (const filePath in this.snippetsByFile) {
                Object.assign(this.snippets, this.snippetsByFile[filePath]);
            }

            await this.saveSnippetsAsAlfredJson();
            this.isSnippetsReloaded = false;
        }
    }

    async loadSnippetsFromFile(file: TFile, addFilePrefix: boolean, rootPath: string = "") {
        const filePath = file.path;
        const fileStat = await this.app.vault.adapter.stat(filePath);
        const modifiedTime = fileStat?.mtime;

        // Check if the file has been modified since the last load
        if (modifiedTime && (!this.lastModifiedTimes[filePath] || modifiedTime > this.lastModifiedTimes[filePath])) {
            const content = await this.app.vault.cachedRead(file);
            const contentCache = this.app.metadataCache.getFileCache(file);

            // Get snippets for this specific file
            let filePrefix: string | null = null;
            if (addFilePrefix) {
                 if (this.settings.showFullPathAsPrefix) {
                     filePrefix = this.getRelativePath(file, rootPath);
                 } else {
                     filePrefix = file.basename;
                 }
            }

            const newSnippets = this.getSnippets(content, contentCache, filePrefix);

            // Should strictly check if content actually changed, but modification time is a good enough proxy for now
            // We replace the entire entry for this file
            this.snippetsByFile[filePath] = newSnippets;

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

            // Remove code block formatting if enabled
            if (this.settings.stripCodeBlockFormatting) {
                sectionContent = this.stripCodeBlockFormatting(sectionContent).trim();
            } else {
                sectionContent = sectionContent.trim();
            }

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
        if (!this.settings.alfredSupport) {
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
