import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import type { LLMResponse } from '../../../types/api';

const API_SOURCE = 'OpenAI API';

const errorMap = new Map([
	['insufficient_quota', '현재 할당량을 초과했습니다. 요금제와 결제 정보를 확인해 주세요.'],
	['rate_limit_exceeded', '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'],
	['invalid_api_key', 'API 키가 유효하지 않습니다.']
]);

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

function handleOpenAIError(error: unknown): LLMResponse {
	console.error(`${API_SOURCE} 오류:`, error);
	let errorMessage = '요청을 처리하는 중 문제가 발생했습니다.';

	if (error instanceof OpenAI.APIError) {
		const errorCode = error.code?.toString() || '';
		errorMessage = errorMap.get(errorCode) || error.message || errorMessage || '알 수 없는 오류';
	}

	return { error: errorMessage, source: API_SOURCE };
}

export const POST: RequestHandler = async ({ request }) => {
	const { prompt } = await request.json();

	try {
		const chatCompletion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: prompt }],
			max_tokens: 1000
		});

		const response = chatCompletion.choices[0].message.content;

		return json({ response, source: API_SOURCE } as LLMResponse);
	} catch (error) {
		const errorResponse = handleOpenAIError(error);
		return json(errorResponse, { status: 500 });
	}
};
