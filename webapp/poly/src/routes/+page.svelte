<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<main>
	<h1>AI 채팅 서비스</h1>
	
	<nav>
		<button on:click={() => goto('/single-query')}>단답형 질의응답</button>
		<button on:click={() => goto('/chat')}>컨텍스트 유지 채팅</button>
	</nav>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		text-align: center;
	}

	nav {
		margin-top: 20px;
	}

	button {
		padding: 10px 20px;
		margin: 0 10px;
		font-size: 16px;
		cursor: pointer;
	}
</style>
