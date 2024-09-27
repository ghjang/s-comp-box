import { json } from '@sveltejs/kit';
import axios from 'axios';
import { HUGGINGFACE_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const API_URL = 'https://api-inference.huggingface.co/models/gpt2';

export const POST: RequestHandler = async ({ request }) => {
	const { prompt } = await request.json();

	try {
		const response = await axios.post(
			API_URL,
			{ inputs: prompt },
			{
				headers: {
					Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);

		const generatedText = response.data[0].generated_text;

		return json({ response: generatedText });
	} catch (error) {
		console.error('Hugging Face API 오류:', error);
		if (axios.isAxiosError(error)) {
			return json(
				{ error: `Hugging Face API 오류: ${error.message}` },
				{ status: error.response?.status || 500 }
			);
		}
		return json(
			{ error: 'Hugging Face API 호출 중 알 수 없는 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
};
