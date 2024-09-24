<script lang="ts">
	import { onMount } from 'svelte';
	import { barChart } from '../actions/barChart';
	import { ToggleGroup, RadioButton } from 's-comp-core';

	// NOTE: Tab 컴포넌트에 해당 컴포넌트가 설정된 탭이 선택될 경우에
	//       컴포넌트 내부에 'update' 함수 존재 여부를 동적으로 확인해서 호출해준다.
	export function update() {
		chartOptions = { ...chartOptions }; // 차트를 다시 그리게 한다.
	}

	// 차트 크기 관련 변수들
	const chartWidth = 800;
	const chartHeight = 400;
	const margin = { top: 20, right: 30, bottom: 40, left: 40 };

	let frequencyData: any = null;
	let frequencyWithBonus = true;
	let totalDraws = 0;

	let chartOptions = {
		data: [],
		width: chartWidth,
		height: chartHeight,
		margin: margin,
		barColorDefault: 'steelblue',
		barColorHover: 'orange',
		barColorSameValue: '#FFD580',
		stripeColor: 'rgba(255, 140, 0, 0.4)',
		highlightColorMin: '#FF5722',
		highlightColorMax: '#9575CD',
		highlightColorMid: '#8BC34A',
		textColorFrequency: '#FF6B6B',
		guideLineColor: '#00BCD4',
		transitionDuration: 100,
		barBorderColor: '#FF8C00'
	};

	onMount(async () => {
		const response = await fetch('/data/frequency.json');
		frequencyData = await response.json();

		// 전체 회차 계산
		const drawNumbers = Object.keys(frequencyData.recent_draws).map((key) =>
			parseInt(key.replace('draw_', ''))
		);
		totalDraws = Math.max(...drawNumbers);
	});

	$: if (frequencyData) {
		chartOptions = {
			...chartOptions,
			data: frequencyWithBonus
				? frequencyData.cumulative_stats.frequency_with_bonus
				: frequencyData.cumulative_stats.frequency_without_bonus
		};
	}

	function handleToggleItemChanged(event: CustomEvent) {
		frequencyWithBonus = event.detail.value === 'frequency_with_bonus';
	}
</script>

<div class="lotto-frequency">
	<h2>총 {totalDraws}회</h2>
	<ToggleGroup
		direction="vertical"
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
			<div class="chart-container">
				<svg use:barChart={chartOptions}></svg>
			</div>
		</div>
	{:else}
		<p>로딩 중...</p>
	{/if}
</div>

<style lang="scss">
	.lotto-frequency {
		padding: 0 1em 0.5em 1em;
		font-family: 'Noto Sans KR', sans-serif;

		h2 {
			text-align: center;
			margin-bottom: 1em;
		}

		.stats {
			display: flex;
			justify-content: center; // 중앙 정렬을 위해 변경
			margin: 1em;

			.chart-container {
				width: 100%;
				max-width: 800px; // 최대 너비 설정
				overflow-x: auto;

				svg {
					display: block; // inline-block에서 block으로 변경
					margin: 0 auto; // 좌우 마진을 auto로 설정하여 중앙 정렬
				}
			}
		}
	}
</style>
