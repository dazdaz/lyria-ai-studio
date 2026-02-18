#!/bin/bash
# Quick installer for Bash 4+ on macOS
# This script helps you install and configure Bash 4+ for the deployment script

set -e

echo "============================================="
echo "  Bash 4+ Installer for macOS"
echo "============================================="
echo ""

# Check current Bash version
CURRENT_VERSION=$(bash --version | head -1)
echo "Current Bash: $CURRENT_VERSION"
echo ""

if [[ "${BASH_VERSINFO[0]}" -ge 4 ]]; then
    echo "✅ You already have Bash 4+!"
    echo "You can run the deployment script directly:"
    echo "  ./deploy-cloud-run.sh --help"
    exit 0
fi

echo "❌ You have Bash 3.x (macOS default)"
echo ""
echo "Installing Bash 4+ via Homebrew..."
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

echo "Installing bash via Homebrew..."
brew install bash

echo ""
echo "============================================="
echo "  ✅ Installation Complete!"
echo "============================================="
echo ""
echo "Bash 4+ is now installed at:"

if [[ -f /opt/homebrew/bin/bash ]]; then
    BASH4_PATH="/opt/homebrew/bin/bash"
elif [[ -f /usr/local/bin/bash ]]; then
    BASH4_PATH="/usr/local/bin/bash"
else
    BASH4_PATH=$(brew --prefix)/bin/bash
fi

echo "  $BASH4_PATH"
echo ""
$BASH4_PATH --version | head -1
echo ""

echo "To use it with the deployment script:"
echo ""
echo "Option 1: Run directly (recommended for one-time use)"
echo "  $BASH4_PATH deploy-cloud-run.sh --help"
echo ""
echo "Option 2: Update your PATH (recommended for regular use)"
echo "  Add this to your ~/.zshrc or ~/.bash_profile:"
echo "    export PATH=\"$(brew --prefix)/bin:\$PATH\""
echo ""
echo "  Then reload your shell:"
echo "    source ~/.zshrc"
echo ""
echo "  After that, you can run:"
echo "    ./deploy-cloud-run.sh --help"
echo ""

# Offer to update PATH automatically
read -p "Would you like to update your PATH now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SHELL_RC="$HOME/.zshrc"
    if [[ ! -f "$SHELL_RC" ]]; then
        SHELL_RC="$HOME/.bash_profile"
    fi
    
    if ! grep -q "$(brew --prefix)/bin" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# Added by deploy-cloud-run installer" >> "$SHELL_RC"
        echo "export PATH=\"$(brew --prefix)/bin:\$PATH\"" >> "$SHELL_RC"
        echo "✅ Updated $SHELL_RC"
        echo ""
        echo "Run this to activate:"
        echo "  source $SHELL_RC"
    else
        echo "PATH already includes Homebrew's bin directory"
    fi
fi

echo ""
echo "============================================="
echo "You can now run the deployment script!"
echo "============================================="
