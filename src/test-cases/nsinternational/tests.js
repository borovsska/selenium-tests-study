const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../webdrivers');
const {getPriceFromLabel} = require('../../parsers');

describe('Home page', function () {
    let driver;
    const pageUrl = 'https://www.nsinternational.nl/en';

    async function acceptCookies (driver) {
        await driver.wait(until.elementLocated(By.css('.r42CookieBar')), 3000);

        await driver.executeScript(`
            document
                .querySelector('.r42CookieBar')
                .contentDocument
                    .querySelector('.button.accept')
                    .click()
        `);
    }

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check the minimal price of tickets', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);

        const departureBlock = await driver.findElement(By.css('.origin-destination__origin'));

        await departureBlock.findElement(By.css('.nsi-form-customselect__current__input')).sendKeys('Amsterdam');
        await driver.wait(until.elementLocated(By.css('.origin-destination__origin .nsi-form-customselect__option')), 1000);

        await departureBlock.findElement(By.css('.nsi-form-customselect__option:first-child')).click();

        const arrivalBlock = await driver.findElement(By.css('.origin-destination__destination'));

        await arrivalBlock.findElement(By.css('.nsi-form-customselect__current__input')).sendKeys('Brussel');
        await driver.wait(until.elementLocated(By.css('.origin-destination__destination .nsi-form-customselect__option')), 1000);
        await arrivalBlock.findElement(By.css('.nsi-form-customselect__option:first-child')).click();

        await driver.findElement(By.css('.t-search-button')).click();
        await driver.wait(until.elementLocated(By.css('#calendar_outbound')), 5000);

        const departureTicketButtons = await driver.findElements(By.css('#calendar_outbound .dayPrice'));
        let departureTicketButton;
        let departureTicketPrice;
        let departureTicketButtonIndex;
        const departureTicketPrices = [];

        for (let i = 0; i < departureTicketButtons.length; i++) {
            const ticketPriceButton = departureTicketButtons[i];
            const isAvailable = await ticketPriceButton.isDisplayed();

            if (isAvailable) {
                const priceText = await ticketPriceButton.getText();
                const price = getPriceFromLabel(priceText);

                departureTicketPrices.push(price);

                if (price < departureTicketPrice || departureTicketPrice === undefined) {
                    departureTicketPrice = price;
                    departureTicketButton = ticketPriceButton;
                    departureTicketButtonIndex = i;
                }
            }
        }

        expect(departureTicketPrices.length).toBeGreaterThan(0);
        expect(departureTicketPrice).toBe(Math.min(...departureTicketPrices));
        expect(departureTicketButton).toBeDefined();
        expect(departureTicketButtonIndex).toBeGreaterThanOrEqual(0);

        await driver.actions({bridge: true})
            .move({x: 0, y: 0, origin: departureTicketButton})
            .perform();
        await driver.findElement(By.css('.calendar__legend')).click();

        await departureTicketButton.click();
        await driver.wait(until.elementLocated(By.css('.connections-plot')), 20000);
        await driver.findElement(By.css('.connections-plot')).click();
        await driver.wait(until.elementLocated(By.css('.connectionDetails--height')), 500);

        await driver.findElement(By.css('.connectionDetails--height .-button__chooseReturn')).click();
        await driver.wait(until.elementLocated(By.css('#calendar_inbound')), 3000);

        const arrivalTicketButtons = await driver.findElements(By.css('#calendar_inbound .dayPrice'));
        const arrivalTicketButton = arrivalTicketButtons[departureTicketButtonIndex + 1];
        const arrivalTicketPriceText = await arrivalTicketButton.getText();
        const arrivalTicketPrice = getPriceFromLabel(arrivalTicketPriceText);

        await arrivalTicketButton.click();
        await driver.wait(until.elementLocated(By.css('connections[direction="inbound"] .connections-plot')), 30000);
        const firstConnectionsOption = driver.findElement(By.css('connections[direction="inbound"] .connections-plot'));

        await driver.wait(until.elementIsVisible(firstConnectionsOption), 30000);
        await firstConnectionsOption.click();
        await driver.wait(until.elementLocated(By.css('.connectionDetails--height')), 500);

        await driver.findElement(By.css('.button.-button__toProvisional')).click();
        await driver.wait(until.elementLocated(By.css('.bookingSummary__price')), 2000);
        /**
         * @description This function returns a price from the label
         * @param {WebElement} bookingPriceLabel
         * @returns {number}
         */
        const getBookingPrice = (bookingPriceLabel) => {
            const totalOutboundPriceText = bookingPriceLabel.getText();

            return getPriceFromLabel(totalOutboundPriceText)
        };

        const [
            totalOutboundLabel,
            totalInboundLabel,
            totalTicketsPriceLabel
        ] = await driver.findElements(By.css('.bookingSummary__price'));
        // const totalOutboundPriceText = await totalOutboundLabel.getText();
        // const totalOutboundPrice = getPriceFromLabel(totalOutboundPriceText);

        // const totalInboundPriceText = await totalInboundLabel.getText();
        // const totalInboundPrice = getPriceFromLabel(totalInboundPriceText);

        // const totalTicketsPriceText = await totalTicketsPriceLabel.getText();
        // const totalTicketsPrice = getPriceFromLabel(totalTicketsPriceText);

        const totalOutboundPrice = getBookingPrice(totalOutboundLabel);
        const totalInboundPrice = getBookingPrice(totalInboundLabel);
        const totalTicketsPrice = getBookingPrice(totalTicketsPriceLabel);

        expect(totalTicketsPrice).toBe(totalInboundPrice + totalOutboundPrice);
        expect(totalOutboundPrice).toBe(departureTicketPrice);
        expect(totalInboundPrice).toBe(arrivalTicketPrice);
    });
});