const express = require('express');
const { exec } = require('child_process');

// Set up Express app
const app = express();
const port = 8889;

let scriptOutput = [];

// Function to run the app.js script
function runScript() {
    const url = "https://dhenme.com";
    const port = "12000";
    const param1 = "1";
    const param2 = "1";
    const proxyFile = "proxies.txt";
    const command = `node script.js ${url} ${port} ${param1} ${param2} ${proxyFile}`;
    //console.log(`Starting script: ${command}`);

    const process = exec(command);

    process.stdout.on('data', (data) => {
        scriptOutput.push(`stdout: ${data}`); // Append output to scriptOutput array
        if (scriptOutput.length > 20) { // Keep only the last 20 entries
            scriptOutput.shift();
        }
    });

    process.stderr.on('data', (data) => {
        scriptOutput.push(`stderr: ${data}`); // Append output to scriptOutput array
        if (scriptOutput.length > 20) { // Keep only the last 20 entries
            scriptOutput.shift();
        }
    });

    process.on('close', (code) => {
        scriptOutput.push(`Script exited with code ${code}`); // Append exit code to scriptOutput array
        if (scriptOutput.length > 20) { // Keep only the last 20 entries
            scriptOutput.shift();
        }
        //console.log('Restarting script...');
        runScript();
    });

    // Stop the script after 2 minutes (120000 milliseconds)
    setTimeout(() => {
        //console.log('Stopping script...');
        process.kill(); // Terminate the script
    }, 120000);
}

// Set up /status endpoint to return script output
app.get('/status', (req, res) => {
    res.send(`<pre>${scriptOutput.join('\n')}</pre>`); // Join array elements with newlines
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Start the process for the first time
runScript();
