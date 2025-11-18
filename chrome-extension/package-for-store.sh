#!/bin/bash

# Script to package the Chrome extension for publishing to Chrome Web Store and Edge Add-ons

echo "📦 Packaging Website Blocker Extension..."

# Extension directory
EXTENSION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$(dirname "$EXTENSION_DIR")"
OUTPUT_FILE="$OUTPUT_DIR/website-blocker-v1.0.0.zip"

# Files to exclude from the package
EXCLUDE_FILES=(
  "*.git*"
  "*.DS_Store"
  "README.md"
  "PUBLISHING_GUIDE.md"
  "PRIVACY_POLICY.md"
  "package-for-store.sh"
  "*.sh"
)

# Build exclude arguments for zip command
EXCLUDE_ARGS=""
for file in "${EXCLUDE_FILES[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS -x \"$file\""
done

# Create the ZIP file
cd "$EXTENSION_DIR"
echo "Creating ZIP file: $OUTPUT_FILE"

# Remove old ZIP if exists
rm -f "$OUTPUT_FILE"

# Create new ZIP
zip -r "$OUTPUT_FILE" . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "README.md" \
  -x "PUBLISHING_GUIDE.md" \
  -x "PRIVACY_POLICY.md" \
  -x "package-for-store.sh" \
  -x "*.sh"

if [ $? -eq 0 ]; then
  echo "✅ Successfully created package: $OUTPUT_FILE"
  echo ""
  echo "📊 Package contents:"
  unzip -l "$OUTPUT_FILE"
  echo ""
  echo "📏 Package size:"
  ls -lh "$OUTPUT_FILE" | awk '{print $5}'
  echo ""
  echo "Next steps:"
  echo "1. Review the package contents above"
  echo "2. Test the extension by loading the ZIP in Chrome"
  echo "3. Upload to Chrome Web Store: https://chrome.google.com/webstore/devconsole/"
  echo "4. Upload to Edge Add-ons: https://partner.microsoft.com/dashboard/microsoftedge/"
  echo ""
  echo "⚠️  Before publishing, make sure you:"
  echo "   - Update 'author' field in manifest.json"
  echo "   - Create icon images (16px, 48px, 128px)"
  echo "   - Take screenshots of the extension"
  echo "   - Review PUBLISHING_GUIDE.md"
else
  echo "❌ Failed to create package"
  exit 1
fi
