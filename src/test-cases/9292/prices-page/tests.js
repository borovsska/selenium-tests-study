const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {clearInput} = require('../../../inputs');
const {acceptCookies} = require('../helpers');

describe('Prices page', function () {
    let driver;
    const pageUrl = 'https://9292.nl/prijzen-en-abonnementen/reizen-op-rekening';

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check images', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);

        const images = await driver.findElements(By.css('.tablerowitem.introImageCol'));
        const image1Rect = await images[0].getRect();
        const image2Rect = await images[1].getRect();

        expect(image1Rect).toMatchObject({height: 285, width: 177});
        expect(image2Rect).toMatchObject({height: 313, width: 177});
    });
});