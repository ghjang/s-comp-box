<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { ToggleGroup, RadioButton } from 's-comp-core';
	import * as d3 from 'd3';

	// NOTE: Tab 컴포넌트에 해당 컴포넌트가 설정된 탭이 선택될 경우에
	//       컴포넌트 내부에 'update' 함수 존재 여부를 동적으로 확인해서 호출해준다.
	export function update() {
		drawChart();
	}

	// 차트 크기 관련 변수들
	const chartWidth = 800;
	const chartHeight = 400;
	const margin = { top: 20, right: 30, bottom: 40, left: 40 };
	const width = chartWidth - margin.left - margin.right;
	const height = chartHeight - margin.top - margin.bottom;

	// 스타일 관련 변수들
	const barColorDefault = 'steelblue';
	const barColorHover = 'orange';
	const barColorSameValue = '#FFD580'; // 옅은 오렌지색
	const stripeColor = 'rgba(255, 140, 0, 0.4)'; // 진한 오렌지색 (투명도 40%)
	const highlightColorMin = '#FF5722';
	const highlightColorMax = '#9575CD';
	const highlightColorMid = '#8BC34A';
	const textColorFrequency = '#FF6B6B';
	const guideLineColor = '#00BCD4';
	const transitionDuration = 100;
	const barBorderColor = '#FF8C00'; // 진한 오렌지색

	let chartSvgElem: SVGElement | null = null;
	let frequencyData: any = null;
	let frequencyWithBonus = true;

	onMount(async () => {
		const response = await fetch('/data/frequency.json');
		frequencyData = await response.json();
		await tick(); // NOTE: 개발환경에서 '핫 리로딩' 시에 차트 렌더링이 안되는 문제 해결을 위해 필요함.
		drawChart();
	});

	function handleToggleItemChanged(event: CustomEvent) {
		frequencyWithBonus = event.detail.value === 'frequency_with_bonus';
		drawChart();
	}

	function drawChart() {
		if (!frequencyData || !chartSvgElem) {
			return;
		}

		const data = frequencyWithBonus
			? frequencyData.cumulative_stats.frequency_with_bonus
			: frequencyData.cumulative_stats.frequency_without_bonus;

		// 기존 차트 제거
		d3.select(chartSvgElem).selectAll('*').remove();

		const svg = d3
			.select(chartSvgElem)
			.attr('width', '100%')
			.attr('height', chartHeight)
			.attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)
			.attr('preserveAspectRatio', 'xMidYMid meet');

		const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		// x와 y 스케일 정의
		const x = d3
			.scaleBand()
			.range([0, width])
			.domain(data.map((d, i) => (i + 1).toString()))
			.padding(0.1);

		const y = d3
			.scaleLinear()
			.range([height, 0])
			.domain([0, d3.max(data) || 0]);

		// x축 추가
		const xAxis = chart
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x));

		xAxis.selectAll('text').style('text-anchor', 'middle');

		// x축 높이 계산
		const xAxisHeight = xAxis.node()?.getBBox().height || 0;

		// y축 추가
		chart.append('g').call(d3.axisLeft(y));

		// 최대값, 최소값, 중위수 찾기
		const maxValue = Math.max(...data);
		const minValue = Math.min(...data);
		const maxIndex = data.indexOf(maxValue);
		const minIndex = data.indexOf(minValue);
		const sortedData = [...data].sort((a, b) => a - b);
		const medianValue = sortedData[Math.floor(sortedData.length / 2)];
		const medianIndex = data.indexOf(medianValue);

		// 막대 그래프 그리기
		const bars = chart
			.selectAll('.bar')
			.data(data)
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', (d, i) => x((i + 1).toString()) as number)
			.attr('y', (d) => y(d))
			.attr('width', x.bandwidth())
			.attr('height', (d) => height - y(d))
			.attr('data-index', (d, i) => i) // 여기에 data-index 속성 추가
			.attr('fill', (d, i) => {
				if (i === maxIndex) return highlightColorMax;
				if (i === minIndex) return highlightColorMin;
				if (i === medianIndex) return highlightColorMid;
				return barColorDefault;
			});

		// 빈도수 텍스트 추가
		chart
			.selectAll('.bar-label')
			.data(data)
			.enter()
			.append('text')
			.attr('class', 'bar-label')
			.attr('x', (d, i) => (x((i + 1).toString()) as number) + x.bandwidth() / 2)
			.attr('y', (d) => y(d) - 2)
			.attr('text-anchor', 'middle')
			.text((d) => d)
			.attr('fill', textColorFrequency)
			.attr('font-size', '0.5em')
			.attr('font-weight', 'bold');

		// 최대값과 최소값 화살표 및 레이블 추가
		const arrowSize = 6;
		const arrowOffset = 3;
		const labelOffset = xAxisHeight + arrowSize + 15; // 화살표 크기와 여백 추가

		// 정삼각형 화살표 경로 생성 함수
		function createArrowPath(x, y) {
			return `M${x},${y} L${x - arrowSize / 2},${y + (arrowSize * Math.sqrt(3)) / 2} L${x + arrowSize / 2},${y + (arrowSize * Math.sqrt(3)) / 2} Z`;
		}

		// 화살표 및 레이블 추가 함수
		function addArrowAndLabel(index, label, color) {
			const xPosition = (x((index + 1).toString()) as number) + x.bandwidth() / 2;
			const yPosition = height + xAxisHeight + arrowOffset;

			chart.append('path').attr('d', createArrowPath(xPosition, yPosition)).attr('fill', color);

			chart
				.append('text')
				.attr('x', xPosition)
				.attr('y', height + labelOffset)
				.attr('text-anchor', 'middle')
				.attr('fill', color)
				.attr('font-weight', 'bold')
				.attr('font-size', '0.5em')
				.text(label);
		}

		// 최소값, 중위수, 최대값 화살표 및 레이블 추가
		addArrowAndLabel(minIndex, 'min', highlightColorMin);
		addArrowAndLabel(medianIndex, 'mid', highlightColorMid);
		addArrowAndLabel(maxIndex, 'max', highlightColorMax);

		// 가이드 라인을 위한 그룹 추가 (차트의 맨 위에)
		const guideLineGroup = chart.append('g').attr('class', 'guide-line-group');

		// 가이드 라인 생성 (초기에는 숨김)
		const guideLine = guideLineGroup
			.append('line')
			.attr('class', 'guide-line')
			.attr('x1', 0)
			.attr('x2', width)
			.attr('stroke', guideLineColor)
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '3,3')
			.attr('stroke-opacity', 0.7) // 70% 불투명도
			.style('display', 'none');

		// SVG에 패턴 정의 추가
		const defs = svg.append('defs');

		defs
			.append('pattern')
			.attr('id', 'stripe-pattern')
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('width', 8)
			.attr('height', 8)
			.attr('patternTransform', 'rotate(45)')
			.append('rect')
			.attr('width', 4)
			.attr('height', 8)
			.attr('transform', 'translate(0,0)')
			.attr('fill', stripeColor); // 진한 오렌지색 빗금 (투명도 적용)

		// 마우스 오버 효과 추가
		bars
			.on('mouseover', function (event, d) {
				const currentBar = d3.select(this);

				// 현재 막대를 오렌지색으로 변경
				currentBar
					.transition()
					.duration(transitionDuration)
					.attr('fill', barColorHover)
					.attr('stroke', 'none'); // 현재 막대의 테두리 제거

				// 같은 값을 가진 다른 막대들을 옅은 노란색 바탕에 빗금 패턴으로 변경하고 테두리 추가
				bars
					.filter(function (data) {
						return data === d && this !== currentBar.node();
					})
					.transition()
					.duration(transitionDuration)
					.attr('fill', barColorSameValue)
					.style('fill', `url(#stripe-pattern)`)
					.attr('stroke', barBorderColor)
					.attr('stroke-width', 1);

				// 가이드 라인 표시
				guideLine.attr('y1', y(d)).attr('y2', y(d)).style('display', 'block');
			})
			.on('mouseout', function (event, d) {
				// 모든 막대의 색상을 원래대로 복원하고 테두리 제거
				bars
					.transition()
					.duration(transitionDuration)
					.attr('fill', function (data, i) {
						const index = parseInt(d3.select(this).attr('data-index'));
						if (data === minValue && index === minIndex) return highlightColorMin;
						if (data === medianValue && index === medianIndex) return highlightColorMid;
						if (data === maxValue && index === maxIndex) return highlightColorMax;
						return barColorDefault;
					})
					.style('fill', null) // 빗금 패턴 제거
					.attr('stroke', 'none') // 테두리 제거
					.attr('stroke-width', 0);

				guideLine.style('display', 'none');
			});

		// 초기 막대 색상 설정
		bars.attr('fill', (d, i) => {
			if (i === maxIndex && i === data.lastIndexOf(maxValue)) return highlightColorMax;
			if (i === minIndex && i === data.indexOf(minValue)) return highlightColorMin;
			if (i === medianIndex && i === data.indexOf(medianValue)) return highlightColorMid;
			return barColorDefault;
		});
	}
</script>

<div class="lotto-frequency">
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
				<svg bind:this={chartSvgElem}></svg>
			</div>
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
