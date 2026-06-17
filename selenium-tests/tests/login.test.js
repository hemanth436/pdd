const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Skill Swap Exchange - Login E2E Tests', function () {
    this.timeout(30000); // 30 seconds timeout
    let driver;

    before(async function () {
        let options = new chrome.Options();
        // Setup Chrome options for headless environment (CI or when specified)
        if (process.env.CI || process.env.HEADLESS === 'true') {
            options.addArguments('--headless=new');
            options.addArguments('--no-sandbox');
            options.addArguments('--disable-dev-shm-usage');
            options.addArguments('--disable-gpu');
        }
        
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // Set consistent window size to avoid overlap issues
        await driver.manage().window().setRect({ width: 1280, height: 1024 });
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it('should load the landing/auth page and find the login form', async function () {
        await driver.get('http://localhost:8080/#auth');
        
        // Wait for the email input element to be located
        const emailInput = await driver.wait(until.elementLocated(By.id('email')), 10000);
        assert.ok(emailInput, 'Email input should be present');
        
        const passwordInput = await driver.findElement(By.id('password'));
        assert.ok(passwordInput, 'Password input should be present');
        
        const loginBtn = await driver.findElement(By.id('login-button'));
        assert.ok(loginBtn, 'Login submit button should be present');
    });

    it('should successfully login and redirect to the dashboard', async function () {
        await driver.get('http://localhost:8080/#auth');
        
        // Wait for form elements
        const emailInput = await driver.wait(until.elementLocated(By.id('email')), 10000);
        const passwordInput = await driver.findElement(By.id('password'));
        const loginBtn = await driver.findElement(By.id('login-button'));

        // Clear default values and enter credentials
        await emailInput.clear();
        await emailInput.sendKeys('sarah@example.com');
        
        await passwordInput.clear();
        await passwordInput.sendKeys('password');

        // Scroll the button into view and click
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", loginBtn);
        await driver.sleep(500); // Allow scroll to settle
        try {
            await loginBtn.click();
        } catch (err) {
            console.log("Standard click intercepted, fallback to JS click:", err.message);
            await driver.executeScript("arguments[0].click();", loginBtn);
        }

        // Wait for redirect to dashboard
        try {
            const currentUrl = await driver.wait(async function () {
                const url = await driver.getCurrentUrl();
                if (url.includes('#dashboard')) {
                    return url;
                }
                return false;
            }, 15000, 'Failed to redirect to #dashboard within 15 seconds');

            assert.match(currentUrl, /#dashboard/, 'URL should include #dashboard after successful login');
        } catch (err) {
            // Fetch and print console logs on failure
            try {
                const logs = await driver.manage().logs().get('browser');
                console.log("================= BROWSER CONSOLE LOGS =================");
                logs.forEach(log => console.log(`[${log.level.name}] ${log.message}`));
                console.log("========================================================");
            } catch (logErr) {
                console.log("Failed to retrieve browser logs:", logErr.message);
            }
            throw err;
        }
    });
});
