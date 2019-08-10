const {By, until} = require('selenium-webdriver');
const {createChromeDriver} = require('../../../webdrivers');

describe('Registration page', function () {
    // object to work with a browser
    let driver;
    const pageUrl = 'https://my.asos.com/identity/register?lang=nl-NL&store=NL&country=NL&keyStoreDataversion=p1swt7e-15&returnUrl=https%3A%2F%2Fwww.asos.com%2Fnl%2Fdames%2F';

    beforeEach(async function () {
        driver = await createChromeDriver();
    });

    afterEach(async function () {
        await driver.quit();
    });

    test('Check tooltips on the sign in page', async function () {
        await driver.get(pageUrl);
        await driver.findElement(By.css('#register-form [type="submit"]')).click();

        await driver.wait(until.elementsLocated(By.css('.field-validation-error')), 1000);

        const emailErrorText = await driver.findElement(By.css('#Email-error')).getText();
        const firstNameErrorText = await driver.findElement(By.css('#FirstName-error')).getText();
        const lastNameErrorText = await driver.findElement(By.css('#LastName-error')).getText();
        const passwordErrorText = await driver.findElement(By.css('#Password-error')).getText();
        const dateOfBirthErrorText = await driver.findElement(By.css('#BirthYear-error')).getText();

        expect(emailErrorText).toBe('Oeps! Hier moet je je e-mailadres invullen');
        expect(firstNameErrorText).toBe('We hebben je voornaam nodig - dat is gezelliger');
        expect(lastNameErrorText).toBe('Vergeet niet je achternaam!');
        expect(passwordErrorText).toBe('Hey, hier hebben we een wachtwoord nodig');
        expect(dateOfBirthErrorText).toBe('Voer je volledige geboortedatum in');
    });

    test('Check contacts settings', async function () {
        await driver.get(pageUrl);
        const inputs = await driver.findElements(By.css('#promos, #lifestyle, #newness, #partner'));

        async function getCheckboxesStatuses(checkboxes) {
            const statuses = [];

            for(const checkbox of checkboxes) {
                statuses.push(await checkbox.isSelected());
            }
            return statuses;
        }

        expect(await getCheckboxesStatuses(inputs)).toEqual([false, false, false, false]);

        await driver.findElement(By.css('.qa-all-pref-label-all')).click();

        expect(await getCheckboxesStatuses(inputs)).toEqual([true, true, true, true]);

        await driver.findElement(By.css('.qa-all-pref-label-clear')).click();

        expect(await getCheckboxesStatuses(inputs)).toEqual([false, false, false, false]);
    });
});