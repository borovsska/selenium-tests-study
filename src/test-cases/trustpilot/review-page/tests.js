const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {getPriceFromLabel} = require('../../../parsers');

describe('Review page', function () {
    let driver;
    const pageUrl = 'https://nl.trustpilot.com/review/www.bol.com';

    async function closeCookiesBar () {
        const cookieBar = await driver.findElement(By.css('.cookie-bar'));

        await cookieBar.findElement(By.css('[data-cookiebar-close]')).click();
        await driver.wait(until.elementIsNotVisible(cookieBar));
    }

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
        const allReviewsValues = await driver.findElements(By.css('.chart__cell__value'));
        let reviewsPercentageValue = 0;

        for (const reviewValue of allReviewsValues) {
            const reviewValueText = await reviewValue.getText();

            reviewsPercentageValue = reviewsPercentageValue + getPriceFromLabel(reviewValueText);
        }

        expect(reviewsPercentageValue).toBe(100);
    });

    test('Check reviews filter', async function () {
        await driver.get(pageUrl);
        await driver.findElement(By.css('.star-rating-filter-button')).click();
        await driver.wait(until.elementLocated(By.css('.v-portal')), 500);
        await driver.findElement(By.css('.modal-dialog-body .star-rating-1')).click();
        await driver.wait(until.elementLocated(By.css('.modal-dialog-body .chart__row--highlight')), 500);
        await driver.findElement(By.css('.modal-dialog-footer .button')).click();
        await driver.sleep(2000);

        const reviewStarsRatingImages = await driver.findElements(By.css('.review-card .star-rating img'));

        expect(reviewStarsRatingImages.length).toBeGreaterThan(0);

        for (const ratingImage of reviewStarsRatingImages) {
            const ratingImageLink = await ratingImage.getAttribute('src');
            const ratingImageAltText = await ratingImage.getAttribute('alt');

            expect(ratingImageLink).toMatch(/stars-1\.svg$/);
            expect(ratingImageAltText).toBe('1 ster: zeer slecht');
        }
    });

    test('Check reviews chart rows', async function () {
        await driver.get(pageUrl);

        const reviewsChartRows = await driver.findElements(By.css('.chart__row'));

        for (const chartRow of reviewsChartRows) {
            await chartRow.click();
            await driver.sleep(1500);
            const chartRowClass = await chartRow.getAttribute('class');

            expect(chartRowClass).toMatch(/highlight/);
        }
    });

    test('Check number of customer reviews', async function () {
        await driver.get(pageUrl);
        await closeCookiesBar();

        const customerReviewLabel = await driver.findElement(By.css('.consumer-information__data'));
        const customerReviewLabelNumber = await customerReviewLabel.getText();

        await customerReviewLabel.click();
        await driver.wait(until.elementLocated(By.css('.user-summary-overview')), 1000);

        const customerReviewsLabel = await driver.findElement(By.css('.consumer-information__review-count'));
        const customerReviewsLabelNumber = await customerReviewsLabel.getText();
        const customerReviewsBlocks = await driver.findElements(By.css('.review-card'));

        expect(getPriceFromLabel(customerReviewsLabelNumber)).toBe(customerReviewsBlocks.length);
        expect(getPriceFromLabel(customerReviewLabelNumber)).toBe(customerReviewsBlocks.length);

    });

    test('Check that total number of reviews on the 1 page is not more than 20', async function () {
        await driver.get('https://nl.trustpilot.com/review/www.ah.nl');
        await closeCookiesBar();

        const getNextPageButton = async () => {
            const elements = await driver.findElements(By.css('[data-page-number="next-page"]'));

            return elements[0];
        };

        let nextPageButton = await getNextPageButton();

        expect(nextPageButton).toBeDefined();

        while (nextPageButton) {
            const reviewsBlocks = await driver.findElements(By.css('.review-card'));

            expect(reviewsBlocks.length).toBeLessThanOrEqual(20);

            await nextPageButton.click();
            await driver.sleep(1000);
            nextPageButton = await getNextPageButton();
        }
    });
});