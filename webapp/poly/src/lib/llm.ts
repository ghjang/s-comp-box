import type {
	APIProvider,
	DefaultableFields,
	LLMRequest,
	LLMRequestFactoryParam,
	ModelType
} from '../types/api';
import {
	GeminiModel,
	ClaudeModel,
	OpenAIModel,
	HuggingFaceModel,
	SolarLLMModel
} from '../types/api';

// 기본값 설정
const defaultValues: Pick<LLMRequest, DefaultableFields> = {
	type: 'single-query',
	temperature: 0.7,
	maxTokens: 100
};

// 생성 팩토리 함수
export function createLLMRequest(params: LLMRequestFactoryParam): LLMRequest {
	return {
		...defaultValues,
		...params
	};
}

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
			return GeminiModel.Gemini15Flash8BExp;
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
