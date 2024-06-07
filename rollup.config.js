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
const isBuildPages = process.env.npm_lifecycle_event === 'build-pages-dist';

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

    // NOTE: 'GitHub Pages'에 배포하는 경우에 빌드한 결과물 자체를 항상 '해당 Git 저장소'에 커밋할 필요는 없다.
    //       이 프로젝트의 경우가 그렇다. 해서 그냥 원래의 방식대로 '[hash]'를 사용하도록 한다. 
    //
    // NOTE: '[hash]'를 사용하면 출력파일 내용에 대해 계산된 해시값이 바뀔 때마다 파일명이 변경된다.
    //       이 문제는 웹 브라우저 캐시를 무효화시켜 새로운 파일을 다운로드 받게 만드는 효과가 있다.
    //
    //       'GitHub Actions'에서 자동 빌드후 같은 저장소의 'GitHub Pages'에 '직접 커밋'하는 방식으로
    //       배포하는 경우 캐시 문제보다는 해쉬값이 붙은 파일 이름명 때문에 불필요한 Git 저장소내에 남는 파일들이
    //       누적되는 문제가 발생할 수 있다. 일단 GitHub Pages에 배포하는 경우는 해쉬값을 사용하지 않도록 한다.
    //const chunkFileNames = isBuildPages ? 'chunks/[name].js' : 'chunks/[name]-[hash].js';

    const chunkFileNames = 'chunks/[name]-[hash].js';

    const config = {
        input: inputs,
        output: {
            dir: outputDir,
            entryFileNames: customElement ? '[name].custom.js' : '[name].js',
            chunkFileNames,
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
            // HACK: 'svelte' 플러그인에서 발생하는 경고 중에서 특정 경고를 무시하도록 한다.
            // 1개의 '.svelte' 파일로 '보통의 스벨트 컴포넌트 번들링'과 '표준 웹 커스텀 컴포넌트 번들링'을 모두 하는 경우에 발생하는 경고를 무시한다.
            // 이 경고는 '.svelte' 파일에 '<svelte:options customElement="s-marquee" />' 옵션이 설정되어 있는 상태에서
            // 'customElement: false'로 설정하여 번들링을 할 때 발생한다. 현재 시점에서 이 경고는 무시해도 될 것으로 보여 번들링 경고에서 제외한다.
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
        console.info(`found the pre-action script file: ${preActionScriptPath}`);

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
        // NOTE: 디버깅 용으로 임시 사용함.
        /*
        console.info(`The pre-action script file does not exist: ${preActionScriptPath}`);
        await waitForUserInput();
        */
    }
}


function writeSvelteComponentsNameToOutput(targetComponentFilePaths) {
    const outputDir = production ? 'build/dist/default' : 'build/dev/default';
    const sCompListFilePath = `${outputDir}/s-comp.list.txt`;
    const sCompList = targetComponentFilePaths
        .map(filePath => path.basename(filePath, '.svelte'))
        .sort()
        .join('\n');
    fs.writeFileSync(sCompListFilePath, sCompList);
}


const configs = async () => {
    const svelteComponentFilePaths = [];

    componentDirNames.forEach(dirName => {
        const componentName = capitalizeFirstLetter(dirName);

        function getComponentFilePath(dirName, componentName) {
            const filePath = `src/${dirName}/${componentName}.svelte`;
            const svelteFileContent = fs.readFileSync(filePath, 'utf-8');
            const hasCustomElementOption = svelteFileContent.includes('<svelte:options customElement');
            return [filePath, hasCustomElementOption];
        }

        const buildTargetComponentsTxtFilePath = `src/${dirName}/build_target_components.txt`;
        if (fs.existsSync(buildTargetComponentsTxtFilePath)) {
            console.log(`found the build target components file: ${buildTargetComponentsTxtFilePath}`);
            const buildTargetComponents = fs.readFileSync(buildTargetComponentsTxtFilePath, 'utf-8').split(/\r?\n/).filter(Boolean);
            buildTargetComponents.forEach(componentName => {
                console.log(`build target components: ${componentName}`);
                const filePath = getComponentFilePath(dirName, componentName);
                svelteComponentFilePaths.push(filePath);
            });
        } else {
            const filePath = getComponentFilePath(dirName, componentName);
            svelteComponentFilePaths.push(filePath);
        }
    });

    const defaultBuildTargetFiles
        = svelteComponentFilePaths
            .map(([filePath, _]) => filePath);

    // NOTE: '커스텀 요소' 구분없이 모든 스벨트 컴포넌트에 대해서 확인한 것이기 때문에 여기서만 실행하면 된다.
    for (const filePath of defaultBuildTargetFiles) {
        await runPreActionScript(filePath);
    }

    writeSvelteComponentsNameToOutput(defaultBuildTargetFiles);

    let defaultBuildConfig = createConfig(defaultBuildTargetFiles, false);
    defaultBuildConfig.context = 'globalThis';

    const customElementBuildTargetFiles
        = svelteComponentFilePaths
            .filter(([_, hasCustomElementOption]) => hasCustomElementOption)
            .map(([filePath, _]) => filePath);

    const customElementBuildConfig = createConfig(customElementBuildTargetFiles, true);
    customElementBuildConfig.context = 'globalThis';

    return defaultBuildConfig ? [defaultBuildConfig, customElementBuildConfig] : [customElementBuildConfig];
};


export default configs;
