const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const port = 8889;

let isRunning = false;
let scriptProcess = null;
let outputLog = [];

// Helper function to log output
const logOutput = (data) => {
  outputLog.push(data.toString());
  if (outputLog.length > 20) {
    outputLog.shift(); // Keep only the last 20 entries
  }
};

app.get('/make', (req, res) => {
  if (isRunning) {
    // Stop the script if it's running
    scriptProcess.kill();
    scriptProcess = null;
    isRunning = false;
    res.send('Script stopped.');
  } else {
    // Start the script if it's not running
    scriptProcess = spawn('node', ['manager.js']);

    scriptProcess.stdout.on('data', logOutput);
    scriptProcess.stderr.on('data', logOutput);

    scriptProcess.on('close', (code) => {
      isRunning = false;
      logOutput(`Script stopped with code ${code}`);
    });

    isRunning = true;
    res.send('Script started.');
  }
});

app.get('/status', (req, res) => {
  if (isRunning) {
    res.send(`<pre>${outputLog.join('\n')}</pre>`);
  } else {
    res.send('Script not running.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
