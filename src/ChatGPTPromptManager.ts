import { TFolder, TFile, Notice } from 'obsidian';

export default class ChatGPTPromptManager {
    plugin: any;

    constructor(plugin: any) {
        this.plugin = plugin;
    }

    async fetchLatestChatGPTPrompts(snippetFolderPath: string) {
        try {
            // Step 1: Fetch the latest content from the Awesome ChatGPT Prompts repository
            const response = await fetch('https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv');
            if (!response.ok) {
                throw new Error('Failed to fetch the latest prompts file');
            }

            const csvContent = await response.text();

            // Step 2: Convert the CSV content to Markdown format
            const markdownContent = this.convertCSVToMarkdown(csvContent);

            // Step 3: Create a markdown file in the snippets folder
            await this.createMarkdownFile(snippetFolderPath, 'Awesome ChatGPT Prompts.md', markdownContent);

            new Notice('Awesome ChatGPT Prompts file has been successfully saved to your snippets folder!');
        } catch (error) {
            console.error('Error fetching ChatGPT prompts:', error);
            new Notice('Failed to fetch and save the latest Awesome ChatGPT Prompts.');
        }
    }

    // Helper method to convert CSV to markdown format
    convertCSVToMarkdown(csvContent: string): string {
        const lines = csvContent.split('\n');
        let markdownContent = '';

        for (let i = 1; i < lines.length; i++) { // Skip header row
            const [act, prompt] = lines[i].split(',');

            if (act && prompt) {
                // Remove leading and trailing quotes from act and prompt
                const cleanedAct = act.trim().replace(/^"|"$/g, '');
                const cleanedPrompt = prompt.trim().replace(/^"|"$/g, '');
                markdownContent += `### ${cleanedAct}\n${cleanedPrompt}\n\n`;
            }
        }

        return markdownContent;
    }

    // Helper method to create a markdown file in the specified folder
    async createMarkdownFile(folderPath: string, fileName: string, content: string) {
        const folder = this.plugin.app.vault.getAbstractFileByPath(folderPath);

        if (folder && folder instanceof TFolder) {
            const filePath = `${folder.path}/${fileName}`;
            const existingFile = this.plugin.app.vault.getAbstractFileByPath(filePath);

            if (existingFile && existingFile instanceof TFile) {
                await this.plugin.app.vault.modify(existingFile, content); // Overwrite if the file exists
            } else {
                await this.plugin.app.vault.create(filePath, content); // Create a new file if it doesn't exist
            }
        } else {
            new Notice(`The folder path ${folderPath} does not exist or is not a valid folder.`);
            throw new Error('Invalid folder path');
        }
    }
}
