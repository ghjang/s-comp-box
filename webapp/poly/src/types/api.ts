export interface LLMRequest {
	prompt: string;
	model: ModelType;
}

export interface LLMResponse {
	source: APIProvider;
	response?: string;
	error?: string;
}

export type APIProvider = 'Gemini' | 'Claude' | 'OpenAI' | 'Hugging Face' | 'SolarLLM';

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
	GPT4 = 'gpt-4',
	GPT4Turbo = 'gpt-4-turbo'
}

export enum HuggingFaceModel {
	GPT2 = 'gpt2',
	BART = 'facebook/bart-large-cnn',
	T5 = 'google/t5-v1_1-base'
}

export enum SolarLLMModel {
	SolarPro = 'solar-pro'
}

export type ModelType = GeminiModel | ClaudeModel | OpenAIModel | HuggingFaceModel | SolarLLMModel;
