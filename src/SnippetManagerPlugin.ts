import { Plugin, Notice, TFile, MetadataCache, CachedMetadata } from 'obsidian';
import SnippetSuggestModal from './SnippetSuggestModal';
import SnippetManagerSettingTab from './SnippetManagerSettingTab';

export interface SnippetManagerSettings {
    snippetFilePath: string;
}

const DEFAULT_SETTINGS: SnippetManagerSettings = {
    snippetFilePath: "Snippets.md"
};

export default class SnippetManagerPlugin extends Plugin {
    settings: SnippetManagerSettings;
    snippets: Record<string, string> = {};
    lastModifiedTime: number | null = null;

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
                new SnippetSuggestModal(this.app, this).open();
            }
        });
    }

    async loadSnippetsFromFile() {
        const filePath = this.settings.snippetFilePath;
        const file = this.app.vault.getAbstractFileByPath(filePath);

        if (file instanceof TFile && file.extension === 'md') {
            const fileStat = await this.app.vault.adapter.stat(file.path);
            const modifiedTime = fileStat?.mtime;

            if (file instanceof TFile && modifiedTime && 
                (this.lastModifiedTime === null || modifiedTime > this.lastModifiedTime)) {
                const content = await this.app.vault.cachedRead(file);
                const contentCache = this.app.metadataCache.getFileCache(file);
                this.snippets = this.getSnippets(content,contentCache);
                this.lastModifiedTime = modifiedTime;
                new Notice(`Snippets reloaded from: ${filePath}`);
            }
        } else {
            new Notice(`Snippet file not found at: ${filePath}`);
        }
    }

    getSnippets(content:string, contentCache:CachedMetadata): Record<string, string> {
        const snippets: Record<string, string> = {};
        if (!contentCache.headings) {
            return snippets; // No headings found, return empty snippets
        }

        const headings = contentCache.headings;
        const level = headings[0].level;

        for (let i = 0; i < headings.length; i++) {
            if(headings[i].level != level) {
                new Notice(`Please follow same heading level throughout the file`);
                return snippets;
            }
        }

        for (let i = 0; i < headings.length; i++) {
            const currentHeading = headings[i];
            if(i+1 == headings.length) {
                snippets[currentHeading.heading] = content.slice(
                    currentHeading.position.end.offset+1).trim();
            }
            else {
                const nextHeading = headings[i + 1];
                // Store the section content with the heading as the key
                snippets[currentHeading.heading] = content.slice(
                    currentHeading.position.end.offset+1, 
                    nextHeading.position.start.offset-1).trim();
            }
        }
        return snippets;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
