<script lang="ts">
	import type { LLMRequest, LLMResponse, APIProvider } from '../types/api';
	import { getApiEndpoint, getModelForAPI, callApi } from '$lib';

	let selectedAPI: APIProvider = 'Gemini';
	let userInput = '';
	let response = '';
	let error = '';
	let errorSource = '';

	// 버튼 비활성화 상태를 결정하는 함수
	$: isButtonDisabled = !userInput.trim();

	async function handleSubmit() {
		if (isButtonDisabled) return;

		error = '';
		errorSource = '';
		response = '';

		try {
			const apiEndpoint = getApiEndpoint(selectedAPI);
			const model = getModelForAPI(selectedAPI);
			const request: LLMRequest = { prompt: userInput, model };
			const data: LLMResponse = await callApi(apiEndpoint, request);

			if (data.error) {
				error = data.error;
				errorSource = data.source;
			} else {
				response = data.response || '';
			}
		} catch (error) {
			console.error('API 호출 오류:', error);
			errorSource = '네트워크';
			error = '서버와 통신하는 중 문제가 발생했습니다.';
		}
	}
</script>

<main>
	<h1>AI 채팅</h1>

	<div>
		<label>
			<input type="radio" bind:group={selectedAPI} value="Gemini" />
			Gemini
		</label>
		<label>
			<input type="radio" bind:group={selectedAPI} value="Claude" />
			Claude
		</label>
		<label>
			<input type="radio" bind:group={selectedAPI} value="OpenAI" />
			OpenAI
		</label>
		<label>
			<input type="radio" bind:group={selectedAPI} value="Hugging Face" />
			Hugging Face
		</label>
		<label>
			<input type="radio" bind:group={selectedAPI} value="SolarLLM" />
			SolarLLM
		</label>
	</div>

	<textarea bind:value={userInput} placeholder="메시지를 입력하세요..."></textarea>
	<button on:click={handleSubmit} disabled={isButtonDisabled}>전송</button>

	{#if error}
		<div class="error">
			<p><strong>{errorSource} 오류:</strong> {error}</p>
		</div>
	{:else if response}
		<div class="response">
			<h2>응답:</h2>
			<p>{response}</p>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}
	textarea {
		width: 100%;
		height: 100px;
		margin-bottom: 10px;
	}
	button {
		padding: 10px 20px;
	}
	.response {
		margin-top: 20px;
		border: 1px solid #ccc;
		padding: 10px;
		border-radius: 5px;
	}
	.error {
		margin-top: 20px;
		border: 1px solid #ff0000;
		padding: 10px;
		border-radius: 5px;
		color: #ff0000;
		background-color: #ffeeee;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
