import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";
import { createRequire } from 'module';

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function waitForUserInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("계속하려면 Enter를 누르세요...", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export async function runPreActionScript(filePath) {
  const dirName = path.basename(path.dirname(filePath));
  const preActionScriptPath = `src/${dirName}/rollup.${dirName}.pre-action.sh`;

  if (fs.existsSync(preActionScriptPath)) {
    console.info(`found pre-action script: ${preActionScriptPath}`);

    try {
      execSync(`chmod 744 ${preActionScriptPath}`, { stdio: "inherit" });
    } catch (error) {
      console.error(`pre-action script file permission change failed: ${preActionScriptPath}`);
      console.error(error);
    }

    try {
      execSync(`sh ${preActionScriptPath}`, { stdio: "inherit" });
    } catch (error) {
      console.error(`사전 동작 스크립트 파일 실행 실패: ${preActionScriptPath}`);
      console.error(error);
    }
  } else {
    // NOTE: 디버 용으로 임시 사용함.
    /*
    console.info(`사전 동작 스크립트 파일이 존재하지 않습니다: ${preActionScriptPath}`);
    await waitForUserInput();
    */
  }
}

export function writeSvelteComponentsNameToOutput(targetComponentFilePaths, outputDir) {
  // 디렉토리가 존재하지 않으면 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sCompListFilePath = path.join(outputDir, "s-comp.list.txt");
  const uniqueComponentNames = new Set(
    targetComponentFilePaths.map((filePath) => path.basename(filePath, path.extname(filePath)))
  );
  const sCompList = Array.from(uniqueComponentNames).sort().join("\n");
  fs.writeFileSync(sCompListFilePath, sCompList);
}

export async function getExportedComponentsFromPackage(packageName) {
  try {
    const require = createRequire(import.meta.url);
    const packagePath = require.resolve(packageName);
    console.log(`Package path: ${packagePath}`);
    
    const packageDir = path.dirname(path.dirname(packagePath));
    console.log(`Package directory: ${packageDir}`);
    
    const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'));
    console.log(`Package JSON:`, packageJson);
    
    const typesFile = path.resolve(packageDir, packageJson.types || 'index.d.ts');
    console.log(`Types file path: ${typesFile}`);

    const fileContent = fs.readFileSync(typesFile, 'utf-8');
    
    // 모든 import 문을 찾습니다.
    const importRegex = /import\s+(\w+)\s+from\s+['"](.+)['"]/g;
    const imports = {};
    let match;
    while ((match = importRegex.exec(fileContent)) !== null) {
      imports[match[1]] = match[2];
    }

    // export 문을 찾습니다.
    const exportRegex = /export\s*{([^}]+)}/;
    const exportMatch = exportRegex.exec(fileContent);
    if (exportMatch) {
      const exportedItems = exportMatch[1].split(',').map(item => item.trim());
      
      const components = {};
      for (const item of exportedItems) {
        if (item !== 'type PopupStore' && item !== 'PopUpManager') {
          // 'dist' 폴더를 경로에 추가합니다.
          const componentPath = imports[item] || item;
          components[item] = path.join(packageDir, 'dist', componentPath);
        }
      }
      
      console.log(`Extracted components:`, components);
      return components;
    }
    
    throw new Error('No exports found in the package');
  } catch (error) {
    console.error(`Error processing ${packageName} package:`, error);
    return {};
  }
}
