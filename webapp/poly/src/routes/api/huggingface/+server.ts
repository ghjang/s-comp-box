import { json } from '@sveltejs/kit';
import axios from 'axios';
import { HUGGINGFACE_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import type { LLMRequest, LLMResponse, APIProvider } from '../../../types/api';

const API_SOURCE: APIProvider = 'Hugging Face';

function handleHuggingFaceError(error: unknown): LLMResponse {
	console.error(`${API_SOURCE} 오류:`, error);
	let errorMessage = '요청을 처리하는 중 문제가 발생했습니다.';
	let status = 500;

	const errorMap = new Map([
		[401, '인증에 실패했습니다. API 키를 확인해 주세요.'],
		[403, '접근 권한이 없습니다.'],
		[404, '요청한 모델을 찾을 수 없습니다.'],
		[429, '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.']
	]);

	if (axios.isAxiosError(error)) {
		status = error.response?.status || 500;
		errorMessage = errorMap.get(status) || error.message;
	}

	return { error: errorMessage, source: API_SOURCE };
}

export const POST: RequestHandler = async ({ request }) => {
	const { prompt, model } = await request.json() as LLMRequest;
	const API_URL = `https://api-inference.huggingface.co/models/${model}`;

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

		return json({ response: generatedText, source: API_SOURCE } as LLMResponse);
	} catch (error) {
		const errorResponse = handleHuggingFaceError(error);
		return json(errorResponse, { status: 500 });
	}
};
