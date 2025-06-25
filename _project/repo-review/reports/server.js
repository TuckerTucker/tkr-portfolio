#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html or dashboard.html
    if (pathname === '/') {
        pathname = fs.existsSync('./dashboard.html') ? '/dashboard.html' : '/index.html';
    }
    
    // Remove leading slash and resolve path
    const filePath = path.join(__dirname, pathname.substring(1));
    
    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <head><title>404 Not Found</title></head>
                    <body>
                        <h1>404 - File Not Found</h1>
                        <p>The requested file "${pathname}" was not found.</p>
                        <p><a href="/dashboard.html">Go to Dashboard</a></p>
                    </body>
                </html>
            `);
            return;
        }
        
        // Read and serve file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>500 Server Error</title></head>
                        <body>
                            <h1>500 - Internal Server Error</h1>
                            <p>Error reading file: ${err.message}</p>
                        </body>
                    </html>
                `);
                return;
            }
            
            // Set CORS headers to allow cross-origin requests
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Cache-Control': 'no-cache'
            });
            
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`⏹️  Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});