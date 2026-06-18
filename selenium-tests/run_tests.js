const Mocha = require('mocha');
const path = require('path');
const { generateReport } = require('./generate_report');

// Initialize Mocha
const mocha = new Mocha({
    timeout: 40000,
    reporter: 'spec'
});

// Add test files
mocha.addFile(path.join(__dirname, 'tests/login.test.js'));
mocha.addFile(path.join(__dirname, 'tests/web.test.js'));

const results = {};

console.log("Starting Web E2E Selenium Test Suite Runner...");

const runner = mocha.run(async function (failures) {
    console.log(`\nWeb E2E suite execution finished with ${failures} failure(s).`);
    try {
        console.log("Compiling E2E Web Test Case Report...");
        await generateReport(results);
        console.log("Web E2E report successfully compiled!");
        process.exit(failures ? 1 : 0);
    } catch (err) {
        console.error("Fatal error during Excel report compilation:", err);
        process.exit(1);
    }
});

runner.on('pass', function (test) {
    results[test.title] = {
        passed: true,
        duration: test.duration
    };
});

runner.on('fail', function (test, err) {
    results[test.title] = {
        passed: false,
        duration: test.duration || 0,
        error: err.message
    };
});
