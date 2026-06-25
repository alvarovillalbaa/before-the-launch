#!/usr/bin/env python3
"""
translate_i18n.py — Translate i18n JSON locale files to multiple languages.

Recursively translates all string values in a JSON file while preserving
structure, keys, URLs, and non-string values (numbers, booleans, null).

Usage
-----
Single language:
    python scripts/translate_i18n.py locales/en.json --target-lang Spanish --output locales/es.json

Multiple languages at once:
    python scripts/translate_i18n.py locales/en.json --target-langs Spanish French German --output-dir locales/

Using Anthropic (Claude) instead of OpenAI:
    python scripts/translate_i18n.py locales/en.json --target-lang French \\
        --output locales/fr.json --provider anthropic

Requirements
------------
    pip install requests

Environment variables (set one for your provider):
    OPENAI_API_KEY
    ANTHROPIC_API_KEY
    GROQ_API_KEY
    PERPLEXITY_API_KEY
    OPENROUTER_API_KEY
    DEEPSEEK_API_KEY
    X_API_KEY
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import requests


# ---------------------------------------------------------------------------
# Multi-provider AI client
# ---------------------------------------------------------------------------

PROVIDER_CONFIGS: Dict[str, Dict] = {
    "openai": {
        "endpoint": "https://api.openai.com/v1/chat/completions",
        "headers": lambda key: {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        "default_model": "gpt-4.1-mini",
        "env_var": "OPENAI_API_KEY",
    },
    "anthropic": {
        "endpoint": "https://api.anthropic.com/v1/messages",
        "headers": lambda key: {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        "default_model": "claude-sonnet-4-6",
        "env_var": "ANTHROPIC_API_KEY",
    },
    "groq": {
        "endpoint": "https://api.groq.com/openai/v1/chat/completions",
        "headers": lambda key: {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        "default_model": "llama-3.3-70b-versatile",
        "env_var": "GROQ_API_KEY",
    },
    "perplexity": {
        "endpoint": "https://api.perplexity.ai/chat/completions",
        "headers": lambda key: {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        "default_model": "sonar",
        "env_var": "PERPLEXITY_API_KEY",
    },
    "openrouter": {
        "endpoint": "https://openrouter.ai/api/v1/chat/completions",
        "headers": lambda key: {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        "default_model": "deepseek/deepseek-r1",
        "env_var": "OPENROUTER_API_KEY",
    },
    "deepseek": {
        "endpoint": "https://api.deepseek.com/v1/chat/completions",
        "headers": lambda key: {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        "default_model": "deepseek-chat",
        "env_var": "DEEPSEEK_API_KEY",
    },
    "x": {
        "endpoint": "https://api.x.ai/v1/chat/completions",
        "headers": lambda key: {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        "default_model": "grok-3-mini",
        "env_var": "X_API_KEY",
    },
}


def _get_api_key(provider: str, api_key: Optional[str] = None) -> str:
    config = PROVIDER_CONFIGS[provider]
    key = api_key or os.environ.get(config["env_var"], "")
    if not key:
        raise ValueError(
            f"No API key for '{provider}'. Set {config['env_var']} or pass --api-key."
        )
    return key


def _call_api(
    provider: str,
    prompt: str,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1000,
) -> str:
    config = PROVIDER_CONFIGS[provider]
    key = _get_api_key(provider, api_key)
    resolved_model = model or config["default_model"]

    messages = [{"role": "user", "content": prompt}]
    payload: Dict[str, Any] = {
        "model": resolved_model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    # Anthropic uses a different system-prompt key; system prompt is not needed here
    response = requests.post(
        config["endpoint"],
        headers=config["headers"](key),
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()

    if provider == "anthropic":
        return data.get("content", [{}])[0].get("text", "").strip()
    else:
        return data["choices"][0]["message"]["content"].strip()


# ---------------------------------------------------------------------------
# Translation helpers
# ---------------------------------------------------------------------------

_URL_RE = re.compile(
    r"^https?://"
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|localhost|\d{1,3}(?:\.\d{1,3}){3})"
    r"(?::\d+)?(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)


def _is_url(text: str) -> bool:
    return bool(_URL_RE.match(text.strip()))


def _translate_string(
    text: str,
    source_lang: str,
    target_lang: str,
    provider: str,
    model: Optional[str],
    api_key: Optional[str],
) -> str:
    if not text or _is_url(text):
        return text

    prompt = (
        f"Translate the following UI text from {source_lang} to {target_lang}. "
        "Return only the translated text with no explanation, quotes, or extra formatting. "
        "Preserve any {{placeholder}} variables exactly as they appear:\n\n"
        f"{text}"
    )
    return _call_api(provider, prompt, api_key=api_key, model=model)


def _process(
    node: Any,
    source_lang: str,
    target_lang: str,
    provider: str,
    model: Optional[str],
    api_key: Optional[str],
    verbose: bool,
    _path: str = "",
) -> Any:
    if isinstance(node, dict):
        return {
            k: _process(v, source_lang, target_lang, provider, model, api_key, verbose, f"{_path}.{k}" if _path else k)
            for k, v in node.items()
        }
    if isinstance(node, list):
        return [
            _process(item, source_lang, target_lang, provider, model, api_key, verbose, f"{_path}[{i}]")
            for i, item in enumerate(node)
        ]
    if isinstance(node, str):
        if verbose:
            preview = node[:60].replace("\n", " ")
            print(f"  translating [{_path}]: {preview!r}")
        return _translate_string(node, source_lang, target_lang, provider, model, api_key)
    return node  # numbers, booleans, null — unchanged


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _lang_to_filename_suffix(lang: str) -> str:
    """Convert a language name like 'Spanish' → 'es', 'French' → 'fr', etc."""
    mapping = {
        "arabic": "ar", "chinese": "zh", "czech": "cs", "danish": "da",
        "dutch": "nl", "english": "en", "finnish": "fi", "french": "fr",
        "german": "de", "greek": "el", "hebrew": "he", "hindi": "hi",
        "hungarian": "hu", "indonesian": "id", "italian": "it", "japanese": "ja",
        "korean": "ko", "norwegian": "no", "polish": "pl", "portuguese": "pt",
        "romanian": "ro", "russian": "ru", "spanish": "es", "swedish": "sv",
        "thai": "th", "turkish": "tr", "ukrainian": "uk", "vietnamese": "vi",
    }
    return mapping.get(lang.lower(), lang.lower()[:2])


def main(argv: Optional[List[str]] = None) -> None:
    parser = argparse.ArgumentParser(
        description="Translate i18n JSON locale files to one or more languages.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("input_file", help="Source JSON locale file (e.g. locales/en.json)")

    # Output — either single file or directory for multi-language
    out_group = parser.add_mutually_exclusive_group()
    out_group.add_argument("--output", "-o", help="Output file path (single language only)")
    out_group.add_argument(
        "--output-dir",
        help="Output directory when translating to multiple languages. "
             "Files are named <lang_code>.json.",
    )

    lang_group = parser.add_mutually_exclusive_group(required=True)
    lang_group.add_argument("--target-lang", help="Single target language (e.g. Spanish)")
    lang_group.add_argument(
        "--target-langs",
        nargs="+",
        metavar="LANG",
        help="Multiple target languages (e.g. Spanish French German)",
    )

    parser.add_argument("--source-lang", default="English", help="Source language (default: English)")
    parser.add_argument(
        "--provider",
        default="openai",
        choices=list(PROVIDER_CONFIGS.keys()),
        help="AI provider (default: openai)",
    )
    parser.add_argument("--model", default=None, help="Model override (default: provider's default)")
    parser.add_argument("--api-key", default=None, help="API key (overrides environment variable)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Print each key being translated")

    args = parser.parse_args(argv)

    # Resolve language list
    target_langs: List[str] = args.target_langs if args.target_langs else [args.target_lang]

    # Validate output args
    if len(target_langs) > 1 and args.output:
        parser.error("--output can only be used with a single --target-lang. Use --output-dir for multiple languages.")

    # Load source JSON
    try:
        with open(args.input_file, encoding="utf-8") as f:
            source_data = json.load(f)
    except Exception as e:
        print(f"Error loading {args.input_file}: {e}", file=sys.stderr)
        sys.exit(1)

    for lang in target_langs:
        print(f"\nTranslating → {lang} (provider: {args.provider})...")

        try:
            translated = _process(
                source_data,
                args.source_lang,
                lang,
                args.provider,
                args.model,
                args.api_key,
                args.verbose,
            )
        except Exception as e:
            print(f"  Error during translation: {e}", file=sys.stderr)
            sys.exit(1)

        # Determine output path
        if args.output:
            out_path = Path(args.output)
        elif args.output_dir:
            out_dir = Path(args.output_dir)
            out_dir.mkdir(parents=True, exist_ok=True)
            suffix = _lang_to_filename_suffix(lang)
            out_path = out_dir / f"{suffix}.json"
        else:
            # Default: alongside input file, named by language code
            suffix = _lang_to_filename_suffix(lang)
            out_path = Path(args.input_file).parent / f"{suffix}.json"

        try:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(translated, f, ensure_ascii=False, indent=2)
            print(f"  Saved → {out_path}")
        except Exception as e:
            print(f"  Error saving {out_path}: {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
