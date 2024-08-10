I work on the plugin in my spare time, and I appreciate any kind of support!

✨ [Check out latest updates](https://github.com/ramandv/obsidian-snippets-manager/releases)<br>
🪲 [Report bugs and suggest features](https://github.com/ramandv/obsidian-snippets-manager/issues)<br>
❓ [Ask questions](https://github.com/ramandv/obsidian-snippets-manager/discussions/new?category=q-a)<br>
👍 [Give thumbs up to issues important to you](https://github.com/ramandv/obsidian-snippets-manager/issues)<br>


# Snippets Manager Plugin for Obsidian

## Overview

The **Snippets Manager Plugin** for Obsidian allows you to manage and quickly insert text snippets stored in a markdown file. This plugin enhances your workflow by enabling fuzzy search for snippets, allowing you to copy them to your clipboard or directly paste them at the cursor position in your active note.

## Features

- **Snippet Management:** Store snippets in a markdown file with headings as keys (whether personal details like email signature, passport number, code snippets or anything).
- **Code Snippets**: The plugin supports code snippets stored in markdown code blocks. When retrieving a code snippet, the plugin automatically strips the backticks, providing you with just the clean code.
- **Fuzzy Search:** Quickly search through snippets using a fuzzy search interface.
- **Clipboard Copying:** Copy selected snippets to your clipboard.
- **Direct Insertion:** Paste snippets directly at the cursor position in the active markdown note.
- **Configurable Snippet File:** Choose which markdown file to use for storing and managing snippets.

## Installation

1. **Manual Installation:**
   - Download or clone this repository.
   - Build the plugin by running the following command:
     ```bash
     npm install
     npm run build
     ```
   - Copy the contents of the `dist` folder into your Obsidian plugins directory: `your-vault/.obsidian/plugins/snippet-manager`.
   - Enable the plugin from the Obsidian Settings under `Community Plugins`.

2. **Obsidian Community Plugins:**
   - This plugin may also be available in the Obsidian community plugins list. If so, you can install it directly from Obsidian:
     - Go to `Settings` > `Community Plugins` > `Browse`.
     - Search for `Snippets Manager`.
     - Click `Install` and then `Enable`.

## Usage

### Setting Up Snippets

1. **Create a Snippet File:**
   - Create a markdown file in your vault where you’ll store your snippets (e.g., `Snippets.md`).
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
