// translate.mjs
import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';

async function translateText(text, targetLanguage = 'ru', sourceLanguage = 'en') {
    const apiKey = 'AIzaSyCP5-GJVMKaNQePcHyCVZO9jmqeTrV8Px0';  // Replace with your API key
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
        const content = readFileSync(inputFile, 'utf8');

        // Define a regular expression to match YAML sections (adjust based on your specific format)
        const yamlRegex = '/^\s*---\s*.*?\s*---\s*$/gm';

        // Split the content into lines and remove YAML lines
        const lines = content.split(/\r?\n/);
        const translatedLines = lines.filter(line => !yamlRegex.test(line))
            .map(async line => await translateText(line, targetLanguage));

        // Wait for all translations and join them back with newlines
        const translatedContent = (await Promise.all(translatedLines)).join('\n');

        if (translatedContent) {
            writeFileSync(outputFile, translatedContent, 'utf8');
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
