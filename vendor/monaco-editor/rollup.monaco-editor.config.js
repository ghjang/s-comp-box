import path from 'path';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';

const isProduction = process.env.NODE_ENV === 'dist';
const outputDirBaseName = isProduction ? 'dist' : 'dev';
const outputDirPath = `../../build/${outputDirBaseName}/vendor/monaco-editor`;

const inputs = {
    'monaco-editor-custom': './monaco-editor-custom.js',
    'editor.worker': '../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'
};

export default Object.keys(inputs).map(name => {
    const configObj = {
        input: inputs[name],
        output: {
            dir: path.resolve(__dirname, outputDirPath),
            format: 'esm',
            sourcemap: true,
            entryFileNames: '[name].bundle.js',
            chunkFileNames: '[name].bundle.[hash].js',
            manualChunks(id) {
                if (id.includes('node_modules')) {
                    const libraryName = id.split('node_modules/')[1].split('/')[0];
                    return `vendor.${libraryName}`;
                }
            }
        },
        plugins: [
            nodeResolve({
                browser: true,
                preferBuiltins: false
            }),
            css({ output: `${name}.css` }),
            url({
                include: ['**/*.ttf'],
                limit: Infinity
            }),
            isProduction && terser()
        ]
    }

    // NOTE: '모나코 에디터'의 '웹 워커'를 'ESM'으로 빌드시 '런타임 에러'가 발생함.
    if (name.endsWith('worker')) {
        configObj.output.format = 'umd';
        configObj.output.name = 'MonacoEditorWorker'; // UMD 네임스페이스
    }

    return configObj;
});
