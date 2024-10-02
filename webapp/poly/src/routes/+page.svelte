<script lang="ts">
	import { onMount } from 'svelte';
	import { debounce } from 'lodash-es';

	import Poly, { type LLMSingleQueryFunction } from '$components/Poly.svelte';

	import { type LLMRequest, type LLMResponse, GeminiModel } from '../types/api';
	import { createLLMRequest } from '$lib/llm';
	import { singleQuery } from '$lib';

	let editor: Poly;
	let llmSingleQuery: LLMSingleQueryFunction = callGeminiAPI;

	const handleResize = debounce(() => editor?.update(), 100);

	onMount(() => {
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			handleResize.cancel();
		};
	});

	async function callGeminiAPI(content: string, promptHeader: string): Promise<string> {
		console.log(`called LLM API: ${content}`);

		const polynomialExpr = content;
		const apiPrompt = `${promptHeader}${polynomialExpr}`;

		try {
			const model = GeminiModel.Gemini15Flash8BExp;
			const request: LLMRequest = createLLMRequest({ prompt: apiPrompt, model });
			const response: LLMResponse = await singleQuery(request);
			if (response.error) {
				return `[오류] ${response.source}: ${response.error}`;
			}
			return response.response || '';
		} catch (error) {
			console.error('LLM API 호출 중 오류:', error);
			return '오류가 발생했습니다.';
		}
	}
</script>

<main>
	<Poly bind:this={editor} {llmSingleQuery} />
</main>

<style lang="scss">
	:global(html, body) {
		margin: 0;
		padding: 0;
	}

	main {
		width: 100%;
		height: 100vh;
	}
</style>
