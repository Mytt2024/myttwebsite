// node app.js https://dhenme.com 12000 2 2 proxies.txt

const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = 8886;
const INTERVAL = 60000; // 1 minute in milliseconds

// Retrieve command-line arguments
const [url, port, param1, param2, proxyFile] = process.argv.slice(2);

if (!url || !port || !param1 || !param2 || !proxyFile) {
    console.error("Usage: node app.js <url> <port> <param1> <param2> <proxyFile>");
    process.exit(1);
}

// Build the script command dynamically
const SCRIPT_COMMAND = `node script.js ${url} ${port} ${param1} ${param2} ${proxyFile}`;

let outputLines = [];
let isScriptRunning = false;

function runScript() {
    if (isScriptRunning) return; // Prevent overlapping script executions

    isScriptRunning = true;
    const child = exec(SCRIPT_COMMAND, { silent: true });

    child.stdout.on('data', (data) => {
        handleOutput(data);
    });

    child.stderr.on('data', (data) => {
        handleOutput(data);
    });

    child.on('close', (code) => {
        handleOutput(`Script exited with code ${code}`);
        isScriptRunning = false;
        setTimeout(runScript, INTERVAL); // Schedule the next execution after 1 minute
    });
}

function handleOutput(data) {
    const lines = data.split('\n').filter(line => line.trim().length > 0);

    lines.forEach(line => {
        if (outputLines.length >= 20) {
            outputLines.shift(); // Remove the oldest line
        }
        outputLines.push(line);
    });
}

// Define the /status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: isScriptRunning ? 'running' : 'idle',
        last_20_updates: outputLines
    });
});

// Start the server and run the script
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    runScript(); // Start the first execution
});
