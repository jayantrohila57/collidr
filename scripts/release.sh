#!/bin/bash

# Release Script for collidr
# This script automates the release process with version management, changelog updates, and tagging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-head > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Get release type from argument
RELEASE_TYPE=$1
if [ -z "$RELEASE_TYPE" ]; then
    print_error "Release type is required. Usage: ./scripts/release.sh [patch|minor|major]"
    exit 1
fi

if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_error "Invalid release type. Must be one of: patch, minor, major"
    exit 1
fi

# Calculate next version
NEXT_VERSION=$(npm version $RELEASE_TYPE --no-git-tag-version --silent)
print_status "Next version: $NEXT_VERSION"

# Check if CHANGELOG.md exists
if [ ! -f "CHANGELOG.md" ]; then
    print_error "CHANGELOG.md not found. Please create it first."
    exit 1
fi

# Check if there are unreleased changes
if grep -q "\[Unreleased\]" CHANGELOG.md; then
    print_warning "Found [Unreleased] section in CHANGELOG.md"
    read -p "Do you want to move these changes to version $NEXT_VERSION? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update CHANGELOG.md
        RELEASE_DATE=$(date +%Y-%m-%d)
        
        # Create temporary file for changelog updates
        temp_changelog=$(mktemp)
        
        # Process changelog
        awk -v version="[$NEXT_VERSION]" -v date="$RELEASE_DATE" '
        /^\[Unreleased\]/ {
            in_unreleased = 1
            print version " - " date
            next
        }
        /^## \[/ && in_unreleased {
            in_unreleased = 0
            print "---"
            print
            print "## [Unreleased]"
            print
        }
        { print }
        ' CHANGELOG.md > "$temp_changelog"
        
        mv "$temp_changelog" CHANGELOG.md
        print_success "Updated CHANGELOG.md"
    fi
else
    print_warning "No [Unreleased] section found in CHANGELOG.md"
    read -p "Do you want to continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Release cancelled"
        exit 0
    fi
fi

# Stage version and changelog changes
git add package.json CHANGELOG.md

# Commit changes
print_status "Committing version and changelog changes"
git commit -m "chore: release version $NEXT_VERSION

- Bump version from $CURRENT_VERSION to $NEXT_VERSION
- Update CHANGELOG.md"

# Create annotated tag
print_status "Creating tag v$NEXT_VERSION"
git tag -a "v$NEXT_VERSION" -m "Release v$NEXT_VERSION

Version: $NEXT_VERSION
Release Type: $RELEASE_TYPE
Date: $(date +%Y-%m-%d)

Changes:
$(git log --oneline $(git describe --tags --abbrev=0 HEAD^)..HEAD)"

# Push changes and tag
print_status "Pushing changes and tag to remote"
git push origin main
git push origin "v$NEXT_VERSION"

print_success "Release v$NEXT_VERSION completed successfully!"
print_status "Summary:"
echo "  - Version updated from $CURRENT_VERSION to $NEXT_VERSION"
echo "  - CHANGELOG.md updated"
echo "  - Changes committed and pushed"
echo "  - Tag v$NEXT_VERSION created and pushed"

# Show next steps
echo
print_status "Next steps:"
echo "  1. Verify the release on GitHub/GitLab"
echo "  2. Update any documentation if needed"
echo "  3. Notify team members about the release"
echo "  4. Deploy to production if ready"

exit 0
