/**
 * Navigation Utility
 * Provides consistent navigation across all analysis reports
 */

(function() {
    'use strict';

    /**
     * Navigation Manager
     */
    const Navigation = {
        /**
         * Initialize navigation
         * @param {Object} config - Navigation configuration
         * @param {string} config.reportType - Type of report (e.g., 'security', 'code-quality')
         * @param {string} config.reportDate - Date of report (YYYY-MM-DD)
         * @param {string} config.reportTitle - Title of the report
         */
        init(config) {
            this.config = config;
            this.renderBreadcrumbs();
            this.renderNavigation();
            this.setupKeyboardShortcuts();
            this.setupScrollSpy();
        },

        /**
         * Render breadcrumb navigation
         */
        renderBreadcrumbs() {
            const breadcrumbContainer = document.getElementById('breadcrumbs');
            if (!breadcrumbContainer) return;

            const { reportDate, reportType, reportTitle } = this.config;

            const breadcrumbs = [
                { label: 'Home', href: '../../index.html' },
                { label: 'Reports', href: '../' },
                { label: reportDate, href: './' },
                { label: reportTitle, href: '#', active: true }
            ];

            const nav = document.createElement('nav');
            nav.setAttribute('aria-label', 'Breadcrumb');
            nav.className = 'breadcrumbs';

            const ol = document.createElement('ol');
            ol.className = 'breadcrumb-list';

            breadcrumbs.forEach((crumb, index) => {
                const li = document.createElement('li');
                li.className = 'breadcrumb-item';

                if (crumb.active) {
                    li.setAttribute('aria-current', 'page');
                    li.textContent = crumb.label;
                } else {
                    const a = document.createElement('a');
                    a.href = crumb.href;
                    a.textContent = crumb.label;
                    li.appendChild(a);
                }

                ol.appendChild(li);
            });

            nav.appendChild(ol);
            breadcrumbContainer.appendChild(nav);
        },

        /**
         * Render main navigation with report links
         */
        renderNavigation() {
            const navContainer = document.getElementById('report-navigation');
            if (!navContainer) return;

            const { reportDate } = this.config;

            const reports = [
                { id: 'consolidated-summary', title: 'Consolidated Summary', icon: '🎯' },
                { id: 'security-report', title: 'Security', icon: '🔒' },
                { id: 'code-quality-report', title: 'Code Quality', icon: '📊' },
                { id: 'dependency-audit-report', title: 'Dependencies', icon: '📦' },
                { id: 'performance-report', title: 'Performance', icon: '⚡' },
                { id: 'test-coverage-report', title: 'Test Coverage', icon: '🧪' },
                { id: 'accessibility-report', title: 'Accessibility', icon: '♿' },
                { id: 'architecture-report', title: 'Architecture', icon: '🏗️' },
                { id: 'documentation-report', title: 'Documentation', icon: '📚' },
                { id: 'commit-pr-quality-report', title: 'Commit/PR Quality', icon: '📝' }
            ];

            const nav = document.createElement('nav');
            nav.className = 'report-nav';
            nav.setAttribute('aria-label', 'Report navigation');

            const list = document.createElement('ul');
            list.className = 'report-nav-list';

            reports.forEach(report => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `${report.id}.html`;
                a.className = 'report-nav-link';

                if (this.config.reportType === report.id) {
                    a.classList.add('active');
                    a.setAttribute('aria-current', 'page');
                }

                a.innerHTML = `
                    <span class="report-nav-icon">${report.icon}</span>
                    <span class="report-nav-title">${report.title}</span>
                `;

                li.appendChild(a);
                list.appendChild(li);
            });

            nav.appendChild(list);
            navContainer.appendChild(nav);
        },

        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ignore if typing in input/textarea
                if (e.target.matches('input, textarea')) return;

                // k or ArrowUp: Previous report
                if (e.key === 'k' || e.key === 'ArrowUp') {
                    this.navigateToPrevious();
                    e.preventDefault();
                }

                // j or ArrowDown: Next report
                if (e.key === 'j' || e.key === 'ArrowDown') {
                    this.navigateToNext();
                    e.preventDefault();
                }

                // h or Home: Back to index
                if (e.key === 'h' || e.key === 'Home') {
                    window.location.href = '../../index.html';
                    e.preventDefault();
                }

                // /: Focus search (if available)
                if (e.key === '/') {
                    const searchInput = document.querySelector('[type="search"]');
                    if (searchInput) {
                        searchInput.focus();
                        e.preventDefault();
                    }
                }

                // ?: Show keyboard shortcuts
                if (e.key === '?') {
                    this.showKeyboardShortcuts();
                    e.preventDefault();
                }
            });
        },

        /**
         * Navigate to previous report
         */
        navigateToPrevious() {
            const currentLink = document.querySelector('.report-nav-link.active');
            if (!currentLink) return;

            const prevLink = currentLink.parentElement.previousElementSibling?.querySelector('.report-nav-link');
            if (prevLink) {
                window.location.href = prevLink.href;
            }
        },

        /**
         * Navigate to next report
         */
        navigateToNext() {
            const currentLink = document.querySelector('.report-nav-link.active');
            if (!currentLink) return;

            const nextLink = currentLink.parentElement.nextElementSibling?.querySelector('.report-nav-link');
            if (nextLink) {
                window.location.href = nextLink.href;
            }
        },

        /**
         * Show keyboard shortcuts modal
         */
        showKeyboardShortcuts() {
            const shortcuts = [
                { keys: ['j', '↓'], description: 'Next report' },
                { keys: ['k', '↑'], description: 'Previous report' },
                { keys: ['h', 'Home'], description: 'Back to index' },
                { keys: ['/'], description: 'Focus search' },
                { keys: ['?'], description: 'Show keyboard shortcuts' },
                { keys: ['Esc'], description: 'Close modal' }
            ];

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'keyboard-shortcuts-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', 'shortcuts-title');

            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
                    <table class="shortcuts-table">
                        <tbody>
                            ${shortcuts.map(s => `
                                <tr>
                                    <td class="shortcut-keys">
                                        ${s.keys.map(k => `<kbd>${k}</kbd>`).join(' or ')}
                                    </td>
                                    <td>${s.description}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="btn btn-secondary modal-close">Close</button>
                </div>
            `;

            document.body.appendChild(modal);

            // Close handlers
            const closeModal = () => {
                modal.remove();
            };

            modal.querySelector('.modal-close').addEventListener('click', closeModal);
            modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            });

            // Focus close button
            modal.querySelector('.modal-close').focus();
        },

        /**
         * Setup scroll spy for table of contents
         */
        setupScrollSpy() {
            const headings = document.querySelectorAll('h2[id], h3[id]');
            if (headings.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const id = entry.target.getAttribute('id');
                    const tocLink = document.querySelector(`.toc-link[href="#${id}"]`);

                    if (entry.isIntersecting && tocLink) {
                        document.querySelectorAll('.toc-link').forEach(link => {
                            link.classList.remove('active');
                        });
                        tocLink.classList.add('active');
                    }
                });
            }, {
                rootMargin: '-100px 0px -80% 0px'
            });

            headings.forEach(heading => observer.observe(heading));
        },

        /**
         * Generate table of contents
         */
        generateTableOfContents() {
            const tocContainer = document.getElementById('table-of-contents');
            if (!tocContainer) return;

            const headings = document.querySelectorAll('h2[id], h3[id]');
            if (headings.length === 0) {
                tocContainer.style.display = 'none';
                return;
            }

            const nav = document.createElement('nav');
            nav.className = 'toc';
            nav.setAttribute('aria-label', 'Table of contents');

            const title = document.createElement('h3');
            title.textContent = 'Table of Contents';
            nav.appendChild(title);

            const list = document.createElement('ul');
            list.className = 'toc-list';

            headings.forEach(heading => {
                const li = document.createElement('li');
                li.className = `toc-item toc-${heading.tagName.toLowerCase()}`;

                const a = document.createElement('a');
                a.href = `#${heading.id}`;
                a.className = 'toc-link';
                a.textContent = heading.textContent;

                // Smooth scroll
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.pushState(null, '', `#${heading.id}`);
                });

                li.appendChild(a);
                list.appendChild(li);
            });

            nav.appendChild(list);
            tocContainer.appendChild(nav);
        }
    };

    // Export to global scope
    window.Navigation = Navigation;

    // Auto-initialize if config is provided
    document.addEventListener('DOMContentLoaded', () => {
        if (window.REPORT_CONFIG) {
            Navigation.init(window.REPORT_CONFIG);
            Navigation.generateTableOfContents();
        }
    });
})();