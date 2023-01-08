module.exports.isValidNumber = (num) => {
  const regexp = /^\d+$/;
  console.log('this is test', regexp.test(num), num.length === 10);

  return regexp.test(num) && num.length === 10;
};

module.exports.isValidInvoiceAmountAndGreaterThanZero = (num) => {
  const regexp = /^\d+$/;
  return regexp.test(num) && num >= 0;
}