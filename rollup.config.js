import fs from 'fs';
import path from 'path';
import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-only';
import { string } from 'rollup-plugin-string';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const componentsDir = 'src';
const components = fs.readdirSync(componentsDir).filter(file =>
    fs.statSync(path.join(componentsDir, file)).isDirectory()
);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createConfig(name, outputFilename, customElement = false, useMonaco = false) {
    const componentName = capitalizeFirstLetter(name);
    return {
        input: `src/${name}/${componentName}.svelte`,
        output: {
            dir: production ? `build/dist` : `build/dev`,
            entryFileNames: outputFilename,
            chunkFileNames: 'chunks/[name]-[hash].js',
            format: 'esm',
            sourcemap: true
        },
        plugins: [
            svelte({
                compilerOptions: {
                    dev: !production,
                    customElement
                }
            }),
            css({ output: `${componentName}${customElement ? '.custom' : ''}.css` }),
            useMonaco && string({
                include: [
                    "**/node_modules/monaco-editor/**/workerMain.js",
                    "**/node_modules/monaco-editor/**/*.worker.js"
                ]
            }),
            nodeResolve({
                browser: true,
                dedupe: ['svelte']
            }),
            production && terser()
        ],
        onwarn: function (warning, warn) {
            // FIXME: 1개의 '.svelte' 파일로 '보통의 스벨트 컴포넌트 번들링'과 '표준 웹 커스텀 컴포넌트 번들링'을 모두 하는 경우에 발생하는 경고를 무시한다.
            //        이 경고는 '.svelte' 파일에 '<svelte:options customElement="s-marquee" />' 옵션이 설정되어 있는 상태에서
            //        'customElement: false'로 설정하여 번들링을 할 때 발생한다. 현재 시점에서 이 경고는 무시해도 될 것으로 보여 번들링 경고에서 제외한다.
            if (!customElement
                && warning.code === 'PLUGIN_WARNING'
                && warning.plugin === 'svelte'
                && warning.message.includes('The \'customElement\' option is used when generating a custom element.')) {
                return;
            }

            warn(warning);
        }
    };
}


const configs = components.flatMap(name => [
    {
        ...createConfig(
            name,
            `${capitalizeFirstLetter(name)}.js`,
            false,
            name === "MonacoEditor"
        ),
        context: 'globalThis'
    },
    {
        ...createConfig(
            name,
            `${capitalizeFirstLetter(name)}.custom.js`,
            true,
            name === "MonacoEditor"
        ),
        context: 'globalThis'
    }
]);

export default configs;
