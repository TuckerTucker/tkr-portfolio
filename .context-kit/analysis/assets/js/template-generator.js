#!/usr/bin/env node

/**
 * Template Generator
 * Generates HTML reports from template with variable substitution
 *
 * Usage:
 *   const generator = new TemplateGenerator();
 *   const html = generator.generate(templatePath, variables);
 */

const fs = require('fs');
const path = require('path');

class TemplateGenerator {
    /**
     * Generate HTML from template
     * @param {string} templatePath - Path to template file
     * @param {Object} variables - Template variables
     * @returns {string} Generated HTML
     */
    generate(templatePath, variables) {
        // Read template
        const template = fs.readFileSync(templatePath, 'utf8');

        // Replace variables
        let html = template;
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            html = html.replace(new RegExp(placeholder, 'g'), value || '');
        }

        return html;
    }

    /**
     * Generate and save report
     * @param {string} templatePath - Path to template file
     * @param {Object} variables - Template variables
     * @param {string} outputPath - Output file path
     */
    generateAndSave(templatePath, variables, outputPath) {
        const html = this.generate(templatePath, variables);

        // Ensure output directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write file
        fs.writeFileSync(outputPath, html, 'utf8');
        console.log(`Report generated: ${outputPath}`);
    }

    /**
     * Get default variables
     * @returns {Object} Default template variables
     */
    getDefaultVariables() {
        return {
            REPORT_TITLE: 'Analysis Report',
            REPORT_DESCRIPTION: 'Automated code analysis report',
            REPORT_ICON: '📊',
            REPORT_TYPE: 'analysis',
            REPORT_DATE: new Date().toISOString().split('T')[0],
            REPORT_CONTENT: '<p>Report content goes here</p>',
            AGENT_NAME: 'analysis-agent',
            PROJECT_VERSION: '3.6.0',
            CUSTOM_SCRIPT: ''
        };
    }

    /**
     * Validate required variables
     * @param {Object} variables - Template variables
     * @returns {boolean} True if valid
     */
    validateVariables(variables) {
        const required = ['REPORT_TITLE', 'REPORT_TYPE', 'REPORT_DATE', 'REPORT_CONTENT'];

        for (const key of required) {
            if (!variables[key]) {
                console.error(`Missing required variable: ${key}`);
                return false;
            }
        }

        return true;
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node template-generator.js <template-path> <output-path> [variables-json]');
        console.log('');
        console.log('Example:');
        console.log('  node template-generator.js templates/report-template.html output/report.html \\');
        console.log('    \'{"REPORT_TITLE":"Security Report","REPORT_TYPE":"security"}\'');
        process.exit(1);
    }

    const templatePath = args[0];
    const outputPath = args[1];
    const variablesJson = args[2] || '{}';

    try {
        const generator = new TemplateGenerator();
        const defaults = generator.getDefaultVariables();
        const custom = JSON.parse(variablesJson);
        const variables = { ...defaults, ...custom };

        if (!generator.validateVariables(variables)) {
            process.exit(1);
        }

        generator.generateAndSave(templatePath, variables, outputPath);
        console.log('✓ Report generation complete');
    } catch (error) {
        console.error('Error generating report:', error.message);
        process.exit(1);
    }
}

module.exports = TemplateGenerator;