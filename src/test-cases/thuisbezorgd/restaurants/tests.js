const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {getPriceFromLabel} = require('../../../parsers');

describe('Restaurants page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://www.thuisbezorgd.nl/en/order-takeaway-amsterdam-1016';
    const visibleRestaurantItemSelector = '.restaurant:not(.restaurant_hide):not(#SingleRestaurantTemplateIdentifier)';

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check all labels with min. order amount have prices less than 10', async function () {
        await driver.get(pageUrl);
        const minOrderCostElement = await driver.findElement(By.css('[data-type="MinimumOrderCosts"][data-value="[0,10]"]'));

        await minOrderCostElement.click();
        const minOrderCostElementClass = await minOrderCostElement.getAttribute('class');

        expect(minOrderCostElementClass).toMatch('filter-label-selected');
        const minOrderLabelSelector = By.css(visibleRestaurantItemSelector + ' .min-order');

        await driver.wait(until.elementLocated(minOrderLabelSelector), 500);

        const minOrderLabels = await driver.findElements(minOrderLabelSelector);

        for (const minOrderLabel of minOrderLabels) {
            const labelText = await minOrderLabel.getText();
            const minOrderAmount = getPriceFromLabel(labelText);

            expect(minOrderAmount).not.toBeNaN();
            expect(minOrderAmount).toBeLessThan(10);
            expect(minOrderAmount).toBeGreaterThan(0);
        }
    });

    test('Check all labels for free delivery', async function () {
        await driver.get(pageUrl);
        const freeDeliveryOption = await driver.findElement(By.css('[data-type="DeliveryCosts"][data-value="[0,0]"]'));

        await freeDeliveryOption.click();
        const freeDeliveryOptionClass = await freeDeliveryOption.getAttribute('class');

        expect(freeDeliveryOptionClass).toMatch('filter-label-selected');
        const freeDeliveryLabelSelector = By.css(visibleRestaurantItemSelector + ' .delivery-cost');

        await driver.wait(until.elementLocated(freeDeliveryLabelSelector), 500);

        const freeDeliveryLabels = await driver.findElements(freeDeliveryLabelSelector);

        for (const freeDeliveryLabel of freeDeliveryLabels) {
            const labelText = await freeDeliveryLabel.getText();

            expect(labelText).toBe('FREE');
        }
    });

    test('Check all labels with rating 4', async function () {
        await driver.get(pageUrl);

        /**
         * HACK: scroll page to the bottom to remove the class "filter-wrapper-scrolling" on .filter-wrapper element.
         * With this class element does not allow to trigger a click event on its child elements
         */
        await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');

        const ratingOption = await driver.findElement(By.css('[data-type="Rating"][data-value="[4,5]"]'));
        await ratingOption.click();

        const ratingOptionClass = await ratingOption.getAttribute('class');

        expect(ratingOptionClass).toMatch('starfilter-selected');

        const starsRangeSelector = By.css(visibleRestaurantItemSelector + ' .review-stars-range');

        await driver.wait(until.elementsLocated(starsRangeSelector), 500);
        const starsRangeElements = await driver.findElements(starsRangeSelector);

        for(const starsRange of starsRangeElements) {
            const starsRangeStyle = await starsRange.getAttribute('style'); // 'width: 91%;'
            const widthMatch = /width: *([0-9.]+)/.exec(starsRangeStyle);

            if (widthMatch === null) {
                throw new Error('Invalid width value: ' + starsRangeStyle);
            }

            expect(Number(widthMatch[1])).toBeGreaterThanOrEqual(80);
        }
    });

    test('Check all labels with specified type of kitchen', async function () {
        await driver.get(pageUrl);
        const cuisineTypeElement = await driver.findElement(By.css('[data-type="Cuisine"][data-value="501"]'));

        await cuisineTypeElement.click();

        const cuisineTypeElementClass = await cuisineTypeElement.getAttribute('class');

        expect(cuisineTypeElementClass).toMatch('filter-label-selected');

        const cuisineLabelSelector = By.css(visibleRestaurantItemSelector + ' .kitchens');
        await driver.wait(until.elementsLocated(cuisineLabelSelector), 500);

        const cuisineLabels = await driver.findElements(cuisineLabelSelector);

        for (const cuisineLabel of cuisineLabels) {
            const cuisineLabelText = await cuisineLabel.getText();

            expect(cuisineLabelText).toMatch('Greek');
        }
    });
});