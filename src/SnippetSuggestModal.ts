import { FuzzySuggestModal, MarkdownView, Notice } from 'obsidian';
import SnippetManagerPlugin from './SnippetManagerPlugin';

export default class SnippetSuggestModal extends FuzzySuggestModal<string> {
    plugin: SnippetManagerPlugin;
    items: Record<string, string> = {};

    constructor(app: any, plugin: SnippetManagerPlugin) {
        super(app);
        this.plugin = plugin;
        this.refreshSnippets();
        this.scope.register(['Mod'], 'Enter', (evt: KeyboardEvent) => {
            if (evt.isComposing) {
				return;
			}
            this.chooser.useSelectedItem(evt);
            return false;
        })
        this.setPlaceholder("Search snippets...");
    }

    async refreshSnippets() {
        await this.plugin.loadSnippetsFromFile();
        this.items = this.plugin.snippets;
        // this.updateSuggestions(Object.keys(this.items));
    }

    getItems(): string[] {
        return Object.keys(this.items);
    }

    getItemText(item: string): string {
        return item;
    }

    onChooseItem(item: string, evt: KeyboardEvent) {
        const value = this.plugin.snippets[item];
        navigator.clipboard.writeText(value).then(() => {
            new Notice(`Copied snippet: ${item}`);
        });

        if (evt.metaKey || evt.ctrlKey) {
            this.insertSnippetAtCursor(value);
        }
    }

    insertSnippetAtCursor(value: string) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            const editor = view.editor; // Access the CodeMirror editor
            editor.replaceSelection(value);
            // new Notice(`Pasted snippet at cursor: ${value}`);
        } else {
            new Notice("Active view is not a markdown editor. Snippet was copied to clipboard.");
        }
    }

    onOpen() {
        super.onOpen();
        this.displayInstructions();
    }

    displayInstructions() {
        this.setInstructions([
            { command: "↵", purpose: "to copy to clipboard" },
            { command: "⌘ ↵", purpose: "to copy and paste at cursor position" },
        ]);
    }
}
