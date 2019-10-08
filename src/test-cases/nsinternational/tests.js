const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../webdrivers');
const {getPriceFromLabel} = require('../../parsers');

describe('Home page', function () {
    let driver;
    const pageUrl = 'https://www.nsinternational.nl/en';

    async function acceptCookies (driver) {
        await driver.wait(until.elementLocated(By.css('.r42CookieBar')), 3000);

        await driver.executeScript(`
            document
                .querySelector('.r42CookieBar')
                .contentDocument
                    .querySelector('.button.accept')
                    .click()
        `);
    }

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check the minimal price of tickets', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);

        const departureBlock = await driver.findElement(By.css('.origin-destination__origin'));

        await departureBlock.findElement(By.css('.nsi-form-customselect__current__input')).sendKeys('Amsterdam');
        await driver.wait(until.elementLocated(By.css('.origin-destination__origin .nsi-form-customselect__option')), 1000);

        await departureBlock.findElement(By.css('.nsi-form-customselect__option:first-child')).click();

        const arrivalBlock = await driver.findElement(By.css('.origin-destination__destination'));

        await arrivalBlock.findElement(By.css('.nsi-form-customselect__current__input')).sendKeys('Brussel');
        await driver.wait(until.elementLocated(By.css('.origin-destination__destination .nsi-form-customselect__option')), 1000);
        await arrivalBlock.findElement(By.css('.nsi-form-customselect__option:first-child')).click();

        await driver.findElement(By.css('.t-search-button')).click();
        await driver.wait(until.elementLocated(By.css('#calendar_outbound')), 3000);

        const ticketPriceButtons = await driver.findElements(By.css('.dayPrice'));
        let minPriceButton;
        let minPrice;
        const ticketPrices = [];

        for (const ticketPriceButton of ticketPriceButtons) {
            const isAvailable = await ticketPriceButton.isDisplayed();

            if (isAvailable) {
                const priceText = await ticketPriceButton.getText();
                const price = getPriceFromLabel(priceText);

                ticketPrices.push(price);

                if (price < minPrice || minPrice === undefined) {
                    minPrice = price;
                    minPriceButton = ticketPriceButton;
                }
            }
        }

        expect(ticketPrices.length).toBeGreaterThan(0);
        expect(minPrice).toBe(Math.min(...ticketPrices));
        expect(minPriceButton).toBeDefined();
    });
});