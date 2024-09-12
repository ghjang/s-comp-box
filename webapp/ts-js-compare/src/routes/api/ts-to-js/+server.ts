import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import ts from 'typescript';
import { jsVersions } from '$lib/jsVersions';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { tsCode, target } = body;

		// NOTE: 'tsCode'가 '빈 문자열'인 경우는 허용함.
		if (tsCode === undefined || tsCode === null || typeof tsCode !== 'string') {
			console.error('Invalid tsCode:', tsCode);
			console.error('Full request body:', JSON.stringify(body, null, 2));
			return json({ error: 'TypeScript code was not provided or is invalid.' }, { status: 400 });
		}

		const scriptTarget =
			jsVersions.find((v) => v.value === target)?.target || ts.ScriptTarget.ES2015;

		const jsCode = ts.transpileModule(tsCode, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: scriptTarget
			}
		}).outputText;

		return json({ jsCode });
	} catch (error) {
		console.error('Error occurred during TypeScript conversion:', error);
		console.error('Full request body when error occurred:', await request.text());
		return json(
			{ error: 'An error occurred while converting TypeScript to JavaScript.' },
			{ status: 500 }
		);
	}
};
