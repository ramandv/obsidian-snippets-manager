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
                    // Remove trailing slash if it exists
                    if (value.endsWith('/')) {
                        value = value.slice(0, -1); 
                    }
                    this.plugin.settings.snippetPath = value;
                    await this.plugin.saveSettings();
                    this.plugin.clearSnippets();
                }));

        new Setting(containerEl)
            .setName('Enable Alfred Support')
            .setDesc(
                createFragment((fragment) => {
                    fragment.appendText('If enabled, snippets will be saved in ');
                    fragment.append(
                        createEl(
                            "a",
                            {
                                text: "Alfred",
                                href: "https://www.alfredapp.com/?utm_source=Obsidian_Snippet_Manager",
                            },
                            (a) => {
                                a.setAttr("target", "_blank");
                            },
                        ),
                    );
                    fragment.appendText(' JSON format.');
                    fragment.append(createEl('br'));

                    fragment.appendText('Add the following file in the Alfred workflow configuration. (Just double click and copy the path)');
                    fragment.append(createEl('br'));

                    const fullPath = `${(this.plugin.app.vault.adapter as any).basePath}/${this.plugin.manifest.dir}/alfred-snippets.json`;
                    const pathSpan = createEl('span', { text: fullPath });
                    pathSpan.style.userSelect = 'text';
                    fragment.append(pathSpan);
                })
            )
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.alfredSupport)
                .onChange(async (value) => {
                    this.plugin.settings.alfredSupport = value;
                    await this.plugin.saveSettings();
                    if(value) {
                        this.plugin.clearSnippets();
                        this.plugin.loadSnippets();
                    }
                })
            );

        const settingUseEnter = new Setting(containerEl)
            .setName('Use ↵ to Insert Snippet?')
            .setDesc(
                this.plugin.settings.useEnterToInsert
                    ? 'Pressing ↵ will insert the selected snippet.'
                    : 'Pressing ⌘ ↵ will insert the snippet.'
            )
            .addToggle( toggle => toggle
                .setValue(this.plugin.settings.useEnterToInsert)
                .onChange(async (value) => {
                    this.plugin.settings.useEnterToInsert = value;
                    settingUseEnter.setDesc(
                        value
                            ? 'Pressing ↵ will insert the selected snippet.'
                            : 'Pressing ⌘ ↵ will insert the snippet.'
                    );
                    await this.plugin.saveSettings();
                }))
            ;
        ;
    }
}
