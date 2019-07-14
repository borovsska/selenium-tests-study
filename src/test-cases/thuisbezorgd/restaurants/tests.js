const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');

describe('Restaurants page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://www.thuisbezorgd.nl/en/order-takeaway-amsterdam-1016';

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    /**
     *  Add new tests group for the rest. page
     *      * select min. order amount less than 10
     *      * check that all labels have prices less than 10
     */

    test('Check all labels with min. order amount have prices less than 10', async function () {
        await driver.get(pageUrl);
        const minOrderCostElement = await driver.findElement(By.css('[data-type="MinimumOrderCosts"][data-value="[0,10]"]'));

        await minOrderCostElement.click();
        const minOrderCostElementClass = await minOrderCostElement.getAttribute('class');

        expect(minOrderCostElementClass).toMatch('filter-label-selected');
        const minOrderLabelSelector = By.css('.restaurant:not(.restaurant_hide) .min-order');

        await driver.wait(until.elementLocated(minOrderLabelSelector), 500);

        const minOrderLabels = await driver.findElements(minOrderLabelSelector);

        for (const minOrderLabel of minOrderLabels) {
            const labelText = await minOrderLabel.getText();
            const labelTextMatch = /[0-9,]+/.exec(labelText);

            if (labelTextMatch === null) {
                throw new Error('Invalid min. order label: ' + labelText);
            }

            const minOrderAmountFromLabel = labelTextMatch[0];
            const minOrderAmount = Number(minOrderAmountFromLabel.replace(',', '.'));

            expect(minOrderAmount).not.toBeNaN();
            expect(minOrderAmount).toBeLessThan(10);
            expect(minOrderAmount).toBeGreaterThan(0);
        }
    });
});