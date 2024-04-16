import fs from 'fs';
import path from 'path';
import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-only';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const componentsDir = 'src';
const components = fs.readdirSync(componentsDir).filter(file =>
    fs.statSync(path.join(componentsDir, file)).isDirectory()
);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createConfig(name, outputFilename, customElement = false) {
    const componentName = capitalizeFirstLetter(name);
    return {
        input: `src/${name}/${componentName}.svelte`,
        output: {
            file: production ? `build/dist/${outputFilename}` : `build/dev/${outputFilename}`,
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
            nodeResolve({
                browser: true,
                dedupe: ['svelte']
            }),
            production && terser()
        ]
    };
}


export default components.flatMap(name => [
    createConfig(name, `${capitalizeFirstLetter(name)}.js`),
    createConfig(name, `${capitalizeFirstLetter(name)}.custom.js`, true)
]);
