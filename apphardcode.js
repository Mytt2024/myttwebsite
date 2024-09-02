const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = 8886;
const SCRIPT_COMMAND = 'node script.js https://dhenme.com 12000 1 1 proxies.txt';
const INTERVAL = 60000; // 1 minute in milliseconds

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
