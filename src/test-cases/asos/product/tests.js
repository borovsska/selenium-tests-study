const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {getPriceFromLabel} = require('../../../parsers');

describe('Product page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://www.asos.com/nl/asos-design/asos-design-schouderloze-maxi-jurk-met-bloemenprint/prd/12978097?clr=multi&colourWayId=16450741&SearchQuery=&cid=2623';

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

    test('Check products adding to the basket', async function () {
        await driver.get(pageUrl);
        const addingToBasketButton = await driver.findElement(By.css('.add-item'));

        await addingToBasketButton.click();
        await driver.wait(until.elementLocated(By.css('.basic-error-box')), 500);

        const errorText = await driver.findElement(By.css('.basic-error-box')).getText();

        expect(errorText).toBe('Kies uit de beschikbare kleur- en maatopties.');
        async function selectSize (itemIndex) {
            await driver.executeScript(`
                const select = document.querySelector('[data-id="sizeSelect"]');
                const changeEvent = new Event('change');
                
                select.querySelector('option:nth-child(${itemIndex})').selected = true;
                select.dispatchEvent(changeEvent);
            `);
        }

        await selectSize(2);
        await addingToBasketButton.click();
        await driver.sleep(8000);
        await selectSize(3);
        await addingToBasketButton.click();
        await driver.sleep(2000);

        await driver.findElement(By.css('#miniBagDropdown')).click();
        await driver.sleep(2000);
        await driver.findElement(By.css('[data-test-id="bag-link"]')).click();

        const subtotalPriceLocator = By.css('.bag-contents-holder .bag-total-price');
        const priceLabelLocator = By.css('.bag-contents-holder .bag-item-price--current');

        await driver.wait(until.elementLocated(subtotalPriceLocator), 1000);
        await driver.wait(until.elementsLocated(priceLabelLocator), 1000);
        const subtotalPriceLabel = await driver.findElement(subtotalPriceLocator).getText();

        expect(subtotalPriceLabel).toMatch(/^€ [0-9]+,[0-9]{2}$/);

        const priceLabels = await driver.findElements(priceLabelLocator);
        let totalProductsPrice = 0;

        for(const priceLabel of priceLabels) {
            const priceLabelText = await priceLabel.getText();

            totalProductsPrice = totalProductsPrice + getPriceFromLabel(priceLabelText);
        }

        expect(getPriceFromLabel(subtotalPriceLabel)).toBe(totalProductsPrice);

        const standardDeliveryOptionText = await driver
            .findElement(By.css('.delivery-dropdown-holder [id^="select2"]'))
            .getText();

        expect(standardDeliveryOptionText).toBe('Standaardlevering (Gratis)');
    });

    test('Check product size selection', async function () {
        await driver.get(pageUrl);

        const sizeSelection = await driver.findElements(By.css('#product-size [data-id="sizeSelect"] option'));

        expect(sizeSelection.length).toBeGreaterThan(1);
    });
});

