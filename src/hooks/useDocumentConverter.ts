import { useState } from 'react';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import type { ConversionState } from '../types';

// Add type definitions for turndown parameters
interface TurndownNode {
  nodeType: number;
  tagName?: string;
  className?: string;
  getAttribute?: (name: string) => string | null;
}

export function useDocumentConverter(): ConversionState {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ConversionState['status']>('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [markdown, setMarkdown] = useState<string>();
  const [error, setError] = useState<string>();

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
    bulletListMarker: '-',
    fence: '```',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
  });

  // Add custom rules for better HTML to Markdown conversion
  turndownService.addRule('codeBlocks', {
    filter: ['pre', 'code'],
    replacement: function(content: string, node: TurndownNode) {
      // Try to detect language from class names
      const languageClasses = node.className?.match(/(?:language|lang)-(\w+)/);
      const dataLanguage = node.getAttribute?.('data-language');
      const language = languageClasses?.[1] || dataLanguage || '';
      
      // Clean up the content
      let cleanContent = content.trim()
        .replace(/^\n+|\n+$/g, '') // Remove leading/trailing newlines
        .replace(/\n\s*\n/g, '\n'); // Remove multiple blank lines
      
      return '\n```' + language + '\n' + cleanContent + '\n```\n';
    }
  });

  // Add custom rule for tables
  turndownService.addRule('tables', {
    filter: ['table'],
    replacement: function(content: string, node: TurndownNode) {
      if (!(node instanceof HTMLElement)) return content;

      const $ = cheerio.load(node as unknown as cheerio.AnyNode);
      let markdown = '\n';

      // Process headers
      const headers: string[] = [];
      const alignments: string[] = [];
      
      // Try to get headers from thead first, then first row
      let headerElements = $('thead tr th');
      if (headerElements.length === 0) {
        headerElements = $('tr:first-child td, tr:first-child th');
      }

      // If no headers found, create default ones
      if (headerElements.length === 0) {
        const columnCount = Math.max(
          ...Array.from($('tr')).map(row => $(row).find('td').length)
        );
        for (let i = 0; i < columnCount; i++) {
          headers.push('Column ' + (i + 1));
          alignments.push(':---:');
        }
      } else {
        headerElements.each((_, th) => {
          const header = $(th).text().trim() || ' '; // Use space for empty headers
          headers.push(header);
          alignments.push(':---:');
        });
      }

      // Add headers
      markdown += '| ' + headers.join(' | ') + ' |\n';
      markdown += '| ' + alignments.join(' | ') + ' |\n';

      // Process rows
      $('tbody tr, thead tr:not(:first-child), tr:not(:first-child)').each((_, tr) => {
        const cells: string[] = [];
        $(tr).find('td, th').each((_, td) => {
          let cellContent = $(td).text().trim();
          // Replace empty cells with a space to maintain table structure
          cells.push(cellContent || ' ');
        });
        
        // Ensure row has same number of columns as header
        while (cells.length < headers.length) {
          cells.push(' ');
        }
        
        if (cells.length > 0) {
          markdown += '| ' + cells.join(' | ') + ' |\n';
        }
      });

      return markdown + '\n';
    }
  });

  // Add custom rule for links
  turndownService.addRule('links', {
    filter: ['a'],
    replacement: function(content: string, node: TurndownNode) {
      if (!(node instanceof HTMLElement)) return content;
      const href = node.getAttribute?.('href') || '';
      const title = node.getAttribute?.('title');
      
      if (!href) return content;
      
      const normalizedHref = href.startsWith('http') ? href : new URL(href, url).toString();
      const titlePart = title ? ` "${title}"` : '';
      
      return `[${content}](${normalizedHref}${titlePart})`;
    }
  });

  // Add custom rule for definition lists
  turndownService.addRule('definitionList', {
    filter: ['dl'],
    replacement: function(content: string) {
      return '\n' + content + '\n';
    }
  });

  turndownService.addRule('definitionTerm', {
    filter: ['dt'],
    replacement: function(content: string) {
      return '\n**' + content + '**\n';
    }
  });

  turndownService.addRule('definitionDescription', {
    filter: ['dd'],
    replacement: function(content: string) {
      return content + '\n';
    }
  });

  async function fetchDocument(url: string): Promise<string> {
    try {
      // Use a CORS proxy to fetch the content
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await axios.get(proxyUrl, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'User-Agent': 'Mozilla/5.0 (compatible; APIDocsConverter/1.0;)'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        } else if (error.response?.status === 404) {
          throw new Error('The specified API documentation page was not found.');
        } else if (error.response?.status === 403) {
          throw new Error('Access to the documentation is forbidden. Please check the URL.');
        } else if (error.response?.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else {
          throw new Error(`Failed to fetch document: ${error.message}`);
        }
      }
      throw error;
    }
  }

  async function processHTML(html: string): Promise<string> {
    const $ = cheerio.load(html);
    
    // Remove unnecessary elements
    $('script, style, nav, footer, header, .navigation, .sidebar, .menu, .ads, iframe, .cookie-banner, #cookie-banner').remove();
    
    // Common documentation content selectors
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.documentation',
      '.docs-content',
      '.api-content',
      '#main-content',
      '.markdown-body',
      '.readme',
      '.api-docs',
      '[role="main"]',
      '[role="article"]',
      '.main-content',
      '#docs-content'
    ];
    
    // Try to find the main content using various selectors
    let mainContent = $();
    for (const selector of contentSelectors) {
      mainContent = $(selector).first();
      if (mainContent.length && mainContent.text().trim().length > 100) {
        break;
      }
    }
    
    // If no specific content container found, try to identify the largest content block
    if (!mainContent.length || mainContent.text().trim().length < 100) {
      let maxTextLength = 0;
      $('body').find('div').each((_, element) => {
        const $element = $(element);
        const textLength = $element.text().trim().length;
        if (textLength > maxTextLength && textLength > 100) {
          maxTextLength = textLength;
          mainContent = $element;
        }
      });
    }

    // Fix cheerio type usage
    const contentToConvert = mainContent.length ? mainContent : $('body');
    
    contentToConvert.find('*').each((_, element) => {
      const $element = $(element);
      // Remove empty elements
      if (!$element.text().trim() && !$element.find('img').length) {
        $element.remove();
        return;
      }
      // Preserve essential attributes
      const preservedAttrs = ['class', 'href', 'src', 'alt', 'title'];
      const attrs = Object.keys(element.attribs || {});
      attrs.forEach(attr => {
        if (!preservedAttrs.includes(attr)) {
          $element.removeAttr(attr);
        }
      });
    });

    // Improve table handling
    contentToConvert.find('table').each((_, table) => {
      const $table = $(table);
      // Ensure table has tbody
      if (!$table.find('tbody').length) {
        $table.find('tr').wrapAll('<tbody></tbody>');
      }
      // Ensure table has thead if first row contains th
      if ($table.find('tr:first-child th').length && !$table.find('thead').length) {
        $table.find('tr:first-child').wrap('<thead></thead>');
      }
    });

    // Improve code block handling
    contentToConvert.find('pre code').each((_, elem) => {
      const $elem = $(elem);
      const language = $elem.attr('class')?.match(/language-(\w+)/)?.[1] || '';
      $elem.html($elem.html()?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '');
      if (language) {
        $elem.parent().attr('class', `language-${language}`);
      }
    });
    
    // Convert HTML to Markdown
    let markdown = turndownService.turndown(contentToConvert.html() || '');
    
    // Post-process markdown for better formatting
    markdown = markdown
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/```\n\n/g, '```\n') // Fix code block spacing
      .replace(/\n\n\n/g, '\n\n') // Normalize spacing
      .replace(/(\[[^\]]*\]\([^\)]*\))\s*\n\s*(?=\[[^\]]*\]\([^\)]*\))/g, '$1 ') // Join consecutive links
      .replace(/\|\s*\n\s*\|/g, '|\n|') // Fix table formatting
      .trim();

    if (!markdown.trim()) {
      throw new Error('No content could be extracted. The page might be protected or require authentication.');
    }

    if (markdown.length < 100) {
      throw new Error('The extracted content seems too short. Please check if the URL points to the correct documentation page.');
    }

    return markdown;
  }

  const startConversion = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      setStatus('error');
      return;
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Please enter a valid HTTP or HTTPS URL');
      }

      setStatus('fetching');
      setMessage('Fetching documentation...');
      setProgress(20);
      setError(undefined);
      
      const html = await fetchDocument(url);
      
      setStatus('converting');
      setMessage('Converting to Markdown...');
      setProgress(60);
      
      const markdownContent = await processHTML(html);
      
      setMarkdown(markdownContent);
      setStatus('completed');
      setMessage('Conversion completed successfully!');
      setProgress(100);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setProgress(0);
    }
  };

  const downloadMarkdown = () => {
    if (!markdown) return;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-documentation.md';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    url,
    setUrl,
    status,
    message,
    progress,
    markdown,
    error,
    startConversion,
    downloadMarkdown,
  };
}