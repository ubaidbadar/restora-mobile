#!/usr/bin/env python3
"""Reject known deprecated APIs and accidental toolchain regressions in native preview.

This complements (but does not replace) Gradle compilation, Android Lint, and device QA.
"""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BAD_SOURCE = {
    "Legacy password transformation": r"\bPasswordVisualTransformation\b",
    "Value-based Compose text field": r"\b(?:OutlinedTextField|TextField)\s*\(\s*value\s*=",
    "Legacy input callback": r"\bonValueChange\s*=",
    "Legacy Kotlin Gradle options": r"\bkotlinOptions\s*\{",
    "Deprecated lifecycle launches": r"\blaunchWhen(?:Created|Started|Resumed)\b",
    "Deprecated activity result callbacks": r"\b(?:startActivityForResult|onActivityResult)\s*\(",
    "Deprecated external storage lookup": r"\bgetExternalStoragePublicDirectory\s*\(",
    "Legacy material icon package": r"\bandroidx\.compose\.material\.icons\b",
    "Deprecation suppression": r'@Suppress\s*\(\s*["\x27]DEPRECATION["\x27]',
    "Deprecated declaration": r"@Deprecated\b",
}
errors: list[str] = []
paths = list((ROOT / "app" / "src").rglob("*.kt")) + list(ROOT.rglob("*.gradle.kts"))
for path in paths:
    text = path.read_text(encoding="utf-8")
    for label, pattern in BAD_SOURCE.items():
        for match in re.finditer(pattern, text):
            line = text.count("\n", 0, match.start()) + 1
            errors.append(f"{path.relative_to(ROOT)}:{line}: {label}")

gradle = (ROOT / "app" / "build.gradle.kts").read_text(encoding="utf-8")
root_gradle = (ROOT / "build.gradle.kts").read_text(encoding="utf-8")
wrapper = (ROOT / "gradle" / "wrapper" / "gradle-wrapper.properties").read_text(encoding="utf-8")
required = {
    "AGP pinned to 9.3.3": ('9.3.3', root_gradle),
    "Compose Compiler pinned to Kotlin 2.4.21": ('org.jetbrains.kotlin.plugin.compose") version "2.4.21"', root_gradle),
    "Gradle wrapper 9.5": ('gradle-9.5.0-bin.zip', wrapper),
    "Compile SDK 37": ("compileSdk = 37", gradle),
    "Stable Compose BOM": ("androidx.compose:compose-bom:2026.09.00", gradle),
    "Correct Play Store application ID": ('applicationId = "com.restoralive.app"', gradle),
    "Kotlin warnings are errors": ("allWarningsAsErrors.set(true)", gradle),
    "Android lint warnings are errors": ("warningsAsErrors = true", gradle),
}
for label, (needle, text) in required.items():
    if needle not in text:
        errors.append(f"Missing expected configuration: {label}")

# The registered Firebase client must belong to the same Android application ID.
firebase_config = ROOT / "app" / "google-services.json"
if not firebase_config.is_file():
    errors.append("Missing supplied app/google-services.json")
else:
    try:
        payload = json.loads(firebase_config.read_text(encoding="utf-8"))
        packages = {
            entry["client_info"]["android_client_info"]["package_name"]
            for entry in payload.get("client", [])
        }
        if "com.restoralive.app" not in packages:
            errors.append("Firebase Android package does not match the application ID")
    except (ValueError, KeyError, TypeError) as exc:
        errors.append(f"Invalid Firebase client configuration: {exc}")

if errors:
    print("Android source audit failed:")
    print("\n".join(f" - {error}" for error in errors))
    sys.exit(1)

print(f"Android source audit passed: {len(paths)} Kotlin / Gradle files scanned.")
print("Build and device tests are still required to verify API deprecation and behavior.")
