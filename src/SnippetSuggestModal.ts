import { Editor, FuzzySuggestModal, MarkdownView, Notice } from 'obsidian';
import SnippetManagerPlugin from './SnippetManagerPlugin';

export default class SnippetSuggestModal extends FuzzySuggestModal<string> {
    plugin: SnippetManagerPlugin;
    items: Record<string, string> = {};
    editor: Editor;

    constructor(app: any, plugin: SnippetManagerPlugin, editor: Editor ) {
        super(app);
        this.plugin = plugin;
        this.editor = editor;
        this.refreshSnippets();
        this.scope.register(['Mod'], 'Enter', (evt: KeyboardEvent) => {
            if (evt.isComposing) {
				return;
			}
            // @ts-ignore
            this.chooser.useSelectedItem(evt);
            return false;
        })
        this.setPlaceholder("Search snippets...");
    }

    async refreshSnippets() {
        await this.plugin.loadSnippets();
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
        if (this.editor) {
            this.editor.replaceSelection(value);
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
