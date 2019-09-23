const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {clearInput} = require('../../../inputs');
const {acceptCookies} = require('../helpers');

describe('Home page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://9292.nl/';

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check planner form validation', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);

        const plannerFormLocator = By.css('#planner');

        await driver.wait(until.elementLocated(plannerFormLocator), 1000);
        await driver.findElement(plannerFormLocator).submit();
        await driver.wait(until.elementsLocated(By.css('.tooltip-inner')), 1000);
    });

    test('Check transport extra options', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);
        await driver.findElement(By.css('#extratab')).click();
        await driver.wait(until.elementLocated(By.css('.vervoertypes')), 1000);

        const transportLabels = await driver.findElements(By.css('.vervoertypes label'));

        expect(transportLabels.length).toBe(5);

        for (const label of transportLabels) {
            expect(await label.getAttribute('class')).toMatch('active');

            await driver.sleep(100);
            await label.click();
            expect(await label.getAttribute('class')).not.toMatch('active');
        }
    });

    test('Check trip page url', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);
        await driver.findElement(By.css('#van')).sendKeys('Amsterdam Centraal');
        await driver.findElement(By.css('#naar')).sendKeys('Alkmaar');

        const timeInput = await driver.findElement(By.css('#time'));

        await clearInput(timeInput);
        await timeInput.sendKeys('23:00');
        await driver.findElement(By.css('[for="vertrek"]')).click();
        await driver.findElement(By.css('#planner')).submit();

        const expectedUrl = await driver.getCurrentUrl();

        expect(expectedUrl).toBe('https://9292.nl/reisadvies/station-amsterdam-centraal/station-alkmaar/vertrek/2019-09-01T2309');
    });

    test('Check disruptions option', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);
        await driver.findElement(By.css('.verstoringenButton')).click();
        await driver.wait(until.elementLocated(By.css('#disturbancetab.active')), 500);

        const disruptionsPanel = await driver.findElement(By.css('#unscheduledDisruptions'));
        const disruptionOptions = await disruptionsPanel.findElements(By.css('.list-group-item'));
        const disruptionOptionsCount = disruptionOptions.length;
        // 'Ongeplande verstoringen (10)'
        const unscheduledDisruptionText = await disruptionsPanel.findElement(By.css('h6.bluetxt')).getText();
        const disruptionsListMatch = /[0-9]+/.exec(unscheduledDisruptionText);

        if (disruptionsListMatch === null) {
            throw new Error('Invalid disruptions number value: ' + unscheduledDisruptionText);
        }

        expect(Number(disruptionsListMatch)).toBe(disruptionOptionsCount);

        const disruptionsCountOnIcon = await driver.findElement(By.css('#disturbancetab')).getText();

        expect(Number(disruptionsCountOnIcon)).toBe(disruptionOptionsCount);

    });
});