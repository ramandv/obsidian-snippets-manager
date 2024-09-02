
# Snippets Manager - Text Expansion Plugin for Obsidian

## Overview

The **Snippets Manager Plugin** for Obsidian allows you to manage and quickly insert text snippets stored in a markdown file. This plugin enhances your workflow by enabling fuzzy search for snippets, allowing you to copy them to your clipboard or directly paste them at the cursor position in your active note.

![Obsidian Snippet Manager](https://github.com/user-attachments/assets/95f10833-faff-4313-8263-89dae134c60b)


## Usecases

### I already use Text Expander kind of apps or plugins:
But does it work on your mobile? In most of the cases, that might be the case. But this plugin will work on your mobile too.

### Mobile Use:
I use Snippet Manager to quickly copy things like addresses, map locations, URLs, and quotes. With the help of the "[Website shortcut](https://play.google.com/store/apps/details?id=com.deltacdev.websiteshortcut&hl=en_IN)" Android app and the [Obsidian Advanced URI plugin](https://github.com/Vinzent03/obsidian-advanced-uri), I’ve set up a shortcut directly to the snippet search modal. Now, with just one click, I can copy whatever I need to my clipboard and paste it anywhere on my phone.


### Desktop Use:
On my desktop, Snippet Manager is my go-to tool for copying ChatGPT prompts. I’ve stored a bunch of prompts from [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts), and with Snippet Manager, I can quickly find and copy the one I need.


## Features

- **Snippet Management:** Store snippets in a markdown file with headings as keys (whether personal details like email signature, passport number, code snippets or anything).
- **Code Snippets**: The plugin supports code snippets stored in markdown code blocks. When retrieving a code snippet, the plugin automatically strips the backticks, providing you with just the clean code.
- **Fuzzy Search:** Quickly search through snippets using a fuzzy search interface.
- **Clipboard Copying:** Copy selected snippets to your clipboard.
- **Direct Insertion:** Paste snippets directly at the cursor position in the active markdown note.
- **Configurable Snippet File:** Choose which markdown file to use for storing and managing snippets.
- **Mobile Support:** The plugin is fully compatible with Obsidian's mobile app. You can easily create a shortcut to the Snippet Search using the Advanced URI plugin, making it even more convenient to search and copy snippets on the go.

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

1. **Create a Snippet File:**
   - Create a markdown file in your vault where you’ll store your snippets (e.g., `**S**nippets.md`).
   - In this file, each snippet should be under a heading (`### Heading`), where the heading is the snippet's title, and the content under the heading is the snippet itself.

   Example:
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

2. **Configure the Snippet File:**
   - In Obsidian, go to `Settings` > `Snippets Manager`.
   - Set the path to your snippet file (e.g., `Snippets.md`).

### Using Snippets Manager

1. **Search and Insert Snippets:**
   - Use the command palette (CMD/CTRL + P) and search for `Search Snippets`.
   - A fuzzy search modal will appear, allowing you to search for your snippets by their headings.
   - Press `Enter` to copy the snippet to your clipboard.
   - Press `CMD/CTRL + Enter` to paste the snippet directly at the cursor position in the active note.

2. **Keyboard Shortcuts:**
   - `Enter`: Copy the selected snippet to the clipboard.
   - `CMD/CTRL + Enter`: Copy the selected snippet to the clipboard and paste it at the cursor position in the active note.

## Configuration

- **Snippet File Path:**
  - Configure the path to the markdown file where your snippets are stored.
  - You can do this in the `Settings` > `Snippets Manager` section of Obsidian.

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
