import { json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const anthropic = new Anthropic({
	apiKey: CLAUDE_API_KEY
});

export const POST: RequestHandler = async ({ request }) => {
	const { prompt } = await request.json();

	try {
		const response = await anthropic.messages.create({
			model: 'claude-3-opus-20240229',
			max_tokens: 1000,
			messages: [{ role: 'user', content: prompt }]
		});

		return json({ response: response.content[0].text });
	} catch (error) {
		console.error('Claude API 오류:', error);
		let errorMessage = 'Claude API 호출 중 오류가 발생했습니다.';

		if (error instanceof Anthropic.APIError) {
			if (error.status === 400 && error.error?.error?.type === 'invalid_request_error') {
				errorMessage = error.error.error.message || '잘못된 요청입니다.';
			} else if (error.status === 401) {
				errorMessage = 'API 키가 유효하지 않습니다.';
			} else if (error.status === 429) {
				errorMessage = '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
			}
		}

		return json({ error: errorMessage }, { status: 500 });
	}
};
