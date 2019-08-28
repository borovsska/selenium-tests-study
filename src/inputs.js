const {Key} = require('selenium-webdriver');

exports.clearInput = async function (input) {
    const inputValue = await input.getAttribute('value');

    if (!inputValue) {
        return;
    }

    for(let i = 0; i < inputValue.length; i++) {
        await input.sendKeys(Key.BACK_SPACE);
    }
};