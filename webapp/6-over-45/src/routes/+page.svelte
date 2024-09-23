<script lang="ts">
	import { Tab } from 's-comp-core';
	import Null from './Null.svelte';

	const tabs = [
		{
			label: 'Tab 1',
			component: Null,
			componentClassName: null
		}
	];
</script>

<Tab {tabs} />