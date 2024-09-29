import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { json } from '@sveltejs/kit';
import { GEMINI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import type { LLMRequest, LLMResponse } from '../../../types/api';
import type { APIProvider } from '../../../types/api';
import { GeminiModel } from '../../../types/api';

const API_SOURCE: APIProvider = 'Gemini';

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

async function handleSingleQuery(llmRequest: LLMRequest): Promise<LLMResponse> {
	const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	const genModel: GenerativeModel = genAI.getGenerativeModel({
		model: llmRequest.model as GeminiModel
	});

	try {
		const result = await genModel.generateContent(llmRequest.prompt);
		return { response: result.response.text(), source: API_SOURCE };
	} catch (error) {
		return handleGeminiError(error);
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const llmRequest = (await request.json()) as LLMRequest;
	if (llmRequest.type === 'single-query') {
		const response = await handleSingleQuery(llmRequest);
		return json(response, { status: response.error ? 500 : 200 });
	} else {
		return json({ error: '잘못된 요청입니다.', source: API_SOURCE }, { status: 400 });
	}
};
