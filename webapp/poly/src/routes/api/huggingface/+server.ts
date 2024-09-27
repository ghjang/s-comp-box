import { json } from '@sveltejs/kit';
import axios from 'axios';
import { HUGGINGFACE_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const API_URL = 'https://api-inference.huggingface.co/models/gpt2';

function handleHuggingFaceError(error: unknown): { error: string; status: number } {
	console.error('Hugging Face API 오류:', error);
	let errorMessage = 'Hugging Face API 오류: 요청을 처리하는 중 문제가 발생했습니다.';
	let status = 500;

	if (axios.isAxiosError(error)) {
		status = error.response?.status || 500;
		switch (status) {
			case 401:
				errorMessage = 'Hugging Face API 오류: 인증에 실패했습니다. API 키를 확인해 주세요.';
				break;
			case 403:
				errorMessage = 'Hugging Face API 오류: 접근 권한이 없습니다.';
				break;
			case 404:
				errorMessage = 'Hugging Face API 오류: 요청한 모델을 찾을 수 없습니다.';
				break;
			case 429:
				errorMessage = 'Hugging Face API 오류: 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.';
				break;
			default:
				errorMessage = `Hugging Face API 오류: ${error.message}`;
		}
	}

	return { error: errorMessage, status };
}

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
		const { error: errorMessage, status } = handleHuggingFaceError(error);
		return json({ error: errorMessage }, { status });
	}
};
