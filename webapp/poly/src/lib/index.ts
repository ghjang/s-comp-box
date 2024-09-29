// NOTE: place files you want to import through the `$lib` alias in this folder.

import type { APIProvider, ModelType, LLMRequest, LLMResponse } from '../types/api';
import {
	GeminiModel,
	ClaudeModel,
	OpenAIModel,
	HuggingFaceModel,
	SolarLLMModel
} from '../types/api';

export function getApiEndpoint(selectedAPI: APIProvider): string {
	switch (selectedAPI) {
		case 'Gemini':
			return '/api/gemini';
		case 'Claude':
			return '/api/claude';
		case 'OpenAI':
			return '/api/openai';
		case 'Hugging Face':
			return '/api/huggingface';
		case 'SolarLLM':
			return '/api/solarllm';
		default:
			throw new Error(`${selectedAPI} API 선택 오류`);
	}
}

export function getModelForAPI(api: APIProvider): ModelType {
	switch (api) {
		case 'Gemini':
			return GeminiModel.GeminiPro;
		case 'Claude':
			return ClaudeModel.Claude3Opus;
		case 'OpenAI':
			return OpenAIModel.GPT35Turbo;
		case 'Hugging Face':
			return HuggingFaceModel.GPT2;
		case 'SolarLLM':
			return SolarLLMModel.SolarPro;
		default:
			throw new Error(`${api} API 모델 선택 오류`);
	}
}

export async function callApi(apiEndpoint: string, request: LLMRequest): Promise<LLMResponse> {
	const res = await fetch(apiEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(request)
	});

	return await res.json();
}
