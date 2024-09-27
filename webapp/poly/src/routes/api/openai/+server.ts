import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export const POST: RequestHandler = async ({ request }) => {
	const { prompt } = await request.json();

	try {
		const chatCompletion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: prompt }],
			max_tokens: 1000
		});

		const response = chatCompletion.choices[0].message.content;

		return json({ response });
	} catch (error) {
		console.error('OpenAI API 오류:', error);
		let errorMessage = 'OpenAI API 오류: 요청을 처리하는 중 문제가 발생했습니다.';

		if (error instanceof OpenAI.APIError) {
			switch (error.code) {
				case 'insufficient_quota':
					errorMessage = '현재 할당량을 초과했습니다. 요금제와 결제 정보를 확인해 주세요.';
					break;
				case 'rate_limit_exceeded':
					errorMessage = '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.';
					break;
				case 'invalid_api_key':
					errorMessage = 'API 키가 유효하지 않습니다.';
					break;
				default:
					errorMessage = error.message || errorMessage;
			}
		}

		return json(
			{ error: errorMessage },
			{ status: error instanceof OpenAI.APIError ? error.status : 500 }
		);
	}
};
