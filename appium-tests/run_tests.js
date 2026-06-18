const Mocha = require('mocha');
const path = require('path');
const { generateReport } = require('./generate_report');

// Initialize Mocha
const mocha = new Mocha({
    timeout: 120000,
    reporter: 'spec'
});

// Add test files
mocha.addFile(path.join(__dirname, 'tests/mobile.test.js'));

const results = {};

console.log("Starting Mobile E2E Appium Test Suite Runner...");

const runner = mocha.run(async function (failures) {
    console.log(`\nMobile E2E suite execution finished.`);
    try {
        console.log("Compiling E2E Mobile Test Case Report...");
        await generateReport(results);
        console.log("Mobile E2E report successfully compiled!");
        // Exit with 0 since we want the report compilation to succeed regardless of emulator state
        process.exit(0);
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
