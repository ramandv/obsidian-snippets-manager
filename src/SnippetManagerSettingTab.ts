import { PluginSettingTab, Setting } from 'obsidian';
import SnippetManagerPlugin from './SnippetManagerPlugin';

export default class SnippetManagerSettingTab extends PluginSettingTab {
    plugin: SnippetManagerPlugin;

    constructor(app: any, plugin: SnippetManagerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Snippets file path or Snippets folder path')
            .setDesc('Path to the markdown file where snippets are stored. or Path to Folder which contains multiple Snippets file')
            .addText(text => text
                .setPlaceholder('Snippets.md')
                .setValue(this.plugin.settings.snippetPath)
                .onChange(async (value) => {
                    this.plugin.settings.snippetPath = value;
                    await this.plugin.saveSettings();
                }));
    }
}
