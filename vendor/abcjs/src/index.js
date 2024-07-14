// NOTE: 'abcjs'는 'CommonJS' 모듈이다.
//       사실 롤업 설정 파일에서 'abcjs'의 'index.js' 파일 경로를
//       직접 'input'에 지정해서 사용할 수 있지만,
//       아래의 '단순 포워딩' 방법이 경로를 지정하지 않아도 되기 때문에 더 편리하다.
//       추후에 변경이 있을 경우에도 이렇게 별도로 'index.js'를 만든 것이 더 나을 것 같다.
module.exports = require('abcjs');
