import { Plugin, Notice, TFile } from 'obsidian';
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
        console.log("Snippet Manager Plugin loaded");

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

            console.log(`Current file modified time: ${modifiedTime}`);
            console.log(`Last known modified time: ${this.lastModifiedTime}`);

            if (file instanceof TFile && modifiedTime && 
                (this.lastModifiedTime === null || modifiedTime > this.lastModifiedTime)) {
                const content = await this.app.vault.read(file);
                this.snippets = this.parseMarkdownFile(content);
                this.lastModifiedTime = modifiedTime;
                console.log('Snippets have been reloaded.');
                new Notice(`Snippets reloaded from: ${filePath}`);
            } else {
                console.log('No need to reload snippets. The file has not been modified since last load.');
            }
        } else {
            new Notice(`Snippet file not found at: ${filePath}`);
        }
    }

    parseMarkdownFile(content: string): Record<string, string> {
        const keyValuePairs: Record<string, string> = {};
        const md = content.split('\n');
        let currentKey: string | null = null;
        let currentValue: string[] = [];

        md.forEach(line => {
            if (line.startsWith('### ')) {
                if (currentKey) {
                    keyValuePairs[currentKey] = currentValue.join('\n').trim();
                }
                currentKey = line.substring(4).trim();
                currentValue = [];
            } else {
                if (!line.startsWith('```')) {
                    currentValue.push(line);
                }
            }
        });

        if (currentKey) {
            keyValuePairs[currentKey] = currentValue.join('\n').trim();
        }

        return keyValuePairs;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
