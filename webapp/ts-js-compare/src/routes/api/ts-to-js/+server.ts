import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as ts from 'typescript';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { tsCode } = body;

		if (!tsCode || typeof tsCode !== 'string') {
			console.error('유효하지 않은 tsCode:', tsCode);
			console.error('전체 요청 본문:', JSON.stringify(body, null, 2));
			return json(
				{ error: 'TypeScript 코드가 제공되지 않았거나 유효하지 않습니다.' },
				{ status: 400 }
			);
		}

		const jsCode = ts.transpileModule(tsCode, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2015
			}
		}).outputText;

		return json({ jsCode });
	} catch (error) {
		console.error('TypeScript 변환 중 오류 발생:', error);
		console.error('오류 발생 시 전체 요청 본문:', await request.text());
		return json(
			{ error: 'TypeScript를 JavaScript로 변환하는 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
};
