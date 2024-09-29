import type {
	APIProvider,
	DefaultableFields,
	LLMRequest,
	LLMRequestFactoryParam,
	ModelType
} from '../types/api';

import { ModelEnumTypeMap, DefaultModelValueMap } from '../types/api';

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

export function getDefaultModel(provider: APIProvider): ModelType {
	return DefaultModelValueMap[provider];
}

const providerModels: Record<APIProvider, ModelType[]> = Object.fromEntries(
	Object.entries(ModelEnumTypeMap).map(([provider, enumType]) => [
		provider,
		Object.values(enumType) as ModelType[]
	])
) as Record<APIProvider, ModelType[]>;

const allModels: ModelType[] = Object.values(providerModels).flat();

export function getProviderFromModel(model: ModelType): APIProvider {
	for (const [provider, models] of Object.entries(providerModels)) {
		if (models.includes(model)) {
			return provider as APIProvider;
		}
	}
	throw new Error(`${model} 모델에 해당하는 API 제공자를 찾을 수 없습니다.`);
}

export function getAllModels(): ModelType[] {
	return allModels;
}
