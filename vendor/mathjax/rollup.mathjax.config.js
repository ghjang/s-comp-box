import resolve from '@rollup/plugin-node-resolve'; // 모듈 해석을 위한 플러그인
import commonjs from '@rollup/plugin-commonjs'; // CommonJS 모듈을 ES6으로 변환


const isProduction = process.env.NODE_ENV === 'dist';
const outputDirBaseName = isProduction ? 'dist' : 'dev';
const outputDirPath = `../../build/${outputDirBaseName}/vendor/mathjax`;


export default {
    input: 'custom-mathjax-entry.js', // 진입점 파일 설정
    output: {
        file: `${outputDirPath}/s-mathjax.js`, // 출력 파일 설정
        format: 'esm', // 출력 포맷을 ES6 모듈로 변경
    },
    plugins: [
        resolve(), // Node.js 스타일의 모듈 해석을 가능하게 함
        commonjs() // CommonJS 모듈을 ES6 모듈로 변환
    ],
    external: [] // 필요한 경우, 외부 모듈을 배열로 명시
};
