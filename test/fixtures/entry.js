import imagePNG from './icon.png';
import imageSVG from './icon.svg';
import number from './number';

import(/* webpackChunkName: 'async' */ './async.js').then((result) => console.log(result));

const a = 2 + 2;

module.exports = function Foo() {
  const b = 2 + 2;

  console.log(a);
  console.log(b);
  console.log(imagePNG);
  console.log(imageSVG);
  console.log(number);
};
