import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { SOLARLLM_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import type { LLMRequest, LLMResponse, APIProvider } from '../../../types/api';

const API_SOURCE: APIProvider = 'SolarLLM';

const errorMap = new Map([
	[401, '인증에 실패했습니다. API 키를 확인해 주세요.'],
	[403, '접근 권한이 없습니다. API 키의 권한을 확인해 주세요.'],
	[429, '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.']
]);

const openai = new OpenAI({
	apiKey: SOLARLLM_API_KEY,
	baseURL: 'https://api.upstage.ai/v1/solar'
});

function handleSolarLLMError(error: unknown): LLMResponse {
	console.error(`${API_SOURCE} 오류:`, error);
	let errorMessage = '요청을 처리하는 중 문제가 발생했습니다.';

	if (error instanceof OpenAI.APIError) {
		errorMessage = error.status
			? (errorMap.get(error.status) ?? error.message)
			: error.message || '알 수 없는 오류가 발생했습니다.';
	}

	return { error: errorMessage, source: API_SOURCE };
}

export const POST: RequestHandler = async ({ request }) => {
	const { prompt, model } = await request.json() as LLMRequest;

	try {
		const chatCompletion = await openai.chat.completions.create({
			model: model,
			messages: [
				{
					role: 'system',
					content: 'You are a helpful assistant.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			stream: false // 스트리밍을 사용하지 않음
		});

		const response = chatCompletion.choices[0].message.content;

		return json({ response, source: API_SOURCE } as LLMResponse);
	} catch (error) {
		const errorResponse = handleSolarLLMError(error);
		return json(errorResponse, { status: 500 });
	}
};
