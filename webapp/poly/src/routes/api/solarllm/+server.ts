import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { SOLARLLM_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const openai = new OpenAI({
	apiKey: SOLARLLM_API_KEY,
	baseURL: 'https://api.upstage.ai/v1/solar'
});

function handleSolarLLMError(error: unknown): { error: string; status: number } {
	console.error('SolarLLM API 오류:', error);
	let errorMessage = 'SolarLLM API 오류: 요청을 처리하는 중 문제가 발생했습니다.';
	let status = 500;

	if (error instanceof OpenAI.APIError) {
		status = error.status;
		switch (error.status) {
			case 401:
				errorMessage = 'SolarLLM API 오류: 인증에 실패했습니다. API 키를 확인해 주세요.';
				break;
			case 403:
				errorMessage = 'SolarLLM API 오류: 접근 권한이 없습니다. API 키의 권한을 확인해 주세요.';
				break;
			case 429:
				errorMessage = 'SolarLLM API 오류: 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.';
				break;
			default:
				errorMessage = `SolarLLM API 오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`;
		}
	}

	return { error: errorMessage, status };
}

export const POST: RequestHandler = async ({ request }) => {
	const { prompt } = await request.json();

	try {
		const chatCompletion = await openai.chat.completions.create({
			model: 'solar-pro',
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

		return json({ response });
	} catch (error) {
		const { error: errorMessage, status } = handleSolarLLMError(error);
		return json({ error: errorMessage }, { status });
	}
};
