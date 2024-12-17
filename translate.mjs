import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';

// Regular expression to match YAML front matter (enclosed by ---)
const yamlFrontMatterRegex = /^---\n([\s\S]*?)\n---/;

async function translateText(text, targetLanguage = 'ru', sourceLanguage = 'en') {
  const apiKey = 'AIzaSyCP5-GJVMKaNQePcHyCVZO9jmqeTrV8Px0'; // Replace with your API key
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

async function translateMarkdownFile(inputFile, outputFile, targetLanguage) {
  try {
    // Ensure content is read as a string
    const content = readFileSync(inputFile, 'utf8');
    if (typeof content !== 'string') {
      throw new Error('File content is not a string');
    }

    // Extract YAML front matter (if any)
    const match = content.match(yamlFrontMatterRegex);
    let yamlFrontMatter = '';
    let modifiedContent = content;

    if (match) {
      // If YAML front matter exists, store and remove it from the content
      yamlFrontMatter = match[0]; // Capture the YAML front matter
      modifiedContent = content.replace(yamlFrontMatterRegex, ''); // Remove the YAML front matter for translation
    }

    // Translate the remaining content (without YAML front matter)
    const translatedContent = await translateText(modifiedContent, targetLanguage);

    if (translatedContent) {
      // Reinsert the YAML front matter back into the translated content
      const finalContent = yamlFrontMatter + translatedContent;

      // Write the final content to the output file
      writeFileSync(outputFile, finalContent, 'utf8');
      console.log('Translation complete. The translated file is saved as:', outputFile);
    }
  } catch (error) {
    console.error('Error processing the markdown file:', error);
  }
}

// Read command-line arguments for input/output paths and language
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const lang = process.argv[4];

translateMarkdownFile(inputFile, outputFile, lang);
