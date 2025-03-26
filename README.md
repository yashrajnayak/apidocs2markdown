# API Documentation to Markdown Converter

A powerful web tool that converts API documentation pages into clean, organized Markdown format.

## Features

- **One-Click Conversion**: Simply paste a URL and convert any public API documentation to Markdown
- **Live Preview**: See the converted Markdown in real-time with both raw and rendered views
- **Syntax Highlighting**: Code blocks are properly formatted with language-specific syntax highlighting
- **Smart Extraction**: Automatically identifies and extracts relevant content from documentation pages
- **Table Support**: Preserves table formatting in the converted Markdown
- **Download Option**: Export your converted documentation as a Markdown file

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yashrajnayak/apidocs2markdown.git
cd apidocs2markdown
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed.

## How It Works

1. Enter the URL of any public API documentation page
2. The tool fetches the content while preserving the structure
3. Smart content extraction removes unnecessary elements like navigation and ads
4. Converts the cleaned HTML to well-formatted Markdown
5. Provides both raw Markdown and rendered preview
6. Download the result as a Markdown file

## Technologies Used

- React
- TypeScript
- Vite
- TailwindCSS
- cheerio (for HTML parsing)
- turndown (for HTML to Markdown conversion)
- React Markdown (for preview rendering)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

Created by [Yashraj Nayak](https://github.com/yashrajnayak)