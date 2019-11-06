const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {getPriceFromLabel} = require('../../../parsers');

describe('Review page', function () {
    let driver;
    const pageUrl = 'https://nl.trustpilot.com/review/www.ns.nl';

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check business sign up box deletion', async function () {
        await driver.get(pageUrl);

        const businessSignUpBox = await driver.findElement(By.css('.business-signup-box'));

        await businessSignUpBox.findElement(By.css('.business-signup-box--close')).click();
        await driver.wait(until.elementIsNotVisible(businessSignUpBox));
    });

    test('Check number of reviews', async function () {
        await driver.get(pageUrl);

        const headReviewsLabel = await driver.findElement(By.css('.header--inline'));
        const headReviewsLabelText = await headReviewsLabel.getText();

        const overviewReviewsLabel = await driver.findElement(By.css('.headline__review-count'));
        const overviewReviewsLabelText = await overviewReviewsLabel.getText();

        expect(getPriceFromLabel(headReviewsLabelText)).toBe(getPriceFromLabel(overviewReviewsLabelText));
    });

    test('Check percentage of reviews', async function () {
        await driver.get(pageUrl);
        const allReviewsValue = await driver.findElements(By.css('.chart__cell__value'));
        let reviewsPercentageValue = 0;

        for(const reviewValue of allReviewsValue) {
            const reviewValueText = await reviewValue.getText();

            reviewsPercentageValue = reviewsPercentageValue + getPriceFromLabel(reviewValueText);
        }

        expect(reviewsPercentageValue).toBe(100);
    });
});