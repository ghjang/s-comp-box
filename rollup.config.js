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

export default components.map(name => {
    const componentName = capitalizeFirstLetter(name);
    return {
        input: `src/${name}/${componentName}.svelte`,
        output: {
            file: production ? `build/dist/${componentName}.js` : `build/dev/${componentName}.js`,
            format: 'esm',
            sourcemap: true
        },
        plugins: [
            svelte({
                compilerOptions: {
                    dev: !production
                }
            }),
            css({ output: `${componentName}.css` }),
            nodeResolve({
                browser: true,
                dedupe: ['svelte']
            }),
            production && terser()
        ]
    };
});
