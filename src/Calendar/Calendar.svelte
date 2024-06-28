<script>
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { getCalendarData, createContext } from "./calendar.js";

  const dispatch = createEventDispatcher();

  export let targetDate = new Date();
  export let autoSelectTargetDay = true;
  export let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  export let dayNamesOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  export let animationDuration = 600; // milliseconds

  let selectedYear = -1;
  let selectedMonth = -1;
  let selectedDayNumber = -1;
  let dayNumbers = [];

  $: {
    const data = getCalendarData(targetDate);

    selectedYear = data.year;
    selectedMonth = data.month;
    dayNumbers = data.dayNumbers;

    if (autoSelectTargetDay) {
      selectedDayNumber = data.day;
    } else {
      selectedDayNumber = -1;
      autoSelectTargetDay = true;
    }
  }

  let calendar;
  let ctx = {}; // '애니메이션'과 관련된 '상태'를 관리하는 '컨텍스트' 객체
  let direction;

  $: if (calendar) {
    ctx = createContext(calendar);
    direction = ctx.direction;
  }

  $: if (ctx.duration) {
    ctx.duration.set(animationDuration);
  }

  const handlePrevMonthClick = (event) => {
    event.target.blur();
    ctx.direction.set("up");
    autoSelectTargetDay = false;
    targetDate = new Date(selectedYear, selectedMonth - 2, 1);
  };

  const handleNextMonthClick = (event) => {
    event.target.blur();
    ctx.direction.set("down");
    autoSelectTargetDay = false;
    targetDate = new Date(selectedYear, selectedMonth, 1);
  };

  const handleDayNumberClick = (event) => {
    const dayNumber = parseInt(event.target.textContent);

    if (!dayNumber) {
      return;
    }

    selectedDayNumber = dayNumber;

    selectedYear = targetDate.getFullYear();
    selectedMonth = targetDate.getMonth() + 1;

    dispatch("dateSelected", {
      targetDate: new Date(selectedYear, selectedMonth - 1, dayNumber),
    });
  };

  // TODO: Calendar 컴포넌트 개선
  //
  // - 'https://mui.com/x/react-date-pickers/date-calendar/' 와 유사한 형태로 개선할 것.
  //
  // - '년, 달' 선택 및 이동 기능 보완
  // - 키보드 네비게이션 추가: '사방' 방향으로 날짜 이동?
  // - '오늘' 날짜에 '원' 보더 표시
  // - 애니메이션 도중에 '일 숫자'에 대한 사용자 인터랙션 제한
  // - 간혹 발생하는 '애니메이션 종료'후 '깜빡임' 가능하면 제거
</script>

<div class="calendar-container">
  <div
    class="calendar"
    style:min-width={ctx.calendarWidth ?? "auto"}
    style:max-width={ctx.calendarWidth ?? "auto"}
    style:min-height={ctx.calendarHeight ?? "auto"}
    style:max-height={ctx.calendarHeight ?? "auto"}
    bind:this={calendar}
  >
    <div class="topPart">
      <div class="header">
        <div class="monthYear">
          {monthNames[selectedMonth - 1]}
          {selectedYear}
        </div>
        <button
          class="prevMonth"
          disabled={$direction !== ""}
          on:click={handlePrevMonthClick}>&lt;</button
        >
        <button
          class="nextMonth"
          disabled={$direction !== ""}
          on:click={handleNextMonthClick}>&gt;</button
        >
        {#each dayNamesOfWeek as dayName}
          <div class="dayName">{dayName}</div>
        {/each}
      </div>
    </div>
    <div class="bottomPart">
      {#key `${selectedYear}-${selectedMonth}`}
        <div
          class="dayNumbers"
          in:fly={ctx.flyInProp}
          out:fly={ctx.flyOutProp}
          on:introstart={ctx.flyIntroStart}
          on:introend={ctx.flyIntroEnd}
          on:outrostart={ctx.flyOutroStart}
          on:outroend={ctx.flyOutroEnd}
        >
          {#each dayNumbers as { day, key } (key)}
            <button
              tabindex="-1"
              class="dayNumber"
              class:hoverable={day}
              class:selected={selectedDayNumber === day}
              on:click={handleDayNumberClick}
            >
              {day || ""}
            </button>
          {/each}
        </div>
      {/key}
    </div>
  </div>
</div>

<style lang="scss">
  $grid-item-padding: 10px;
  $bg-color: white;

  /*
    '.calendar-container'는 캘린더 보더를 설정하고,
    'z-index' 스태킹 컨텍스트(Stacking Context)를 리셋한다.
   */
  .calendar-container {
    border: 1px solid darkgray;
    border-radius: 5px;
    padding: 5px;
    background-color: $bg-color;

    .calendar {
      position: relative;
      z-index: 0;
      background-color: $bg-color;
      overflow: hidden;
      user-select: none;

      .topPart {
        position: relative;
        z-index: 2;
        background-color: $bg-color;

        .header {
          display: grid;
          z-index: 1;
          grid-template-rows: repeat(2, 1fr);
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          align-items: center;

          .monthYear {
            grid-column: 1 / -3;
            padding: $grid-item-padding;
            font-size: 1.2em;
            font-weight: bold;
          }

          .prevMonth,
          .nextMonth {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: $grid-item-padding;
            width: 1.7em;
            height: 1.7em;
            font-size: 1.2em;
            font-weight: bold;
            background: none;
            border: none;
            border-radius: 50%;
            outline: none;
            cursor: pointer;

            &:hover {
              background-color: lighten(darkgray, 20%);
            }

            &:focus {
              background-color: darkgray;

              &:hover {
                background-color: darken(darkgray, 10%);
              }
            }
          }

          .dayName {
            padding: $grid-item-padding;
          }
        }
      }

      .bottomPart {
        position: relative;
        z-index: 1;
        background-color: $bg-color;

        /*
          NOTE: '.dayNumbers'에 'position: absolute'를 설정하면
                'display: grid'가 제대로 동작하지 않는다. 'relative'로
                설정후 'document flow'에 의해서 차례대로 배치된 2개의 div중에서
                1번째 div는 'out'되는 div이고 2번째 div는 'in'되는 div이다.
                이 2개의 div의 'top'값을 조정하여 'fly' 애니메이션을 구현했다.
         */
        .dayNumbers {
          position: relative;
          display: grid;
          grid-template-rows: repeat(6, 1fr);
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          align-items: center;

          .dayNumber {
            background: none;
            border: none;
            padding: $grid-item-padding;
            outline: none;

            &.hoverable {
              border-radius: 50%;
              cursor: pointer;

              &:hover {
                background-color: lighten(lightcoral, 20%);
              }

              &.selected {
                background-color: lightcoral;

                &:hover {
                  background-color: darken(lightcoral, 10%);
                }
              }
            }
          }
        }
      }
    }
  }
</style>
