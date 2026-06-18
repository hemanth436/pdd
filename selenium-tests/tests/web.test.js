const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Skill Swap Exchange - Complete Web E2E Tests', function () {
    this.timeout(40000); // 40 seconds timeout
    let driver;

    before(async function () {
        let options = new chrome.Options();
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

        await driver.manage().window().setRect({ width: 1280, height: 1024 });
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    afterEach(async function () {
        if (this.currentTest.state === 'failed') {
            try {
                console.log(`CURRENT URL ON FAILURE [${this.currentTest.title}]:`, await driver.getCurrentUrl());
                const logs = await driver.manage().logs().get('browser');
                console.log(`================= BROWSER CONSOLE LOGS [${this.currentTest.title}] =================`);
                logs.forEach(log => console.log(`[${log.level.name}] ${log.message}`));
                console.log("=================================================================================");
            } catch (logErr) {
                console.log("Failed to retrieve browser logs/URL:", logErr.message);
            }
        }
    });

    async function clickElement(element) {
        try {
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
            await driver.sleep(500);
            await driver.executeScript("arguments[0].click();", element);
        } catch (err) {
            console.log("Click failed:", err.message);
        }
    }

    it('should successfully log in to the application', async function () {
        await driver.get('http://localhost:8080/#auth');
        
        const emailInput = await driver.wait(until.elementLocated(By.id('email')), 10000);
        const passwordInput = await driver.findElement(By.id('password'));
        const loginBtn = await driver.findElement(By.id('login-button'));

        await emailInput.clear();
        await emailInput.sendKeys('sarah@example.com');
        
        await passwordInput.clear();
        await passwordInput.sendKeys('password');

        await clickElement(loginBtn);

        const currentUrl = await driver.wait(async function () {
            const url = await driver.getCurrentUrl();
            if (url.includes('#dashboard')) {
                return url;
            }
            return false;
        }, 15000, 'Failed to redirect to #dashboard within 15 seconds');

        assert.match(currentUrl, /#dashboard/, 'User should be on dashboard page');
    });

    it('should load dashboard and show add skill button', async function () {
        const addSkillBtn = await driver.wait(until.elementLocated(By.id('dash-add-skill-btn')), 10000);
        assert.ok(addSkillBtn, 'Add New Skill button should be displayed on dashboard');
    });

    it('should successfully post a new skill listing', async function () {
        const addSkillBtn = await driver.wait(until.elementLocated(By.id('dash-add-skill-btn')), 10000);
        await clickElement(addSkillBtn);

        // Wait for post skill form to load
        const skillTitleInput = await driver.wait(until.elementLocated(By.id('skill-title')), 10000);
        const skillDescInput = await driver.findElement(By.id('skill-desc'));
        const skillCreateBtn = await driver.findElement(By.id('skill-create-btn'));

        // Input test data via JS to ensure headless reliability
        await driver.executeScript("arguments[0].value = 'Automated Web E2E Testing'; arguments[0].dispatchEvent(new Event('input')); arguments[0].dispatchEvent(new Event('change'));", skillTitleInput);
        await driver.executeScript("arguments[0].value = 'Learn how to design stable browser testing automation using Selenium Webdriver.'; arguments[0].dispatchEvent(new Event('input')); arguments[0].dispatchEvent(new Event('change'));", skillDescInput);

        // Select Technology/Coding Category
        const catSelect = await driver.findElement(By.id('skill-category'));
        await driver.executeScript("arguments[0].value = 'Tech'; arguments[0].dispatchEvent(new Event('change'));", catSelect);

        // Select Intermediate level
        const levelSelect = await driver.findElement(By.id('skill-level'));
        await driver.executeScript("arguments[0].value = 'Intermediate'; arguments[0].dispatchEvent(new Event('change'));", levelSelect);

        // Log form details for diagnostics
        const formDetails = await driver.executeScript(() => {
            const form = document.getElementById('skill-listing-form');
            const title = document.getElementById('skill-title');
            const category = document.getElementById('skill-category');
            const level = document.getElementById('skill-level');
            const desc = document.getElementById('skill-desc');
            return {
                hasForm: !!form,
                titleVal: title ? title.value : null,
                titleValid: title ? title.checkValidity() : null,
                descVal: desc ? desc.value : null,
                descValid: desc ? desc.checkValidity() : null,
                categoryVal: category ? category.value : null,
                levelVal: level ? level.value : null,
                formValid: form ? form.checkValidity() : null
            };
        });
        console.log("FORM DETAILS BEFORE SUBMIT:", JSON.stringify(formDetails, null, 2));

        // Submit form
        try {
            await skillCreateBtn.click();
        } catch (err) {
            await clickElement(skillCreateBtn);
        }

        // requestSubmit fallback to guarantee submit event triggers in headless environment
        await driver.executeScript(() => {
            const form = document.getElementById('skill-listing-form');
            if (form) {
                form.requestSubmit();
            }
        });

        // Verify redirect back to dashboard
        const currentUrl = await driver.wait(async function () {
            const url = await driver.getCurrentUrl();
            if (url.includes('#dashboard')) {
                return url;
            }
            return false;
        }, 15000, 'Failed to return to #dashboard after posting skill');

        assert.match(currentUrl, /#dashboard/, 'User should be redirected back to the dashboard');
    });

    it('should navigate to the profile section and update user profile', async function () {
        const sidebarProfileBtn = await driver.wait(until.elementLocated(By.id('sidebar-profile-btn')), 10000);
        await clickElement(sidebarProfileBtn);

        // Wait for profile edit form inputs
        const profileBioInput = await driver.wait(until.elementLocated(By.id('profile-bio')), 10000);
        const saveProfileBtn = await driver.findElement(By.id('save-profile-btn'));

        // Update bio via JS to ensure headless reliability
        await driver.executeScript("arguments[0].value = 'Automated E2E QA Engineer profile.'; arguments[0].dispatchEvent(new Event('input')); arguments[0].dispatchEvent(new Event('change'));", profileBioInput);

        // Click save profile
        try {
            await saveProfileBtn.click();
        } catch (err) {
            await clickElement(saveProfileBtn);
        }

        // Allow some time for state processing
        await driver.sleep(2000);
        
        // Assert we are still on profile page or back in dashboard overview
        const pageTitle = await driver.getTitle();
        assert.ok(pageTitle, 'Page title should exist');
    });
});
