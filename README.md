
# Snippets Manager - Text Expansion Plugin for Obsidian

## Overview

The **Snippets Manager Plugin** for Obsidian allows you to manage and quickly insert text snippets stored in a markdown file (or folder of markdown files, including subfolders). This plugin enhances your workflow by enabling fuzzy search for snippets, allowing you to copy them to your clipboard or directly paste them at the cursor position in your active note. Now, with Alfred integration and Awesome ChatGPT Prompts support, it's even more powerful.

![Obsidian Snippet Manager](https://github.com/user-attachments/assets/95f10833-faff-4313-8263-89dae134c60b)

## New Features

### Alfred Support
Snippets can now be saved in Alfred JSON format for integration with Alfred. If enabled, your snippets will be automatically saved in a JSON format compatible with Alfred workflows.

#### How to Use Alfred Support:

1. In the plugin settings, toggle Enable Alfred Support.
2. Snippets will be saved as alfred-snippets.json inside the plugin folder.
3. Install the alfred workflow by downloading [here](https://github.com/ramandv/obsidian-snippets-manager/raw/refs/heads/master/Alfred%20Workflow%20-%20Obsidian%20Snippet%20Manager.alfredworkflow)
4. You need to add the alfred-snippets.json file path to the alfredworkflow configuration. [In the snippets manager plugin settings panel, the full path to the generated Alfred JSON file is displayed, and you can copy it by double clicking and copy it for easy access.]

### Fetch Latest Awesome ChatGPT Prompts
You can fetch the latest Awesome ChatGPT Prompts directly into your snippets. The plugin will download the latest prompt file from the Awesome ChatGPT Prompts GitHub repository and convert it to a markdown and store it in your snippets folder.
You can easily search through those prompts.

#### How to Sync Awesome ChatGPT Prompts:
Use the command palette (Cmd/Ctrl + P) and search for Sync Awesome ChatGPT Prompts.
The plugin will fetch the latest version from the repository and save it.


## Usecases

### Do i need this plugin if i already you Text Expander kind of apps?
Yes, you need it. In most of the cases, those apps will be available only for desktops. But this plugin will work on your mobile too.

### Mobile Use:
I use Snippet Manager to quickly copy things like addresses, map locations, URLs, and quotes. With the help of the "[Website shortcut](https://play.google.com/store/apps/details?id=com.deltacdev.websiteshortcut&hl=en_IN)" Android app and the [Obsidian Advanced URI plugin](https://github.com/Vinzent03/obsidian-advanced-uri), I’ve set up a shortcut directly to the snippet search modal. Now, with just one click, I can copy whatever I need to my clipboard and paste it anywhere on my phone.

Example Advanced URI link for Obsidian. You can create the link to the URL. [Replace your vault name accordingly]
```
obsidian://advanced-uri?vault=<your-vaultname>&commandid=snippets-manager%3Aopen-snippet-search
```

### Desktop Use:
On my desktop, Snippet Manager is my go-to tool for copying ChatGPT prompts. I’ve stored a bunch of prompts from [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts), and with Snippet Manager, I can quickly find and copy the one I need.


## Features

- **Snippet Management:** Store snippets in a markdown file with headings as keys (whether personal details like email signature, passport number, code snippets or anything).
- **Folder Support:** The plugin supports snippets stored in a folder of markdown files, including subfolders. Either select the single markdown file in Settings for the plugin, or the folder containing the snippets.
- **Code Snippets**: The plugin supports code snippets stored in markdown code blocks. When retrieving a code snippet, the plugin automatically strips the backticks, providing you with just the clean code.
- **Fuzzy Search:** Quickly search through snippets using a fuzzy search interface.
- **Clipboard Copying:** Copy selected snippets to your clipboard.
- **Direct Insertion:** Paste snippets directly at the cursor position in the active markdown note.
- **Configurable Snippet Location:** Choose a markdown file or folder to store your snippets.
- **Mobile Support:** The plugin is fully compatible with Obsidian's mobile app. You can easily create a shortcut to the Snippet Search using the Advanced URI plugin, making it even more convenient to search and copy snippets on the go.
- **Alfred Support:** Generate an Alfred-compatible JSON file for use in Alfred workflows. This file is saved inside the Snippet Manager plugin folder, and the path can be easily copied from the settings.
- [**Awesome ChatGPT Prompts:**](https://github.com/f/awesome-chatgpt-prompts) Download and sync the latest prompts from the Awesome ChatGPT Prompts repository as snippets.



## Links

✨ [Check out latest updates](https://github.com/ramandv/obsidian-snippets-manager/releases)<br>
🪲 [Report bugs and suggest features](https://github.com/ramandv/obsidian-snippets-manager/issues)<br>
❓ [Ask questions](https://github.com/ramandv/obsidian-snippets-manager/discussions/new?category=q-a)<br>
👍 [Give thumbs up to issues important to you](https://github.com/ramandv/obsidian-snippets-manager/issues)<br>



## Installation

- **Obsidian Community Plugins:**
	- This plugin will  be available in the Obsidian community plugins list. If so, you can install it directly from Obsidian:
	 - Go to `Settings` > `Community Plugins` > `Browse`.
	 - Search for `Snippets Manager`.
	 - Click `Install` and then `Enable`.

## Usage

### Setting Up Snippets

1. **Single File or Folder Setup:**

You can store snippets in a single markdown file (e.g., Snippets.md) or in multiple markdown files within a folder (e.g., Snippets/

2. **Markdown Snippet Structure:**

- Each snippet should be stored under a heading (### Heading), with the content under the heading representing the snippet.
- Example in a single file:

````markdown
### Greeting
Hello, how are you doing today?

### Signature
Best regards,
[Your Name]

### Hello World
```js
helloworld() {
console.log("Hello World!!!");
}
```
````

- Example with multiple files:

  - Snippets/Email.md (with headings for email templates)
  - Snippets/Code.md (with headings for code snippets)

2. **Configure the Snippet File:**
   - In Obsidian, go to `Settings` > `Snippets Manager`.
   - Set the path to your snippet file (e.g., Snippets.md) or folder (e.g., Snippets/).

### Using Snippets Manager

1. **Search and Insert Snippets:**
   - Use the command palette (CMD/CTRL + P) and search for `Search Snippets`.
   - A fuzzy search modal will appear, allowing you to search for your snippets by their headings.
   - Press `Enter` to copy the snippet to your clipboard.
   - Press `CMD/CTRL + Enter` to paste the snippet directly at the cursor position in the active note.

2. **Keyboard Shortcuts:**
   - `Enter`: Copy the selected snippet to the clipboard.
   - `CMD/CTRL + Enter`: Copy the selected snippet to the clipboard and paste it at the cursor position in the active note.


## Development

### Requirements

- Node.js and npm
- TypeScript

### Building the Plugin

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/snippet-manager
   cd snippet-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the plugin:**
   ```bash
   npm run build
   ```

4. **Develop with live reload:**
   ```bash
   npm run dev
   ```

### Contributing

Contributions are welcome! If you have any bug reports, feature requests, or code improvements, feel free to open an issue or submit a pull request.

### License

This plugin is open-source software licensed under the MIT License.
