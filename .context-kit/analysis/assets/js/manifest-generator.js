#!/usr/bin/env node

/**
 * Manifest Generator
 * Scans report directories and generates manifest.json
 *
 * Usage:
 *   node manifest-generator.js [reports-dir]
 */

const fs = require('fs');
const path = require('path');

class ManifestGenerator {
    constructor(reportsDir = './reports') {
        this.reportsDir = path.resolve(reportsDir);
        this.manifest = {
            version: '1.0',
            generated: new Date().toISOString(),
            reports: []
        };
    }

    /**
     * Generate manifest
     */
    async generate() {
        console.log(`Scanning reports directory: ${this.reportsDir}`);

        if (!fs.existsSync(this.reportsDir)) {
            console.error(`Reports directory not found: ${this.reportsDir}`);
            process.exit(1);
        }

        // Get all date directories
        const dateDirs = fs.readdirSync(this.reportsDir)
            .filter(name => {
                const fullPath = path.join(this.reportsDir, name);
                return fs.statSync(fullPath).isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(name);
            })
            .sort()
            .reverse(); // Most recent first

        console.log(`Found ${dateDirs.length} report directories`);

        // Process each date directory
        for (const dateDir of dateDirs) {
            const datePath = path.join(this.reportsDir, dateDir);
            const reports = await this.scanDateDirectory(dateDir, datePath);

            if (reports.length > 0) {
                this.manifest.reports.push({
                    date: dateDir,
                    count: reports.length,
                    reports: reports
                });
            }
        }

        return this.manifest;
    }

    /**
     * Scan a date directory for reports
     * @param {string} dateDir - Date directory name
     * @param {string} datePath - Full path to date directory
     * @returns {Array} Array of report metadata
     */
    async scanDateDirectory(dateDir, datePath) {
        const reports = [];
        const files = fs.readdirSync(datePath)
            .filter(name => name.endsWith('.html'));

        for (const file of files) {
            const filePath = path.join(datePath, file);
            const metadata = await this.extractMetadata(file, filePath);

            if (metadata) {
                reports.push(metadata);
            }
        }

        return reports;
    }

    /**
     * Extract metadata from HTML report
     * @param {string} filename - Report filename
     * @param {string} filePath - Full path to report
     * @returns {Object|null} Report metadata
     */
    async extractMetadata(filename, filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);

            // Extract title
            const titleMatch = content.match(/<title>(.*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].replace(' - tkr-project-kit', '').trim() : filename;

            // Determine report type
            const reportType = filename.replace('-report.html', '').replace('.html', '');

            // Extract score/status (various patterns)
            const score = this.extractScore(content, reportType);

            // Extract issue counts
            const issues = this.extractIssues(content, reportType);

            // Extract summary
            const summary = this.extractSummary(content);

            return {
                id: reportType,
                filename: filename,
                title: title,
                type: this.getReportCategory(reportType),
                score: score,
                issues: issues,
                summary: summary,
                size: stats.size,
                modified: stats.mtime.toISOString()
            };
        } catch (error) {
            console.error(`Error extracting metadata from ${filename}:`, error.message);
            return null;
        }
    }

    /**
     * Extract score from report content
     * @param {string} content - HTML content
     * @param {string} reportType - Report type
     * @returns {string|number|null} Score
     */
    extractScore(content, reportType) {
        // Pattern 1: Score card with value
        const scoreMatch = content.match(/<div class="score-value[^"]*"[^>]*>(\d+)\/100<\/div>/i);
        if (scoreMatch) {
            return parseInt(scoreMatch[1]);
        }

        // Pattern 2: Overall health score
        const healthMatch = content.match(/Overall.*?Score:?\s*(\d+)\/100/i);
        if (healthMatch) {
            return parseInt(healthMatch[1]);
        }

        // Pattern 3: Summary card value
        const summaryMatch = content.match(/<div class="summary-card-value[^"]*">([^<]+)<\/div>/i);
        if (summaryMatch) {
            const value = summaryMatch[1].trim();
            if (/^\d+$/.test(value)) {
                return parseInt(value);
            }
            return value;
        }

        // Pattern 4: Risk level (for dependency audit)
        const riskMatch = content.match(/Overall Risk Score:\s*(\w+)/i);
        if (riskMatch) {
            return riskMatch[1];
        }

        return null;
    }

    /**
     * Extract issue counts from report
     * @param {string} content - HTML content
     * @param {string} reportType - Report type
     * @returns {Object} Issue counts by severity
     */
    extractIssues(content, reportType) {
        const issues = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0
        };

        // Try to extract issue counts
        const patterns = [
            /(\d+)\s+Critical/gi,
            /(\d+)\s+High/gi,
            /(\d+)\s+Medium/gi,
            /(\d+)\s+Low/gi,
            /Total.*?(\d+)/gi
        ];

        const severities = ['critical', 'high', 'medium', 'low', 'total'];

        patterns.forEach((pattern, index) => {
            const matches = [...content.matchAll(pattern)];
            if (matches.length > 0) {
                // Take the first match
                issues[severities[index]] = parseInt(matches[0][1]);
            }
        });

        // Calculate total if not found
        if (issues.total === 0) {
            issues.total = issues.critical + issues.high + issues.medium + issues.low;
        }

        return issues;
    }

    /**
     * Extract summary text from report
     * @param {string} content - HTML content
     * @returns {string} Summary text
     */
    extractSummary(content) {
        // Try to extract executive summary
        const summaryMatch = content.match(/<p[^>]*class="[^"]*summary[^"]*"[^>]*>(.*?)<\/p>/is);
        if (summaryMatch) {
            return summaryMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 200);
        }

        // Try to extract first paragraph after header
        const paraMatch = content.match(/<header[^>]*>.*?<\/header>.*?<p>(.*?)<\/p>/is);
        if (paraMatch) {
            return paraMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 200);
        }

        return '';
    }

    /**
     * Get report category
     * @param {string} reportType - Report type
     * @returns {string} Category
     */
    getReportCategory(reportType) {
        const categories = {
            'security': 'Phase 1',
            'code-quality': 'Phase 1',
            'dependency-audit': 'Phase 1',
            'performance': 'Phase 2',
            'test-coverage': 'Phase 2',
            'accessibility': 'Phase 2',
            'architecture': 'Phase 3',
            'documentation': 'Phase 3',
            'commit-pr-quality': 'Phase 3',
            'consolidated-summary': 'Summary'
        };

        return categories[reportType] || 'Other';
    }

    /**
     * Save manifest to file
     * @param {string} outputPath - Output file path
     */
    save(outputPath) {
        const output = path.resolve(outputPath);
        const dir = path.dirname(output);

        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(output, JSON.stringify(this.manifest, null, 2), 'utf8');
        console.log(`Manifest saved to: ${output}`);
        console.log(`Total report sets: ${this.manifest.reports.length}`);

        // Print summary
        this.manifest.reports.forEach(reportSet => {
            console.log(`  ${reportSet.date}: ${reportSet.count} reports`);
        });
    }
}

// CLI interface
if (require.main === module) {
    const reportsDir = process.argv[2] || './reports';
    const outputFile = process.argv[3] || './manifest.json';

    const generator = new ManifestGenerator(reportsDir);

    generator.generate()
        .then(() => {
            generator.save(outputFile);
            console.log('✓ Manifest generation complete');
        })
        .catch(error => {
            console.error('Error generating manifest:', error);
            process.exit(1);
        });
}

module.exports = ManifestGenerator;