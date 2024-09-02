const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 8886;

// To store the last 20 lines of output
let outputLines = [];

// Function to execute the script
function runScript() {
    const command = 'node script.js https://dhenme.com 12000 1 1 proxies.txt';

    // Run the script without producing output in the terminal
    const child = exec(command, { silent: true });

    // Capture the script output
    child.stdout.on('data', (data) => {
        handleOutput(data);
    });

    child.stderr.on('data', (data) => {
        handleOutput(data);
    });

    child.on('close', (code) => {
        handleOutput(`Script exited with code ${code}`);
    });
}

// Function to handle script output and store only the last 20 lines
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
        status: 'running',
        last_20_updates: outputLines
    });
});

// Start the server and run the script
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    runScript();
});
