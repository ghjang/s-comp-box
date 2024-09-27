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
		return json({ error: 'OpenAI API 호출 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
