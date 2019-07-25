const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {getPriceFromLabel} = require('../../../parsers');

describe('Restaurant page example', function () {
    // object to work with a browser
    let driver;

    async function openPage () {
        await driver.get('https://www.thuisbezorgd.nl/en/streetfood-by-han-amsterdam');
        await driver.findElement(By.css('.notice-container')).click();
        await driver.sleep(2000);
        await driver.findElement(By.css('.topbar__title-container')).click();
        await driver.findElement(By.css('#imysearchstring')).sendKeys('Rozengracht 30, Amsterdam');

        await driver
            .wait(until.elementLocated(By.css('[data-name="Rozengracht 30, Amsterdam"]')), 700)
            .click();
        await driver.sleep(3000);
    }

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check costs in shopping basket', async function () {
        await openPage();
        const [firstMeal, secondMeal] = await driver.findElements(By.css('[id^="popular"]'));

        await firstMeal.click();
        await secondMeal.click();
        await driver.wait(until.elementsLocated(By.css('.cart-single-meal')), 500);

        const mealsBasketPrices = await driver.findElements(By.css('.cart-meal-price'));
        const firstMealBasketPriceLabel = await mealsBasketPrices[0].getText();
        const secondMealBasketPriceLabel = await mealsBasketPrices[1].getText();
        const firstMealPriceLabel = await firstMeal.findElement(By.css('[itemprop="price"]')).getText();
        const secondMealPriceLabel = await secondMeal.findElement(By.css('[itemprop="price"]')).getText();

        expect(firstMealBasketPriceLabel).toBe(firstMealPriceLabel);
        expect(secondMealBasketPriceLabel).toBe(secondMealPriceLabel);

        const subTotalPriceLabel = await driver.findElement(By.css('.cart-sum-price')).getText();

        expect(getPriceFromLabel(subTotalPriceLabel)).toBe(
            getPriceFromLabel(secondMealPriceLabel) +
            getPriceFromLabel(firstMealPriceLabel)
        );
    });

    test('Check basket item deleting', async function () {
        await openPage();
        const mealInBasketSelector = By.css('#products .cart-single-meal');
        const firstMeal = await driver.findElement(By.css('[id^="popular"]'));

        await firstMeal.click();
        await driver.wait(until.elementLocated(mealInBasketSelector), 500);

        const deleteButton = await driver.findElement(By.css('.cart-meal-edit-delete'));

        await deleteButton.click();
        const basketMeals = await driver.findElements(mealInBasketSelector);

        expect(basketMeals).toEqual([]);
        expect(await driver.findElement(By.css('.basket-empty__text')).isDisplayed()).toBe(true);
    });

    test('Check basket total cost with delivery', async function () {
        await driver.get('https://www.thuisbezorgd.nl/en/sumo-take-away-delivery-amsterdam-nieuwezijds-voorburgwal');
        await driver.findElement(By.css('.notice-container')).click();
        await driver.sleep(2000);
        await driver.findElement(By.css('.topbar__title-container')).click();
        await driver.findElement(By.css('#imysearchstring')).sendKeys('Rozengracht 30, Amsterdam');

        await driver
            .wait(until.elementLocated(By.css('[data-name="Rozengracht 30, Amsterdam"]')), 700)
            .click();
        await driver.sleep(3000);

        const [firstMeal, secondMeal] = await driver.findElements(By.css('[id^="popular"]'));
        const mealInBasketSelector = By.css('#products .cart-single-meal');

        await firstMeal.click();
        await secondMeal.click();
        await driver.wait(until.elementLocated(mealInBasketSelector), 500);

        const mealsBasketPrices = await driver.findElements(By.css('.cart-meal-price'));
        const firstMealBasketPriceLabel = await mealsBasketPrices[0].getText();
        const secondMealBasketPriceLabel = await mealsBasketPrices[1].getText();
        const firstMealPriceLabel = await firstMeal.findElement(By.css('[itemprop="price"]')).getText();
        const secondMealPriceLabel = await secondMeal.findElement(By.css('[itemprop="price"]')).getText();
        const deliveryCostPriceLabel = await driver.findElement(By.css('.js-delivery-costs-row .cart-sum-price')).getText();

        expect(firstMealBasketPriceLabel).toBe(firstMealPriceLabel);
        expect(secondMealBasketPriceLabel).toBe(secondMealPriceLabel);

        const totalPriceLabel = await driver.findElement(By.css('.js-total-costs-row .cart-sum-price')).getText();

        expect(getPriceFromLabel(totalPriceLabel)).toBe(
            getPriceFromLabel(secondMealPriceLabel) +
            getPriceFromLabel(firstMealPriceLabel) +
            getPriceFromLabel(deliveryCostPriceLabel)
        );
    });
});