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

    test('Check all labels for free delivery', async function () {
        await driver.get(pageUrl);
        const freeDeliveryOption = await driver.findElement(By.css('[data-type="DeliveryCosts"][data-value="[0,0]"]'));

        await freeDeliveryOption.click();
        const freeDeliveryOptionClass = await freeDeliveryOption.getAttribute('class');

        expect(freeDeliveryOptionClass).toMatch('filter-label-selected');
        const freeDeliveryLabelSelector = By.css('.restaurant:not(.restaurant_hide) .delivery-cost');

        await driver.wait(until.elementLocated(freeDeliveryLabelSelector), 500);

        const freeDeliveryLabels = await driver.findElements(freeDeliveryLabelSelector);

        for (const freeDeliveryLabel of freeDeliveryLabels) {
            const labelText = await freeDeliveryLabel.getText();

            expect(labelText).toBe('FREE');
        }
    });
});