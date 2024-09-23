<script lang="ts">
	import { onMount } from 'svelte';
	import { ToggleGroup, RadioButton } from 's-comp-core';
	import * as d3 from 'd3';

	// NOTE: Tab 컴포넌트 내부에서 'update' 함수 존재 여부를 동적으로 확인해서 호출한다.
	export function update() {
		drawChart();
	}

	let frequencyData: any = null;
	let frequencyWithBonus = true;

	onMount(async () => {
		const response = await fetch('/data/frequency.json');
		frequencyData = await response.json();
		drawChart();
	});

	function handleToggleItemChanged(event: CustomEvent) {
		frequencyWithBonus = event.detail.value === 'frequency_with_bonus';
		drawChart();
	}

	function drawChart() {
		if (!frequencyData) {
			return;
		}

		const data = frequencyWithBonus
			? frequencyData.cumulative_stats.frequency_with_bonus
			: frequencyData.cumulative_stats.frequency_without_bonus;

		console.log('Chart Data:', data); // 차트 데이터 확인

		const svg = d3.select('#chart');
		svg.selectAll('*').remove(); // 기존 차트 삭제

		const margin = { top: 20, right: 30, bottom: 40, left: 40 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const x = d3
			.scaleBand()
			.domain(data.map((d, i) => (i + 1).toString())) // 도메인을 문자열로 설정
			.range([0, width])
			.padding(0.1);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d) as number]) // 도메인 최대값 설정
			.range([height, 0]);

		const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		chart
			.append('g')
			.attr('class', 'x-axis')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x));

		chart.append('g').attr('class', 'y-axis').call(d3.axisLeft(y));

		chart
			.selectAll('.bar')
			.data(data)
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', (d, i) => x((i + 1).toString()) as number) // x 위치 설정
			.attr('y', (d) => y(d)) // y 위치 설정
			.attr('width', x.bandwidth())
			.attr('height', (d) => height - y(d)) // 높이 설정
			.attr('fill', 'steelblue');
	}
</script>

<div class="lotto-frequency">
	<ToggleGroup
		direction="horizontal"
		hAlign="right"
		items={[
			{ component: RadioButton, label: '보너스 번호 포함', value: 'frequency_with_bonus' },
			{ component: RadioButton, label: '보너스 번호 제외', value: 'frequency_without_bonus' }
		]}
		activatedValue="frequency_with_bonus"
		on:toggleItemChanged={handleToggleItemChanged}
	/>
	{#if frequencyData}
		<div class="stats">
			<svg id="chart" width="800" height="400"></svg>
		</div>
	{:else}
		<p>로딩 중...</p>
	{/if}
</div>

<style lang="scss">
	.lotto-frequency {
		padding: 0.5em;
		font-family: 'Noto Sans KR', sans-serif;

		.stats {
			display: flex;
			justify-content: space-around;
			margin-bottom: 20px;

			div {
				flex: 1;
				margin: 0 10px;
			}
		}
	}
</style>
