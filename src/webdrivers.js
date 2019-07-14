require('chromedriver');
const {Builder} = require('selenium-webdriver');

exports.createChromeDriver = async function () {
   return new Builder().forBrowser('chrome').build();
};
