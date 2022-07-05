const imagePNG = require('./icon.png');
const imageSVG = require('./icon.svg');
const number = require('./number');

require(/* webpackChunkName: 'async' */ './async.js').then((result) => console.log(result));

const a = 2 + 2;

module.exports = function Foo() {
  const b = 2 + 2;

  console.log(a);
  console.log(b);
  console.log(imagePNG);
  console.log(imageSVG);
  console.log(number);
};
