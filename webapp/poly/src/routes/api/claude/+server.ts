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

		if ('text' in response.content[0]) {
			return json({ response: response.content[0].text });
		} else {
			console.error('예상치 못한 응답 형식:', response.content[0]);
			return json({ error: '응답을 처리할 수 없습니다.' }, { status: 500 });
		}
	} catch (error) {
		console.error('Claude API 오류:', error);
		return json({ error: 'Claude API 호출 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
