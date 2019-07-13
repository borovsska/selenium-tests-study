require('chromedriver');
const {Builder, By, until} = require('selenium-webdriver');

describe('Home page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://www.thuisbezorgd.nl/en/';

    beforeEach(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    afterEach(async function() {
        await driver.quit();
    });

    test('Check the response of the search input with a valid address', async function () {
        // open page
        await driver.get(pageUrl);

        // find search input by CSS selector and enter the address
        await driver.findElement(By.css('#imysearchstring')).sendKeys('Rozengracht 30, Amsterdam');

        // wait for the first address suggestions
        const firstAddressItem = await driver.wait(
            until.elementLocated(By.css('[data-name="Rozengracht 30, Amsterdam"]')),
            700
        );

        await firstAddressItem.click();

        // wait for the list of restaurants
        await driver.wait(until.elementLocated(By.css('[id^="irestaurant"]')), 1000);
    });

    test('Check the response of the search input with non-existing address', async function () {
        await driver.get(pageUrl);
        await driver.findElement(By.css('#imysearchstring')).sendKeys('Gagarina 112, Dnipro');
        await driver.findElement(By.css('#submit_deliveryarea')).click();
        const errorBlock = await driver.findElement(By.css('#ideliveryareaerror'));

        await driver.wait(until.elementIsVisible(errorBlock), 700);
    });

    test('Check my account menu opening', async function () {
        await driver.get(pageUrl);
        await driver.findElement(By.css('.menu.button-myaccount')).click();
        const userPanel = await driver.findElement(By.css('#userpanel'));

        await driver.wait(until.elementIsVisible(userPanel), 700);

        const userPanelTitle = await userPanel.findElement(By.css('.name')).getText();

        expect(userPanelTitle).toBe('My account');
    });

    test('Check countries and languages in the list', async function () {
        await driver.get(pageUrl);
        await driver.findElement(By.css('#locale')).click();

        const countriesAndLanguagesModal = await driver.findElement(By.css('.language-country-modal'));

        await driver.wait(until.elementIsVisible(countriesAndLanguagesModal), 500);

        const countriesListTitle = await countriesAndLanguagesModal
            .findElement(By.css('.list-container:first-child > .title'))
            .getText();

        expect(countriesListTitle).toBe('Country');

        const languagesListTitle = await countriesAndLanguagesModal
            .findElement(By.css('.list-container:last-child > .title'))
            .getText();

        expect(languagesListTitle).toBe('Language');

        const countriesLinks = await driver.findElements(By.css('.list-container:first-child a'));
        const countries = [];

        for (const link of countriesLinks) {
            const linkText = await link.getText();

            countries.push(linkText);
        }

        expect(countries).toEqual([
            'The Netherlands',
            'Belgium',
            'Germany',
            'Poland',
            'Austria',
            'Switzerland',
            'Luxembourg',
            'Portugal',
            'Vietnam',
            'Bulgaria',
            'Romania',
            'Israel'
        ]);

        const languagesLinks = await driver.findElements(By.css('.list-container:last-child a'));
        const languages = [];

        for (const languagesLink of languagesLinks) {
            const languagesLinkText = await languagesLink.getText();

            languages.push(languagesLinkText);
        }

        expect(languages).toEqual([
           'English',
            'Nederlands',
            'Deutsch',
            'Français',
            'Polski',
            'Português',
            'Română',
            'Български',
            'Italiano'
        ]);
    });
});