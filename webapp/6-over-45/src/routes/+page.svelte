<script lang="ts">
	import { Tab } from 's-comp-core';
	import LottoFrequency from './LottoFrequency.svelte';
	import NextGuess from './NextGuess.svelte';

	let tab: Tab;

	const tabs = [
		{
			label: '로또 당첨 번호 빈도',
			component: LottoFrequency,
			componentClassName: null
		},
		{
			label: '다음 당첨 번호 예측',
			component: NextGuess,
			componentClassName: null
		}
	];
</script>

<Tab bind:this={tab} selectedTabIndex={1} {tabs} />
