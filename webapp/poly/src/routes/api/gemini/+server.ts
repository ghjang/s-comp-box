import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { json } from '@sveltejs/kit';
import { GEMINI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

function handleGeminiError(error: unknown): { error: string; status: number } {
	console.error('Gemini API 오류:', error);
	let errorMessage = 'Gemini API 오류: 요청을 처리하는 중 문제가 발생했습니다.';
	let status = 500;

	if (error instanceof Error) {
		if (error.message.includes('404 Not Found')) {
			errorMessage = 'Gemini API 오류: 요청한 모델을 찾을 수 없습니다. 모델 이름을 확인해 주세요.';
			status = 404;
		} else if (error.message.includes('401 Unauthorized')) {
			errorMessage = 'Gemini API 오류: 인증에 실패했습니다. API 키를 확인해 주세요.';
			status = 401;
		} else if (error.message.includes('429 Too Many Requests')) {
			errorMessage = 'Gemini API 오류: 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.';
			status = 429;
		} else {
			errorMessage = `Gemini API 오류: ${error.message}`;
		}
	}

	return { error: errorMessage, status };
}

export const POST: RequestHandler = async ({ request }) => {
	const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

	const { prompt } = await request.json();
	try {
		const result = await model.generateContent(prompt);
		return json({ response: result.response.text() });
	} catch (error) {
		const { error: errorMessage, status } = handleGeminiError(error);
		return json({ error: errorMessage }, { status });
	}
};
