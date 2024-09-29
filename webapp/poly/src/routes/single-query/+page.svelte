<script lang="ts">
	import { ToggleGroup, RadioButton } from 's-comp-core';
	import type { LLMRequest, LLMResponse, APIProvider } from '../../types/api';
	import { createLLMRequest, getDefaultModel, singleQuery } from '$lib';

	let selectedProvider: APIProvider = 'Gemini';
	let userInput = '';
	let response = '';
	let error = '';
	let errorSource = '';

	// 버튼 비활성화 상태를 결정하는 함수
	$: isButtonDisabled = !userInput.trim();

	function resetResponse() {
		error = '';
		errorSource = '';
		response = '';
	}

	async function handleSubmit() {
		if (isButtonDisabled) return;

		resetResponse();

		try {
			const model = getDefaultModel(selectedProvider);
			const request: LLMRequest = createLLMRequest({ prompt: userInput, model });
			const data: LLMResponse = await singleQuery(request);

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

	function handleToggleItemChanged(event: CustomEvent<{ value: APIProvider }>) {
		selectedProvider = event.detail.value;
		resetResponse();
	}
</script>

<main>
	<h1>단답형 AI 채팅</h1>

	<ToggleGroup
		direction="horizontal"
		items={[
			{ component: RadioButton, label: 'Gemini', value: 'Gemini' },
			{ component: RadioButton, label: 'Claude', value: 'Claude' },
			{ component: RadioButton, label: 'OpenAI', value: 'OpenAI' },
			{ component: RadioButton, label: 'Hugging Face', value: 'Hugging Face' },
			{ component: RadioButton, label: 'SolarLLM', value: 'SolarLLM' }
		]}
		activatedValue={selectedProvider}
		on:toggleItemChanged={handleToggleItemChanged}
	/>

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
