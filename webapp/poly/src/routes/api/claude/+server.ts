import { json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import type { LLMResponse } from '../../../types/api';

const API_SOURCE = 'Claude API';

const anthropic = new Anthropic({
	apiKey: CLAUDE_API_KEY
});

function handleClaudeError(error: unknown): LLMResponse {
	console.error(`${API_SOURCE} 오류:`, error);
	let errorMessage = '요청을 처리하는 중 문제가 발생했습니다.';

	const errorMap = new Map([
		[400, '잘못된 요청입니다.'],
		[401, 'API 키가 유효하지 않습니다.'],
		[429, '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.']
	]);

	if (error instanceof Anthropic.APIError) {
		if (error.status !== undefined) {
			errorMessage = errorMap.get(error.status) || errorMessage;
		}
		if (error.error && typeof error.error === 'object') {
			if (
				'error' in error.error &&
				typeof error.error.error === 'object' &&
				error.error.error !== null &&
				'message' in error.error.error
			) {
				errorMessage = (error.error.error as { message: string }).message;
			} else if ('message' in error.error) {
				errorMessage = (error.error as { message: string }).message;
			}
		}
	}

	return { error: errorMessage, source: API_SOURCE };
}

export const POST: RequestHandler = async ({ request }) => {
	const { prompt } = await request.json();

	try {
		const response = await anthropic.messages.create({
			model: 'claude-3-opus-20240229',
			max_tokens: 1000,
			messages: [{ role: 'user', content: prompt }]
		});

		return json({ response: response.content[0].text, source: API_SOURCE } as LLMResponse);
	} catch (error) {
		const errorResponse = handleClaudeError(error);
		return json(errorResponse, { status: 500 });
	}
};
