import { Editor, FuzzySuggestModal, Notice, App } from 'obsidian';
import SnippetManagerPlugin from './SnippetManagerPlugin';

export default class SnippetSuggestModal extends FuzzySuggestModal<string> {
    plugin: SnippetManagerPlugin;
    items: Record<string, string> = {};
    editor: Editor | null;

    constructor(app: App, plugin: SnippetManagerPlugin, editor: Editor | null) {
        super(app);
        this.plugin = plugin;
        this.editor = editor;
        this.refreshSnippets().catch(console.error);
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

    async onChooseItem(item: string, evt: KeyboardEvent) {
        let value = this.plugin.snippets[item];

        if (value.includes("<%")) {
            // @ts-ignore
            const templater = this.app.plugins.getPlugin('templater-obsidian');
            if (templater) {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    // @ts-ignore
                    value = await templater.templater.parse_template({ target_file: activeFile, run_mode: 4 }, value);
                }
            }
        }

        navigator.clipboard.writeText(value).then(() => {
            new Notice(`Copied snippet: ${item}`);
        }).catch(console.error);

        if (!this.editor) {
            return;
        }

        if (this.plugin.settings.useEnterToInsert) {
            this.insertSnippetAtCursor(value);
            return;
        }

        if (evt.metaKey || evt.ctrlKey) {
            this.insertSnippetAtCursor(value);
        }
    }

    insertSnippetAtCursor(value: string) {
        this.editor?.replaceSelection(value);
        // new Notice(`Pasted snippet at cursor: ${value}`);
    }

    onOpen() {
        void super.onOpen();
        this.displayInstructions();
    }

    displayInstructions() {
        if (!this.editor) {
            this.setInstructions([
                { command: "↵", purpose: "to copy to clipboard" },
            ]);
            return;
        }

        if (this.plugin.settings.useEnterToInsert) {
            this.setInstructions([
                { command: "↵", purpose: "to copy and paste at cursor position" },
                { command: "⌘ ↵", purpose: "to copy to clipboard" },
            ]);
            return;
        }

        this.setInstructions([
            { command: "↵", purpose: "to copy to clipboard" },
            { command: "⌘ ↵", purpose: "to copy and paste at cursor position" },
        ]);
    }
}
