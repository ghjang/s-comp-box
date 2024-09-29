export type APIProvider = 'Gemini' | 'Claude' | 'OpenAI' | 'Hugging Face' | 'SolarLLM';
export type ModelType = GeminiModel | ClaudeModel | OpenAIModel | HuggingFaceModel | SolarLLMModel;

type ProviderModelEnumTypeMap = {
	Gemini: typeof GeminiModel;
	Claude: typeof ClaudeModel;
	OpenAI: typeof OpenAIModel;
	'Hugging Face': typeof HuggingFaceModel;
	SolarLLM: typeof SolarLLMModel;
};

type APIProviderModelEnumTypeMap = {
	[P in APIProvider]: ProviderModelEnumTypeMap[P];
};

type ProviderModelValueMap = {
	Gemini: GeminiModel;
	Claude: ClaudeModel;
	OpenAI: OpenAIModel;
	'Hugging Face': HuggingFaceModel;
	SolarLLM: SolarLLMModel;
};

type APIProviderModelValueMap = {
	[P in APIProvider]: ProviderModelValueMap[P];
};

//=======================================================
export interface LLMRequest {
	type: 'single-query' | 'chat';
	prompt: string;
	model: ModelType;
	temperature?: number;
	maxTokens?: number;
}

// 기본값을 가질 수 있는 필드들
export type DefaultableFields = 'type' | 'temperature' | 'maxTokens';

// 필수 필드들
export type RequiredFields = Exclude<keyof LLMRequest, DefaultableFields>;

// 생성 팩토리 함수의 매개변수 타입
export type LLMRequestFactoryParam = Pick<LLMRequest, RequiredFields> &
	Partial<Pick<LLMRequest, DefaultableFields>>;

export interface LLMResponse {
	source: APIProvider;
	response?: string;
	error?: string;
}

//=======================================================
export enum GeminiModel {
	GeminiPro = 'gemini-pro',
	GeminiProVision = 'gemini-pro-vision',
	Gemini4 = 'gemini-4',
	Gemini15Pro = 'gemini-1.5-pro-002',
	Gemini15Flash = 'gemini-1.5-flash-002',
	Gemini15Flash8BExp = 'gemini-1.5-flash-8b-exp-0924'
}

export enum ClaudeModel {
	Claude3Opus = 'claude-3-opus-20240229',
	Claude3Sonnet = 'claude-3-sonnet-20240229',
	Claude3Haiku = 'claude-3-haiku-20240307'
}

export enum OpenAIModel {
	GPT35Turbo = 'gpt-3.5-turbo',
	GPT4 = 'gpt-4'
}

export enum HuggingFaceModel {
	GPT2 = 'gpt2',
	BART = 'facebook/bart-large-cnn',
	T5 = 'google/t5-v1_1-base'
}

export enum SolarLLMModel {
	SolarPro = 'solar-pro'
}

//=======================================================
export const ModelEnumTypeMap: APIProviderModelEnumTypeMap = {
	Gemini: GeminiModel,
	Claude: ClaudeModel,
	OpenAI: OpenAIModel,
	'Hugging Face': HuggingFaceModel,
	SolarLLM: SolarLLMModel
};

export const DefaultModelValueMap: APIProviderModelValueMap = {
	Gemini: GeminiModel.Gemini15Flash8BExp,
	Claude: ClaudeModel.Claude3Sonnet,
	OpenAI: OpenAIModel.GPT35Turbo,
	'Hugging Face': HuggingFaceModel.GPT2,
	SolarLLM: SolarLLMModel.SolarPro
};
