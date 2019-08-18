require('chromedriver');
const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

exports.createChromeDriver = async function () {
    const chromeOptions = new chrome.Options();

    chromeOptions.options_['w3c'] = false;
    // chromeOptions.headless();

    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
};
