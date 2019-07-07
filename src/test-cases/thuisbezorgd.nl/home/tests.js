require('chromedriver');
const {Builder, By, until} = require('selenium-webdriver');

describe('Home page', function () {
    // object to work with a browser
    let driver;
    const homePageUrl = 'https://www.thuisbezorgd.nl/en/';

    beforeEach(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    afterEach(async function() {
        await driver.quit();
    });

    test('Check the response of the search input with a valid address', async function () {
        // open page
        await driver.get(homePageUrl);

        // find search input by CSS selector and enter the address
        await driver.findElement(By.css('#imysearchstring')).sendKeys('Rozengracht 30, Amsterdam');

        // wait for the first address suggestions
        const firstAddressItem = await driver.wait(until.elementLocated(By.css('[data-name="Rozengracht 30, Amsterdam"]')), 700);

        await firstAddressItem.click();

        // wait for the list of restaurants
        await driver.wait(until.elementLocated(By.css('[id^="irestaurant"]')), 1000);
    });

    test('Check the response of the search input with non-existing address', async function () {
        await driver.get(homePageUrl);
        await driver.findElement(By.css('#imysearchstring')).sendKeys('Gagarina 112, Dnipro');
        await driver.findElement(By.css('#submit_deliveryarea')).click();
        const errorBlock = await driver.findElement(By.css('#ideliveryareaerror'));

        await driver.wait(until.elementIsVisible(errorBlock), 700);
    });

    test('Check my account menu opening', async function () {
        await driver.get(homePageUrl);
        await driver.findElement(By.css('.menu.button-myaccount')).click();
        const userPanel = await driver.findElement(By.css('#userpanel'));

        await driver.wait(until.elementIsVisible(userPanel), 700);

        const userPanelTitle = await userPanel.findElement(By.css('.name')).getText();

        expect(userPanelTitle).toBe('My account');
    });
});