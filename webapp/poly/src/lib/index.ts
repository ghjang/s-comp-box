// NOTE: place files you want to import through the `$lib` alias in this folder.

import type { LLMRequest, LLMResponse } from '../types/api';
import { getApiEndpoint, getProviderFromModel } from './llm';
export { createLLMRequest, getDefaultModel } from './llm';

export async function singleQuery(request: LLMRequest): Promise<LLMResponse> {
	const apiProvider = getProviderFromModel(request.model);
	const apiEndpoint = getApiEndpoint(apiProvider);

	const res = await fetch(apiEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(request)
	});

	return await res.json();
}
