#!/bin/bash
# Exclusion Helper for Repository Review Agents
# Source this file to get exclusion flags for grep, find, and other tools

EXCLUSION_FILE="${BASH_SOURCE%/*}/.review-exclusions"

# Generate --exclude-dir flags for grep
get_grep_exclusions() {
    local flags=""
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue

        # Remove trailing slashes and wildcards for directory names
        local dir="${line%/}"
        dir="${dir%%/**}"

        # Add --exclude-dir flag
        if [[ ! "$dir" =~ \* ]]; then
            flags="$flags --exclude-dir=$dir"
        fi
    done < "$EXCLUSION_FILE"
    echo "$flags"
}

# Generate -path exclusions for find
get_find_exclusions() {
    local conditions=""
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue

        # Remove trailing slashes
        local pattern="${line%/}"

        # Add -path condition
        if [[ -z "$conditions" ]]; then
            conditions="-path './$pattern' -prune"
        else
            conditions="$conditions -o -path './$pattern' -prune"
        fi
    done < "$EXCLUSION_FILE"
    echo "$conditions"
}

# Generate ripgrep exclusions
get_rg_exclusions() {
    local flags=""
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue

        # Add --glob flag
        flags="$flags --glob='!${line}'"
    done < "$EXCLUSION_FILE"
    echo "$flags"
}

# Check if a path should be excluded
should_exclude() {
    local check_path="$1"
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue

        # Check if path matches pattern
        case "$check_path" in
            $line) return 0 ;;  # Should exclude (return success)
        esac
    done < "$EXCLUSION_FILE"
    return 1  # Should not exclude (return failure)
}

# Export functions for use in other scripts
export -f get_grep_exclusions
export -f get_find_exclusions
export -f get_rg_exclusions
export -f should_exclude

# Convenience variables
export GREP_EXCLUSIONS="$(get_grep_exclusions)"
export FIND_EXCLUSIONS="$(get_find_exclusions)"
export RG_EXCLUSIONS="$(get_rg_exclusions)"