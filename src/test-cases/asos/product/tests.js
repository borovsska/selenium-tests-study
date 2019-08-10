const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');

describe('Product page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://www.asos.com/nl/asos-tall/asos-design-tall-premium-geplooide-lange-jurk-met-kanten-inzetstuk/prd/12599677?CTARef=Saved+Items+Image';

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check adding and removing product in favourites', async function () {
        await driver.get(pageUrl);
        const productName = await driver.findElement(By.css('.product-hero > h1')).getText();
        const favouriteButton = await driver.findElement(By.css('.save-button-link'));

        await favouriteButton.click();
        const favouriteButtonClassName = await favouriteButton.getAttribute('class');

        expect(favouriteButtonClassName).toMatch('active');

        await driver.findElement(By.css('[data-testid="savedItemsIcon"]')).click();
        await driver.wait(until.elementLocated(By.css('[class^="productTile"]')), 1000);
        const productNameInFavourites = await driver.findElement(By.css('[class^="title"]')).getText();

        expect(productNameInFavourites).toBe(productName);

        await driver.executeScript(`document.querySelector('[class^="spinner_"]').style.display = 'none';`);
        await driver.sleep(300);
        await driver.findElement(By.css('[class^="deleteButton"]')).click();
        const emptyFavouritesTitleLocator = By.css('[class^="noSavedItemsPrompt"]');

        await driver.wait(until.elementLocated(emptyFavouritesTitleLocator), 500);
        const emptyFavouritesTitle = await driver.findElement(emptyFavouritesTitleLocator).getText();

        expect(emptyFavouritesTitle).toBe('Je hebt geen Favorieten');
    });

    test('Check product price format', async function () {
        await driver.get(pageUrl);
        const productPriceLabel = await driver.findElement(By.css('[data-id="current-price"]')).getText();

        expect(productPriceLabel).toMatch(/^€ [0-9]+,[0-9]{2}$/);
    });
});


