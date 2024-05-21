import fs from 'fs';
import path from 'path';
import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-only';
import { string } from 'rollup-plugin-string';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from '@rollup/plugin-terser';
import { execSync } from 'child_process';
import execute from 'rollup-plugin-execute';
import sveltePreprocess from 'svelte-preprocess';

const production = !process.env.ROLLUP_WATCH;

const componentsDir = 'src';
const componentDirNames = fs.readdirSync(componentsDir).filter(file =>
    fs.statSync(path.join(componentsDir, file)).isDirectory()
);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createConfig(dirName, componentName, customElement = false) {
    const outputFilename = customElement ? `${componentName}.custom.js` : `${componentName}.js`;
    const postActionScriptPath = `src/${dirName}/rollup.${dirName}.post-action.sh`;

    const config = {
        input: `src/${dirName}/${componentName}.svelte`,
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
                },
                preprocess: sveltePreprocess({
                    scss: {
                        includePaths: ['src']
                    },
                    postcss: {
                        plugins: [
                            require('autoprefixer')()
                        ]
                    }
                })
            }),
            !customElement && css({ output: `${componentName}.css` }),
            nodeResolve({
                browser: true,
                dedupe: ['svelte']
            }),
            production && terser()
        ].filter(Boolean),
        external: ['node-fetch'],
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

    if (fs.existsSync(postActionScriptPath)) {
        try {
            execSync(`chmod 744 ${postActionScriptPath}`);
        }
        catch (error) {
            console.error(`Failed to change the permission of the post-action script file: ${postActionScriptPath}`);
            console.error(error);
        }

        config.plugins.push(
            execute(`sh ${postActionScriptPath}`)
        );
    }

    return config;
}

const configs = componentDirNames.flatMap(dirName => {
    const componentName = capitalizeFirstLetter(dirName);

    const configsForComponent = [
        {
            ...createConfig(dirName, componentName, false),
            context: 'globalThis'
        }
    ];

    const svelteFileContent = fs.readFileSync(`src/${dirName}/${componentName}.svelte`, 'utf-8');
    const hasCustomElementOption = svelteFileContent.includes('<svelte:options customElement');

    if (hasCustomElementOption) {
        configsForComponent.push({
            ...createConfig(dirName, componentName, true),
            context: 'globalThis'
        });
    }

    return configsForComponent;
});

export default configs;
