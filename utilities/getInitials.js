// eslint-disable-next-line newline-per-chained-call
module.exports = (str) => str.split(' ').map((i) => i[0]).join('').substr(0, 3).toUpperCase();
