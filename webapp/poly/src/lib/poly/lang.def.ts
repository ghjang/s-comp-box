import {
	type IMonarchLanguage,
	type IMonarchLanguageRule,
	IndentAction
} from '../../../../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js';

interface LanguageDefinition extends IMonarchLanguage {
	tokenizer: {
		root: IMonarchLanguageRule[];
		[key: string]: IMonarchLanguageRule[];
	};
	autoClosingPairs: { open: string; close: string }[];
	surroundingPairs: { open: string; close: string }[];
	folding: {
		offSide: boolean;
		markers: {
			start: RegExp | string;
			end: RegExp | string;
		};
	};
	onEnterRules: {
		beforeText: RegExp;
		afterText?: RegExp;
		action: { indentAction: number };
	}[];
}

export const langdef: LanguageDefinition = {
	defaultToken: 'invalid',
	tokenizer: {
		root: [
			// 한 줄 주석
			[/#.*$/, 'comment'],

			// 공백
			[/\s+/, 'white'],

			// 숫자 (정수 및 소수)
			[/\d+(\.\d+)?/, 'number'],

			// 변수 (x, y, z 등)
			[/[a-z]/, 'variable'],

			// 연산자
			[/[+\-*/^]/, 'operator'],

			// 괄호
			[/[()]/, 'delimiter.parenthesis'],

			// 등호
			//[/=/, 'delimiter.equals']
		],

		// 주석을 위한 새로운 토큰화 규칙
		comment: [
			[/[^\n]+/, 'comment'],
			[/$/, 'comment', '@pop']
		]
	},

	// 자동 괄호 닫기
	autoClosingPairs: [{ open: '(', close: ')' }],

	// 괄호 쌍
	brackets: [['(', ')', 'delimiter.parenthesis']] as any,

	// 주변 쌍
	surroundingPairs: [{ open: '(', close: ')' }],

	// 폴딩 (접기) 설정
	folding: {
		offSide: false,
		markers: {
			start: /\(/,
			end: /\)/
		}
	},

	// 엔터 키 규칙
	onEnterRules: [
		{
			beforeText: /\(\s*$/,
			afterText: /^\s*\)/,
			action: { indentAction: IndentAction.IndentOutdent }
		}
	]
};

export default langdef;
