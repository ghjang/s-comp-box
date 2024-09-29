// NOTE: place files you want to import through the `$lib` alias in this folder.

import type { LLMRequest, LLMResponse } from '../types/api';
export { createLLMRequest, getApiEndpoint, getModelForAPI } from './llm';

export async function singleQuery(apiEndpoint: string, request: LLMRequest): Promise<LLMResponse> {
	const res = await fetch(apiEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(request)
	});

	return await res.json();
}
