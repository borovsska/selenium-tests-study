const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {clearInput} = require('../../../inputs');

describe('Product page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://9292.nl/';

    async function acceptCookies () {
        await driver.wait(until.elementLocated(By.css('#btnAccord')), 1000);
        await driver.executeScript(`document.querySelector('#btnAccord').click()`);
    }

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check planner form validation', async function () {
        await driver.get(pageUrl);
        await acceptCookies();

        const plannerFormLocator = By.css('#planner');

        await driver.wait(until.elementLocated(plannerFormLocator), 1000);
        await driver.findElement(plannerFormLocator).submit();
        await driver.wait(until.elementsLocated(By.css('.tooltip-inner')), 1000);
    });

    test('Check transport extra options', async function () {
        await driver.get(pageUrl);
        await acceptCookies();
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
        await acceptCookies();
        await driver.findElement(By.css('#van')).sendKeys('Amsterdam Centraal');
        await driver.findElement(By.css('#naar')).sendKeys('Alkmaar');

        const timeInput = await driver.findElement(By.css('#time'));

        await clearInput(timeInput);
        await timeInput.sendKeys('23:00');
        await driver.findElement(By.css('[for="vertrek"]')).click();
        await driver.findElement(By.css('#planner')).submit();

        const expectedUrl = await driver.getCurrentUrl();

        expect(expectedUrl).toBe('https://9292.nl/reisadvies/station-amsterdam-centraal/station-alkmaar/vertrek/2019-08-28T2309');
    });
});