import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { json } from '@sveltejs/kit';
import { GEMINI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import type { LLMResponse } from '../../../types/api';

const API_SOURCE = 'Gemini API';

const errorMap = new Map([
	[404, '요청한 모델을 찾을 수 없습니다. 모델 이름을 확인해 주세요.'],
	[401, '인증에 실패했습니다. API 키를 확인해 주세요.'],
	[429, '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.']
]);

function handleGeminiError(error: unknown): LLMResponse {
	console.error(`${API_SOURCE} 오류:`, error);
	let errorMessage = '요청을 처리하는 중 문제가 발생했습니다.';
	let status = 500;

	if (error instanceof Error) {
		for (const [code, message] of errorMap) {
			if (error.message.includes(`${code}`)) {
				errorMessage = message;
				status = code;
				break;
			}
		}
		if (status === 500) {
			errorMessage = error.message;
		}
	}

	return { error: errorMessage, source: API_SOURCE };
}

export const POST: RequestHandler = async ({ request }) => {
	const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

	const { prompt } = await request.json();
	try {
		const result = await model.generateContent(prompt);
		return json({ response: result.response.text(), source: API_SOURCE } as LLMResponse);
	} catch (error) {
		const errorResponse = handleGeminiError(error);
		return json(errorResponse, { status: 500 });
	}
};
