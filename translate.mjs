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

    // Split the content into lines and mark non-header/non-blank lines for translation
    const lines = modifiedContent.split('\n').map(line => {
      if (line.startsWith('#') || line.startsWith('##')) {
        return { original: line, translated: line };  // Keep headers as is
      } else if (line.trim() === '') {
        return { original: line, translated: '' };  // Keep blank lines intact
      } else {
        return { original: line, translated: null };  // Mark for translation
      }
    });

    // Extract text to translate
    const textToTranslate = lines
      .filter(line => line.translated === null)
      .map(line => line.original)
      .join('\n');

    // Translate the text
    const translatedText = await translateText(textToTranslate, targetLanguage, 'en', apiKey);

    if (translatedText) {
      // Split the translated text into lines
      const translatedLines = translatedText.split('\n');
      let translatedLineIndex = 0;

      // Rebuild the final content
      const finalContent = lines.map(line => {
        if (line.translated === null) {
          return { ...line, translated: translatedLines[translatedLineIndex++] };
        } else {
          return line;  // Keep headers and blank lines intact
        }
      });

      // Combine YAML front matter with the translated content
      const finalContentWithYaml = yamlFrontMatter + '\n' + finalContent.map(line => line.translated).join('\n');

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
