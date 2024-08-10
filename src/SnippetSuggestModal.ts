import { FuzzySuggestModal, MarkdownView, Notice } from 'obsidian';
import SnippetManagerPlugin from './SnippetManagerPlugin';

export default class SnippetSuggestModal extends FuzzySuggestModal<string> {
    plugin: SnippetManagerPlugin;
    items: Record<string, string> = {};

    constructor(app: any, plugin: SnippetManagerPlugin) {
        super(app);
        this.plugin = plugin;
        this.refreshSnippets();
        this.inputEl.addEventListener('keydown', this.onKeydown.bind(this));
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

    onKeydown(evt: KeyboardEvent) {
        if ((evt.metaKey || evt.ctrlKey) && evt.key === 'Enter') {
            evt.preventDefault();
            const selectedItem = this.resultContainerEl.querySelector('.suggestion-item.is-selected');
            if (selectedItem) {
                const itemText = selectedItem.textContent!;
                this.onChooseItem(itemText, evt);
                this.close();
            }
        }
    }

    insertSnippetAtCursor(value: string) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        
        if (view) {
            const editor = view.editor; // Access the CodeMirror editor
            editor.replaceSelection(value);
            new Notice(`Pasted snippet at cursor: ${value}`);
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