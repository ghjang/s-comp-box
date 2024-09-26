import { GoogleGenerativeAI } from '@google/generative-ai';
import { json } from '@sveltejs/kit';
import { GEMINI_API_KEY } from '$env/static/private';

export async function POST({ request }) {
	const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

	const { prompt } = await request.json();
	try {
		const result = await model.generateContent(prompt);
		return json({ response: result.response.text() });
	} catch (error) {
		console.error('제미나이 API 오류:', error);
		return json({ error: '제미나이 API 호출 중 오류가 발생했습니다.' }, { status: 500 });
	}
}
