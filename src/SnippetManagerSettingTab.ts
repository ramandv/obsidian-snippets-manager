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
            .setName('Snippets file path')
            .setDesc('Path to the markdown file where snippets are stored.')
            .addText(text => text
                .setPlaceholder('Enter snippet file path')
                .setValue(this.plugin.settings.snippetFilePath)
                .onChange(async (value) => {
                    this.plugin.settings.snippetFilePath = value;
                    await this.plugin.saveSettings();
                    await this.plugin.loadSnippetsFromFile();
                }));
    }
}
