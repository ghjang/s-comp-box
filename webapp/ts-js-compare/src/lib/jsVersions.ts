import type { ScriptTarget } from 'typescript';

export interface JSVersion {
    label: string;
    value: string;
    target: ScriptTarget;
}

export const jsVersions: JSVersion[] = [
    //{ label: 'ES3', value: 'ES3', target: 3 },
    { label: 'ES5', value: 'ES5', target: 1 },
    { label: 'ES2015(ES6)', value: 'ES2015', target: 2 },
    { label: 'ES2016', value: 'ES2016', target: 3 },
    { label: 'ES2017', value: 'ES2017', target: 4 },
    { label: 'ES2018', value: 'ES2018', target: 5 },
    { label: 'ES2019', value: 'ES2019', target: 6 },
    { label: 'ES2020', value: 'ES2020', target: 7 },
    { label: 'ESNext', value: 'ESNext', target: 99 }
];

export const defaultJSVersion = jsVersions.find(v => v.value === 'ES2015') || jsVersions[0];