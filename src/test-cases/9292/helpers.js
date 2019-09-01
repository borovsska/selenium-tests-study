const {until, By} = require('selenium-webdriver');

exports.acceptCookies = async function (driver) {
    await driver.wait(until.elementLocated(By.css('#btnAccord')), 1000);
    await driver.executeScript(`document.querySelector('#btnAccord').click()`);
};