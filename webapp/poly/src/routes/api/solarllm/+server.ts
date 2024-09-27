import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { SOLARLLM_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const openai = new OpenAI({
	apiKey: SOLARLLM_API_KEY,
	baseURL: 'https://api.upstage.ai/v1/solar'
});

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
		console.error('SolarLLM API 오류:', error);
		return json({ error: 'SolarLLM API 호출 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
