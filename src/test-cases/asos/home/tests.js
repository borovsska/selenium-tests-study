const {By, until, Key} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');

describe('Home page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://www.asos.com/nl/dames/';

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check that search input contains more than 1 item', async function () {
        await driver.get(pageUrl);
        const searchInput = await driver.findElement(By.css('[data-testid="search-input"]'));
        const searchText = 'shirt';

        await searchInput.sendKeys(searchText);
        await driver.wait(until.elementLocated(By.css('#search-results')), 500);
        const searchResultsLabels = await driver.findElements(By.css('#search-results > li'));

        expect(searchResultsLabels.length).toBeGreaterThan(0);

        for(let i = 0; i < searchText.length; i++) {
            await searchInput.sendKeys(Key.BACK_SPACE);
        }
        await driver.sleep(1000);
        const searchResultsLists = await driver.findElements(By.css('#search-results'));

        expect(searchResultsLists.length).toBe(0);
    });

    test('Check search input id', async function () {
        await driver.get(pageUrl);
        const searchInputId = await driver.findElement(By.css('[data-testid="search-input"]')).getAttribute('id');

        expect(searchInputId).toBe('chrome-search');
    });
});