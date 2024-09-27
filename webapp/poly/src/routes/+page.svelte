<script lang="ts">
	let selectedAPI = 'gemini'; // 기본값으로 Gemini 선택
	let userInput = '';
	let response = '';

	async function handleSubmit() {
		if (!userInput.trim()) return;

		try {
			let apiEndpoint;
			switch (selectedAPI) {
				case 'gemini':
					apiEndpoint = '/api/gemini';
					break;
				case 'claude':
					apiEndpoint = '/api/claude';
					break;
				case 'openai':
					apiEndpoint = '/api/openai';
					break;
				case 'huggingface':
					apiEndpoint = '/api/huggingface';
					break;
				case 'solarllm':
					apiEndpoint = '/api/solarllm';
					break;
				default:
					throw new Error('잘못된 API 선택');
			}

			const res = await fetch(apiEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: userInput })
			});

			const data = await res.json();
			response = data.response;
		} catch (error) {
			console.error('API 호출 오류:', error);
			response = 'API 호출 중 오류가 발생했습니다.';
		}
	}
</script>

<main>
	<h1>AI 채팅</h1>

	<div>
		<label>
			<input type="radio" bind:group={selectedAPI} value="gemini" />
			Gemini
		</label>
		<label>
			<input type="radio" bind:group={selectedAPI} value="claude" />
			Claude
		</label>
		<label>
			<input type="radio" bind:group={selectedAPI} value="openai" />
			OpenAI
		</label>
		<label>
			<input type="radio" bind:group={selectedAPI} value="huggingface" />
			Hugging Face
		</label>
		<label>
			<input type="radio" bind:group={selectedAPI} value="solarllm" />
			SolarLLM
		</label>
	</div>

	<textarea bind:value={userInput} placeholder="메시지를 입력하세요..."></textarea>
	<button on:click={handleSubmit}>전송</button>

	{#if response}
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
</style>
