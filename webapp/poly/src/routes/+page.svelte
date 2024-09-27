<script lang="ts">
	let prompt: string = '';
	let response: string = '';
	let isLoading: boolean = false;

	async function generateContent(): Promise<void> {
		isLoading = true;
		try {
			const res: Response = await fetch('/api/gemini', {
				method: 'POST',
				body: JSON.stringify({ prompt }),
				headers: { 'Content-Type': 'application/json' }
			});
			const data: { response: string } = await res.json();
			response = data.response;
		} catch (error) {
			console.error('오류:', error);
			response = '오류가 발생했습니다.';
		} finally {
			isLoading = false;
		}
	}
</script>

<main>
	<h1>제미나이 API 테스트</h1>
	<textarea bind:value={prompt} placeholder="프롬프트를 입력하세요"></textarea>
	<button on:click={generateContent} disabled={isLoading}>
		{isLoading ? '생성 중...' : '내용 생성'}
	</button>
	{#if response}
		<h2>응답:</h2>
		<p>{response}</p>
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
</style>
