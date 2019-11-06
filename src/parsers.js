/**
 * @description This function returns a price from the label replacing a comma with a dot in the number
 * @param label
 * @returns {number}
 */
exports.getPriceFromLabel = function (label) {
    const labelParts = /[0-9,]+/.exec(label);

    if (labelParts === null) {
        throw new Error('Invalid price label: ' + label);
    }
    return Number(labelParts[0].replace(',', '.'));
};