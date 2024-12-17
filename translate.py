import os
from google.cloud import translate_v2 as translate

def translate_text(target: str, text: str, api_key: str):
    """Translates text into the target language.

    Target must be an ISO 639-1 language code.
    See https://g.co/cloud/translate/v2/translate-reference#supported_languages

    Args:
        target (str): ISO 639-1 language code for translation.
        text (str): Text to be translated.
        api_key (str): Your Google Cloud API key.

    Returns:
        str: The translated text.
    """
    translate_client = translate.Client(credentials=translate.Credentials(api_key))

    if isinstance(text, bytes):
        text = text.decode("utf-8")

    result = translate_client.translate(text, target_language=target)
    print(f"Translating text: {text[:100]}... to language: {target}")
    print(f"Translation result: {result['translatedText']}")

    return result['translatedText']

def translate_md_files_in_directory(target_language: str, api_key: str):
    """Translates all Markdown (.md) files in the 'en' directory to the target language."""
    source_dir = "en"
    target_dir = target_language

    if not os.path.exists(source_dir):
        print(f"Source directory '{source_dir}' does not exist.")
        return

    os.makedirs(target_dir, exist_ok=True)

    for root, _, files in os.walk(source_dir):
        for file in files:
            if file.endswith(".md"):
                source_file = os.path.join(root, file)
                relative_path = os.path.relpath(source_file, source_dir)
                target_file = os.path.join(target_dir, relative_path)

                os.makedirs(os.path.dirname(target_file), exist_ok=True)

                with open(source_file, "r", encoding="utf-8") as f:
                    content = f.read()

                translated_content = translate_text(target_language, content, api_key)

                with open(target_file, "w", encoding="utf-8") as f:
                    f.write(translated_content)

                print(f"Translated {source_file} -> {target_file}")

if __name__ == "__main__":
    api_key = input("Enter your Google Cloud API key: ")
    target_language = input("Enter the target language code (e.g., 'es' for Spanish): ").strip()
    translate_md_files_in_directory(target_language, api_key)
