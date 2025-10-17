import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';

// Regular expression to match YAML front matter (enclosed by ---)
const yamlFrontMatterRegex = /^---\n([\s\S]*?)\n---/;

async function translateText(text, targetLanguage, sourceLanguage = 'en', apiKey) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const body = JSON.stringify({ q: text, target: targetLanguage, source: sourceLanguage, format: 'text' });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    });
    const data = await response.json();
    if (response.ok) {
      return data.data.translations[0].translatedText;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error translating text:', error);
    return null;
  }
}

const codeBlockRegex = /(```[\s\S]*?```|<script[\s\S]*?>[\s\S]*?<\/script>|<code[\s\S]*?>[\s\S]*?<\/code>)/g;

/* 🆕 [ADDED FUNCTION] Add lang parameter to all URLs in the text */
function addLangParamToUrls(text, langCode) {
  // Match typical URLs (http, https)
  const urlRegex = /(https?:\/\/[^\s)'"<>]+)/g;
  return text.replace(urlRegex, (url) => {
    try {
      const urlObj = new URL(url);
      // Avoid duplicates if lang already exists
      if (!urlObj.searchParams.has('lang')) {
        urlObj.searchParams.append('lang', langCode);
      }
      return urlObj.toString();
    } catch {
      return url; // leave invalid URLs untouched
    }
  });
}
/* 🆕 [END OF ADDED FUNCTION] */

async function translateMarkdownFile(inputFile, outputFile, targetLanguage, apiKey) {
  try {
    // Read the file content
    const content = readFileSync(inputFile, 'utf8');
    if (typeof content !== 'string') {
      throw new Error('File content is not a string');
    }

    // Extract YAML front matter (if any)
    const match = content.match(yamlFrontMatterRegex);
    let yamlFrontMatter = '';
    let modifiedContent = content;

    if (match) {
      yamlFrontMatter = match[0]; // Capture the YAML front matter
      modifiedContent = content.replace(yamlFrontMatterRegex, ''); // Remove it from the content for translation
    }

    // Detect and extract code blocks
    const codeBlocks = [];
    const modifiedContentWithoutCodeBlocks = modifiedContent.replace(codeBlockRegex, (match) => {
      codeBlocks.push(match);
      return `<!--CODEBLOCK_${codeBlocks.length - 1}-->`; // Placeholder for code blocks
    });

    // Split the content into lines and analyze
    const lines = modifiedContentWithoutCodeBlocks.split('\n').map(line => {
      const matchIndentation = line.match(/^(\s*)/); // Capture leading whitespace
      const leadingWhitespace = matchIndentation ? matchIndentation[0] : '';

      if (line.startsWith('#') || line.startsWith('##')) {
        return { original: line, translated: line, leadingWhitespace }; // Keep headers as is
      } else if (line.trim() === '' || line.includes('<!--CODEBLOCK_')) {
        return { original: line, translated: line, leadingWhitespace }; // Skip placeholders or blank lines
      } else {
        return { original: line, translated: null, leadingWhitespace }; // Mark for translation
      }
    });

    // Extract text to translate
    const textToTranslate = lines
      .filter(line => line.translated === null)
      .map(line => line.original.trim()) // Remove leading/trailing whitespace for translation
      .join('\n');

    // Translate the text
    const translatedText = await translateText(textToTranslate, targetLanguage, 'en', apiKey);

    if (translatedText) {
      // Split the translated text into lines
      const translatedLines = translatedText.split('\n');
      let translatedLineIndex = 0;

      // Rebuild the final content with preserved indentation and placeholders
      const finalContent = lines.map(line => {
        if (line.translated === null) {
          const translated = translatedLines[translatedLineIndex++];
          return `${line.leadingWhitespace}${translated}`; // Reapply leading whitespace
        } else {
          return line.original; // Keep headers, blank lines, and placeholders intact
        }
      }).join('\n');

      // Reinsert code blocks into placeholders
      const finalContentWithCodeBlocks = finalContent.replace(/<!--CODEBLOCK_(\d+)-->/g, (_, index) => codeBlocks[index]);

     const finalContentWithLangUrls = finalContentWithCodeBlocks.replace(
  /https:\/\/mnpt-local-dev\.o18-test\.com\/new-server\/year\/2025\/oct\/script\.php\?lang=en/g,
  `https://mnpt-local-dev.o18-test.com/new-server/year/2025/oct/script.php?lang=${targetLanguage}`
);
      /* 🆕 [ADDED HERE] Add language parameter to URLs before writing the file */
      // const finalContentWithLangUrls = addLangParamToUrls(finalContentWithCodeBlocks, targetLanguage);
      /* 🆕 [END OF ADDITION] */

      // Combine YAML front matter with the translated content
      const finalContentWithYaml = yamlFrontMatter + '\n' + finalContentWithLangUrls;

      // Write to the output file
      writeFileSync(outputFile, finalContentWithYaml, 'utf8');
      console.log('Translation complete. File saved as:', outputFile);
    } else {
      console.error('Translation failed. No changes were written.');
    }
  } catch (error) {
    console.error('Error processing the markdown file:', error);
  }
}

// Read command-line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const targetLanguage = process.argv[4];
const apiKey = process.argv[5];

if (!inputFile || !outputFile || !targetLanguage || !apiKey) {
  console.error('Usage: node translate.mjs <inputFile> <outputFile> <targetLanguage> <apiKey>');
  process.exit(1);
}

translateMarkdownFile(inputFile, outputFile, targetLanguage, apiKey);

