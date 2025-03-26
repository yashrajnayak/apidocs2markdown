# API Documentation to Markdown Converter

A powerful web tool that converts API documentation pages into clean, organized Markdown format.

## Features

- **One-Click Conversion**: Simply paste a URL and convert any public API documentation to Markdown
- **Live Preview**: See the converted Markdown in real-time with both raw and rendered views
- **Syntax Highlighting**: Code blocks are properly formatted with language-specific syntax highlighting
- **Smart Extraction**: Automatically identifies and extracts relevant content from documentation pages
- **Table Support**: Preserves table formatting in the converted Markdown
- **Download Option**: Export your converted documentation as a Markdown file

## Technical Architecture

### Core Components

- `App.tsx`: Main application component with URL input and conversion controls
- `Preview.tsx`: Handles both raw Markdown and rendered preview with syntax highlighting
- `ProgressBar.tsx`: Visual feedback for conversion progress

### Key Hooks

- `useDocumentConverter.ts`: Core conversion logic with the following features:
  - CORS-friendly document fetching using a proxy service
  - Smart content extraction with prioritized selectors
  - Custom HTML to Markdown conversion rules
  - Table structure preservation
  - Code block language detection
  - Link path normalization
  - Error handling and progress tracking

### HTML Processing Pipeline

1. **Fetching Content**
   - Uses axios with CORS proxy (api.allorigins.win)
   - Handles various HTTP errors (404, 403, 429)
   - 10-second timeout with automatic retry

2. **Content Extraction**
   - Removes non-essential elements (scripts, styles, nav, etc.)
   - Uses prioritized content selectors:
     ```typescript
     const contentSelectors = [
       'main', 'article', '.content', '.documentation',
       '.docs-content', '.api-content', '#main-content',
       '.markdown-body', '.readme', '.api-docs',
       '[role="main"]', '[role="article"]'
     ]
     ```
   - Falls back to largest content block if no matches

3. **HTML Cleaning**
   - Removes empty elements
   - Preserves essential attributes (class, href, src, alt, title)
   - Normalizes table structures (adds tbody, thead)
   - Escapes code blocks

4. **Markdown Conversion**
   - Custom TurndownService rules for:
     - Code blocks with language detection
     - Tables with alignment support
     - Links with path normalization
     - Definition lists
   - Post-processing for clean formatting

### Code Highlighting

Uses PrismLight for efficient syntax highlighting with support for:
- TypeScript/JavaScript
- Bash/Shell
- JSON
- Markdown
- GraphQL
- YAML
- HTTP

### Error Handling

Comprehensive error handling for:
- Invalid URLs
- Network timeouts
- Access forbidden (403)
- Not found (404)
- Rate limiting (429)
- Empty or insufficient content
- Malformed HTML

## Development

### Project Structure
```
src/
├── components/
│   ├── Preview.tsx      # Markdown preview component
│   └── ProgressBar.tsx  # Progress indicator
├── hooks/
│   └── useDocumentConverter.ts  # Core conversion logic
└── types.ts            # TypeScript type definitions
```

### Local Development

1. Clone and install dependencies:
```bash
git clone https://github.com/yashrajnayak/apidocs2markdown.git
cd apidocs2markdown
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Run linting:
```bash
npm run lint
```

### Environment Setup

The project uses:
- Vite for fast development and optimized builds
- TypeScript for type safety
- ESLint with React Hooks plugin
- Tailwind CSS with Typography plugin
- React 18 with Strict Mode

### Building for Production

Production builds include:
- Tree-shaking for minimal bundle size
- Automatic code splitting
- CSS minification
- Source maps generation

Build command:
```bash
npm run build
```

### Deployment

Automated GitHub Actions workflow:
- Triggered on push to main branch
- Builds production assets
- Deploys to GitHub Pages
- Configures SPA routing

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

Contributions are welcome! Please read our contributing guidelines before submitting a Pull Request.

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Add JSDoc comments for public APIs
- Keep components focused and composable

## License

This project is open source and available under the MIT License.

## Author

Created by [Yashraj Nayak](https://github.com/yashrajnayak)