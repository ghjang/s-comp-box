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

  // 'targetDate'로부터 캘린더 구성
  $: {
    const data = getCalendarData(targetDate);

    selectedYear = data.year;
    selectedMonth = data.month;
    dayNumbers = data.dayNumbers;

    if (autoSelectTargetDay) {
      selectedDayNumber = data.day;
    } else {
      selectedDayNumber = -1;
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
    ctx.direction.set("left");
    autoSelectTargetDay = false;
    targetDate = new Date(selectedYear, selectedMonth - 2, 1);
  };

  const handleNextMonthClick = (event) => {
    event.target.blur();
    ctx.direction.set("right");
    autoSelectTargetDay = false;
    targetDate = new Date(selectedYear, selectedMonth, 1);
  };

  const handleDayNumberClick = (event) => {
    const dayNumber = parseInt(event.target.textContent);

    if (!dayNumber) {
      return;
    }

    event.target.focus();

    selectedDayNumber = dayNumber;

    selectedYear = targetDate.getFullYear();
    selectedMonth = targetDate.getMonth() + 1;

    dispatch("dateSelected", {
      targetDate: new Date(selectedYear, selectedMonth - 1, dayNumber),
    });
  };

  const handleDayNumberKeyDown = (event) => {
    const ctrlKey = event.ctrlKey;
    const metaKey = event.metaKey;
    const key = event.key;

    const parent = event.target.parentElement;

    if (key === "ArrowLeft") {
      const prevSibling = event.target.previousElementSibling;
      if (prevSibling && prevSibling.dataset.day != "") {
        prevSibling.focus();
      }
    } else if (key === "ArrowRight") {
      event.target.nextElementSibling?.focus();
    } else if (key === "ArrowUp") {
      const curDay = parseInt(event.target.dataset.day);
      if (!isNaN(curDay)) {
        const preRowDay = curDay - 7;
        parent.querySelector(`[data-day="${preRowDay}"]`)?.focus();
      }
    } else if (key === "ArrowDown") {
      const curDay = parseInt(event.target.dataset.day);
      if (!isNaN(curDay)) {
        const nextRowDay = curDay + 7;
        parent.querySelector(`[data-day="${nextRowDay}"]`)?.focus();
      }
    } else if (key === "Home") {
      if (ctrlKey) {
        parent.querySelector(`[data-day]:not([data-day=""])`)?.focus();
      } else {
        const curDay = parseInt(event.target.dataset.day);
        const curDate = new Date(selectedYear, selectedMonth - 1, curDay);
        const dayOfWeek = curDate.getDay();
        const sundayDay = curDay - dayOfWeek;
        if (sundayDay > 0) {
          parent.querySelector(`[data-day="${sundayDay}"]`)?.focus();
        } else {
          parent.querySelector(`[data-day="1"]`)?.focus();
        }
      }
    } else if (key === "End") {
      if (ctrlKey) {
        parent
          .querySelector(`[data-day]:not([data-day=""]):last-child`)
          ?.focus();
      } else {
        const curDay = parseInt(event.target.dataset.day);
        const curDate = new Date(selectedYear, selectedMonth - 1, curDay);
        const dayOfWeek = curDate.getDay();
        const saturdayDay = curDay + (6 - dayOfWeek);
        const lastDayElem = parent.querySelector(
          `[data-day]:not([data-day=""]):last-child`
        );
        if (saturdayDay <= lastDayElem.dataset.day) {
          parent.querySelector(`[data-day="${saturdayDay}"]`)?.focus();
        } else {
          lastDayElem.focus();
        }
      }
    } else if (key === "PageUp" || key === "PageDown") {
      const curDay = parseInt(event.target.dataset.day);

      if (isNaN(curDay)) {
        return;
      }

      autoSelectTargetDay = false;

      // NOTE: 'Ctrl(Command) + PageUp/PageDown'을 통해서 각각 '1월'과 '12월'로 점프시에는
      //       '애니메이션' 없이 곧바로 이동하도록 하기 위한 workaround 코드이다.
      let animationDurationBak = animationDuration;

      ctx.setFlyEndAction(() => {
        const targetDay = targetDate.getDate();
        calendar.querySelector(`button[data-day="${targetDay}"]`)?.focus();
        if (animationDurationBak !== animationDuration) {
          animationDuration = animationDurationBak;
        }
      });

      if (key === "PageUp") {
        // NOTE: 'macOS'에서 'Ctrl + PageUp' 코드가 정상적으로 오지 않는다.
        //        macOS의 경우는 'Command(Meta) + PageUp'을 사용을 사용하도록 일단 변경함.
        if (ctrlKey || metaKey) {
          if (selectedMonth !== 1) {
            animationDuration = 0;
            const januaryLastDay = new Date(selectedYear, 0, 0);
            const targetDay = Math.min(curDay, januaryLastDay.getDate());
            targetDate = new Date(selectedYear, 0, targetDay);
          } else {
            // do nothing
          }
        } else {
          ctx.direction.set("up");
          const prevMonLastDay = new Date(selectedYear, selectedMonth - 1, 0);
          const targetDay = Math.min(curDay, prevMonLastDay.getDate());
          targetDate = new Date(selectedYear, selectedMonth - 2, targetDay);
        }
      } else {
        if (ctrlKey || metaKey) {
          if (selectedMonth !== 12) {
            animationDuration = 0;
            const decemberLastDay = new Date(selectedYear, 12, 0);
            const targetDay = Math.min(curDay, decemberLastDay.getDate());
            targetDate = new Date(selectedYear, 11, targetDay);
          } else {
            // do nothing
          }
        } else {
          ctx.direction.set("down");
          const nextMonLastDay = new Date(selectedYear, selectedMonth + 1, 0);
          const targetDay = Math.min(curDay, nextMonLastDay.getDate());
          targetDate = new Date(selectedYear, selectedMonth, targetDay);
        }
      }
    }
  };

  // TODO: Calendar 컴포넌트 개선
  //
  // - 'https://mui.com/x/react-date-pickers/date-calendar/' 와 유사한 형태로 개선할 것.
  //
  // - '년, 달' 선택 및 이동 기능 보완
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
    <div class="bottomPart" class:isFlying={$direction !== ""}>
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
            {@const dayVal = day || ""}
            <button
              tabindex="-1"
              class="dayNumber"
              class:hoverable={day}
              class:selected={selectedDayNumber === day}
              data-day={dayVal}
              on:click={handleDayNumberClick}
              on:keydown={handleDayNumberKeyDown}
            >
              {dayVal}
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

        &.isFlying {
          pointer-events: none;
        }

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
                background-color: lighten(darkgray, 20%);
              }

              &:focus {
                background-color: lighten(lightcoral, 20%);
              }

              &.selected {
                background-color: lightcoral;

                &:hover,
                &:focus {
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
