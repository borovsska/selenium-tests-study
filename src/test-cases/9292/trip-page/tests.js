const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');
const {acceptCookies} = require('../helpers');

describe('Trip page', function () {
    // object to work with a browser
    let driver;
    const actualDate = new Date();
    const year = actualDate.getFullYear();
    const month = String(actualDate.getMonth() + 1).padStart(2, '0');
    const date = String(actualDate.getDate() + 1).padStart(2, '0');
    const hours = actualDate.getHours();
    const minutes = actualDate.getMinutes();
    const dateStr = `${year}-${month}-${date}T${hours}${minutes}`;
    const pageUrl = `https://9292.nl/reisadvies/station-amsterdam-centraal/station-alkmaar/vertrek/${dateStr}`;
    const timePattern = /^[0-9]{2}:[0-9]{2}$/;

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check departure and arrival time of the trip', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);

        const activePanel = driver.findElement(By.css('.dynamic-tab-pane-control.active'));
        const [departureTimeLabel, arrivalTimeLabel] = await driver.findElements(
            By.css('.nav-link.active .journey-option__time-option')
        );
        const [
            scheduledDepartureTimeLabel,
            scheduledArrivalTimeLabel
        ] = await activePanel.findElements(By.css('.scheduled-leg > .timeline-time'));

        const departureTimeText = await departureTimeLabel.getText();
        const arrivalTimeText = await arrivalTimeLabel.getText();
        const scheduledDepartureTimeText = await scheduledDepartureTimeLabel.getText();
        const scheduledArrivalTimeText = await scheduledArrivalTimeLabel.getText();

        expect(departureTimeText).toMatch(timePattern);
        expect(arrivalTimeText).toMatch(timePattern);

        expect(departureTimeText).toBe(scheduledDepartureTimeText);
        expect(arrivalTimeText).toBe(scheduledArrivalTimeText);
    });

    test('Check intermediate stops in the trip', async function () {
        await driver.get(pageUrl);
        await acceptCookies(driver);
        const activePanel = driver.findElement(By.css('.dynamic-tab-pane-control.active'));

        await driver.sleep(1000);
        await activePanel.findElement(By.css('.link-toggle-closed')).click();

        const stopsInfoLocator = By.css('.leg-item-toggleInfo');

        await driver.wait(until.elementLocated(stopsInfoLocator), 500);

        const intermediateStopsLabels = await activePanel.findElements(By.css('.leg-item-open .leg-item-toggleInfo .stop'));

        expect(intermediateStopsLabels.length).toBeGreaterThan(0);

        for(const stopLabel of intermediateStopsLabels) {
            const timeLabel = await stopLabel.findElement(By.css('.timeline-time'));
            const timeText = await timeLabel.getText();

            expect(timeText).toMatch(timePattern);
        }

        const stopsInfo = await activePanel.findElement(stopsInfoLocator);

        await driver.sleep(1000);
        await activePanel.findElement(By.css('[data-toggle-class="leg-item-open"]')).click();
        await driver.wait(until.elementIsNotVisible(stopsInfo), 500);
    });
});