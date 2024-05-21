import fs from 'fs';
import path from 'path';
import svelte from 'rollup-plugin-svelte';
//import css from 'rollup-plugin-css-only';
import postcss from 'rollup-plugin-postcss';
//import styles from 'rollup-plugin-styles';
//import { string } from 'rollup-plugin-string';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { execSync } from 'child_process';
import sveltePreprocess from 'svelte-preprocess';
import readline from 'readline';


const production = !process.env.ROLLUP_WATCH;

const componentsDir = 'src';
const componentDirNames = fs.readdirSync(componentsDir).filter(file =>
    fs.statSync(path.join(componentsDir, file)).isDirectory()
);


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function createConfig(targetComponentFilePaths, customElement = false) {
    const inputs = {};
    targetComponentFilePaths.forEach(filePath => {
        const componentName = path.basename(filePath, '.svelte');
        inputs[componentName] = filePath;
    });

    let outputDir = production ? 'build/dist' : 'build/dev';
    outputDir = customElement ? `${outputDir}/custom` : `${outputDir}/default`;

    const config = {
        input: inputs,
        output: {
            dir: outputDir,
            entryFileNames: customElement ? '[name].custom.js' : '[name].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            format: 'esm',
            sourcemap: true,

            // NOTE: 번들간 중복되는 코드를 제거하기 위해 'manualChunks' 옵션을 사용할 수 있다.
            /*
            manualChunks: {
                'svelte-internal': ['svelte/internal'],
                'Splitter': ['Splitter.svelte'],
                'Floor': ['Floor.svelte']
            }
            */
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
            !customElement && postcss({
                extract: 's-comp.bundle.css',
                minimize: production,
                sourceMap: !production
            }),
            nodeResolve({
                browser: true,
                dedupe: ['svelte']
            }),
            production && terser({})
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

    return config;
}


function waitForUserInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question('Press Enter to continue...', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}


async function runPreActionScript(filePath) {
    const dirName = path.basename(path.dirname(filePath));
    const preActionScriptPath = `src/${dirName}/rollup.${dirName}.pre-action.sh`;

    if (fs.existsSync(preActionScriptPath)) {
        try {
            execSync(`chmod 744 ${preActionScriptPath}`, { stdio: 'inherit' });
        } catch (error) {
            console.error(`Failed to change the permission of the pre-action script file: ${preActionScriptPath}`);
            console.error(error);
        }

        try {
            execSync(`sh ${preActionScriptPath}`, { stdio: 'inherit' });
        } catch (error) {
            console.error(`Failed to run the pre-action script file: ${preActionScriptPath}`);
            console.error(error);
        }
    } else {
        console.info(`The pre-action script file does not exist: ${preActionScriptPath}`);

        // NOTE: 디버깅 용으로 임시 사용함.
        //await waitForUserInput();
    }
}


const configs = async () => {
    const svelteComponentFilePaths = componentDirNames.map(dirName => {
        const componentName = capitalizeFirstLetter(dirName);
        const filePath = `src/${dirName}/${componentName}.svelte`;
        const svelteFileContent = fs.readFileSync(filePath, 'utf-8');
        const hasCustomElementOption = svelteFileContent.includes('<svelte:options customElement');
        return [filePath, hasCustomElementOption];
    });

    const defaultBuildTargetFiles
        = svelteComponentFilePaths
            .map(([filePath, _]) => filePath);

    // NOTE: '커스텀 요소' 구분없이 모든 스벨트 컴포넌트에 대해서 확인한 것이기 때문에 여기서만 실행하면 된다.
    for (const filePath of defaultBuildTargetFiles) {
        await runPreActionScript(filePath);
    }

    const defaultBuildConfig = createConfig(defaultBuildTargetFiles, false);
    defaultBuildConfig.context = 'globalThis';

    const customElementBuildTargetFiles
        = svelteComponentFilePaths
            .filter(([_, hasCustomElementOption]) => hasCustomElementOption)
            .map(([filePath, _]) => filePath);

    const customElementBuildConfig = createConfig(customElementBuildTargetFiles, true);
    customElementBuildConfig.context = 'globalThis';

    return [defaultBuildConfig, customElementBuildConfig];
};


export default configs;
