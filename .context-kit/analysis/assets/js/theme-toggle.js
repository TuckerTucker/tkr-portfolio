/**
 * Theme Toggle Utility
 * Manages light/dark theme switching with system preference detection
 */

(function() {
    'use strict';

    /**
     * Theme Manager
     */
    const ThemeManager = {
        STORAGE_KEY: 'tkr-analysis-theme',
        THEMES: {
            LIGHT: 'light',
            DARK: 'dark',
            AUTO: 'auto'
        },

        /**
         * Initialize theme manager
         */
        init() {
            this.currentTheme = this.getStoredTheme();
            this.applyTheme(this.currentTheme);
            this.createToggleButton();
            this.setupMediaQueryListener();
        },

        /**
         * Get stored theme preference
         * @returns {string} Theme preference
         */
        getStoredTheme() {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored && Object.values(this.THEMES).includes(stored)) {
                return stored;
            }
            return this.THEMES.AUTO;
        },

        /**
         * Get system theme preference
         * @returns {string} 'light' or 'dark'
         */
        getSystemTheme() {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return this.THEMES.DARK;
            }
            return this.THEMES.LIGHT;
        },

        /**
         * Get effective theme (resolves 'auto' to actual theme)
         * @returns {string} 'light' or 'dark'
         */
        getEffectiveTheme() {
            if (this.currentTheme === this.THEMES.AUTO) {
                return this.getSystemTheme();
            }
            return this.currentTheme;
        },

        /**
         * Apply theme to document
         * @param {string} theme - Theme to apply
         */
        applyTheme(theme) {
            this.currentTheme = theme;
            const effectiveTheme = this.getEffectiveTheme();

            // Update data attribute
            document.documentElement.setAttribute('data-theme', effectiveTheme);

            // Store preference
            localStorage.setItem(this.STORAGE_KEY, theme);

            // Update meta theme-color for mobile browsers
            this.updateMetaThemeColor(effectiveTheme);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('themechange', {
                detail: { theme: effectiveTheme, preference: theme }
            }));
        },

        /**
         * Update meta theme-color tag
         * @param {string} theme - Current theme
         */
        updateMetaThemeColor(theme) {
            let metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (!metaThemeColor) {
                metaThemeColor = document.createElement('meta');
                metaThemeColor.setAttribute('name', 'theme-color');
                document.head.appendChild(metaThemeColor);
            }

            const colors = {
                light: '#f8fafc',
                dark: '#0f172a'
            };

            metaThemeColor.setAttribute('content', colors[theme]);
        },

        /**
         * Toggle theme
         */
        toggleTheme() {
            const themes = [this.THEMES.LIGHT, this.THEMES.DARK, this.THEMES.AUTO];
            const currentIndex = themes.indexOf(this.currentTheme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];

            this.applyTheme(nextTheme);
            this.updateToggleButton();
        },

        /**
         * Set specific theme
         * @param {string} theme - Theme to set
         */
        setTheme(theme) {
            if (!Object.values(this.THEMES).includes(theme)) {
                console.error('Invalid theme:', theme);
                return;
            }

            this.applyTheme(theme);
            this.updateToggleButton();
        },

        /**
         * Create theme toggle button
         */
        createToggleButton() {
            const container = document.getElementById('theme-toggle-container');
            if (!container) {
                console.warn('Theme toggle container not found');
                return;
            }

            const button = document.createElement('button');
            button.id = 'theme-toggle';
            button.className = 'theme-toggle-btn';
            button.setAttribute('aria-label', 'Toggle theme');
            button.setAttribute('title', 'Toggle theme (t)');
            button.type = 'button';

            button.innerHTML = `
                <span class="theme-icon theme-icon-light" aria-hidden="true">☀️</span>
                <span class="theme-icon theme-icon-dark" aria-hidden="true">🌙</span>
                <span class="theme-icon theme-icon-auto" aria-hidden="true">🔄</span>
                <span class="theme-label"></span>
            `;

            button.addEventListener('click', () => this.toggleTheme());

            container.appendChild(button);
            this.updateToggleButton();
        },

        /**
         * Update toggle button appearance
         */
        updateToggleButton() {
            const button = document.getElementById('theme-toggle');
            if (!button) return;

            const label = button.querySelector('.theme-label');
            const icons = button.querySelectorAll('.theme-icon');

            // Hide all icons
            icons.forEach(icon => icon.style.display = 'none');

            // Show current theme icon and update label
            const labels = {
                light: 'Light',
                dark: 'Dark',
                auto: 'Auto'
            };

            const icon = button.querySelector(`.theme-icon-${this.currentTheme}`);
            if (icon) {
                icon.style.display = 'inline-block';
            }

            if (label) {
                label.textContent = labels[this.currentTheme];
            }

            button.setAttribute('aria-label', `Current theme: ${labels[this.currentTheme]}. Click to change.`);
        },

        /**
         * Setup system theme preference listener
         */
        setupMediaQueryListener() {
            if (!window.matchMedia) return;

            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // Modern API
            if (darkModeQuery.addEventListener) {
                darkModeQuery.addEventListener('change', (e) => {
                    if (this.currentTheme === this.THEMES.AUTO) {
                        this.applyTheme(this.THEMES.AUTO);
                        this.updateToggleButton();
                    }
                });
            } else {
                // Legacy API
                darkModeQuery.addListener((e) => {
                    if (this.currentTheme === this.THEMES.AUTO) {
                        this.applyTheme(this.THEMES.AUTO);
                        this.updateToggleButton();
                    }
                });
            }
        },

        /**
         * Setup keyboard shortcut
         */
        setupKeyboardShortcut() {
            document.addEventListener('keydown', (e) => {
                // Ignore if typing in input/textarea
                if (e.target.matches('input, textarea')) return;

                // 't' key toggles theme
                if (e.key === 't' || e.key === 'T') {
                    this.toggleTheme();
                    e.preventDefault();

                    // Show toast notification
                    this.showThemeToast();
                }
            });
        },

        /**
         * Show toast notification when theme changes
         */
        showThemeToast() {
            // Remove existing toast
            const existingToast = document.querySelector('.theme-toast');
            if (existingToast) {
                existingToast.remove();
            }

            const effectiveTheme = this.getEffectiveTheme();
            const labels = {
                light: '☀️ Light theme',
                dark: '🌙 Dark theme'
            };

            const autoSuffix = this.currentTheme === this.THEMES.AUTO ? ' (Auto)' : '';
            const message = labels[effectiveTheme] + autoSuffix;

            const toast = document.createElement('div');
            toast.className = 'theme-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.textContent = message;

            document.body.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Remove after 2 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }
    };

    // Export to global scope
    window.ThemeManager = ThemeManager;

    // Auto-initialize
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
        ThemeManager.setupKeyboardShortcut();
    });
})();