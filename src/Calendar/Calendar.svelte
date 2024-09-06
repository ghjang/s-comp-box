<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { type Writable } from "svelte/store";
  import { fly } from "svelte/transition";
  import {
    getCalendarData,
    createContext,
    type CalendarContext,
    type DayNumber,
  } from "./calendar";
  import DayNumbers from "./DayNumbers.svelte";

  const dispatch = createEventDispatcher<{
    dateSelected: { targetDate: Date };
  }>();

  export let targetDate: Date = new Date();
  export let autoSelectTargetDay: boolean = true;
  export let autoFocusTargetDay: boolean = false;
  export let monthNames: string[] = [
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
  export let dayNamesOfWeek: string[] = ["S", "M", "T", "W", "T", "F", "S"];

  export let disableAnimation: boolean = false;
  export let animationDuration: number = 600; // milliseconds

  let selectedYear: number = -1;
  let selectedMonth: number = -1;
  let selectedDayNumber: number = -1;
  let dayNumbers: DayNumber[] = [];

  let dayNumbersDiv: DayNumbers;
  let lastFocusedDayNumber: number = -1;
  let firstTimeAutoFocusTargetDay: boolean = true;

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

  let calendar: HTMLDivElement;
  let ctx: CalendarContext = {} as CalendarContext;
  let direction: Writable<string>;

  // NOTE: 이 '반응형 블럭'에서 '의존성 변수'는 'calendar' 1개이다.
  //       'ctx'의 경우는 '코드 텍스트' 자체로만 보았을때는 'ctx.direction'에
  //       대한 참조가 있어서 '의존성 변수'로 보일 수 있지만, 'ctx'는 'calendar'를
  //       인자로 하는 'createContext' 함수 호출로 생성(대입)됨으로 이 반응성
  //       블럭을 트리거하는 '의존성 변수'가 아니라고 '세멘틱 분석' 단계에서 배제되는 것으로 보임.
  //
  //       특정 반응성 블럭과 관계된 '의존성 변수'를 판단하는 것은 '최적화'를 거친다.
  //       대략 다음과 같은 내부 단계를 거친다:
  //        1. 의존성 추적 - 1차적 '의존성 변수' 추적?
  //        2. 구분 분석 - '의존성 그래프'의 생성? 의존성 그래프를 통해서 후속 반응형 블럭 트리거 순서 결정?
  //        3. 세멘틱 분석 - 최종적 '의존성 변수' 판단?
  $: if (calendar) {
    ctx = createContext(calendar);
    direction = ctx.direction;
  }

  $: ctx.duration?.set(disableAnimation ? 0 : animationDuration);

  // '달 이동' 후에 선택된 날짜로 포커스 이동
  $: if (dayNumbersDiv && autoFocusTargetDay) {
    if (firstTimeAutoFocusTargetDay) {
      // NOTE: 컴포넌트가 최초에 렌더링된 후에는 자동 포커스 처리를 하지 않도록 한다.
      firstTimeAutoFocusTargetDay = false;
    } else {
      const targetDay = targetDate?.getDate();
      const targetDayElem = calendar?.querySelector(
        `button[data-day="${targetDay}"]`,
      ) as HTMLButtonElement | null;
      targetDayElem?.focus();
    }
  }

  const handlePrevMonthClick = (event: MouseEvent) => {
    const target = event.target as HTMLButtonElement;
    target.blur();
    if (!disableAnimation) {
      ctx.direction.set("right");
    }
    autoSelectTargetDay = false;
    let focusedDay = lastFocusedDayNumber !== -1 ? lastFocusedDayNumber : 1;
    if (lastFocusedDayNumber === -1 && selectedDayNumber !== -1) {
      focusedDay = selectedDayNumber;
    }
    const prevMonLastDay = new Date(selectedYear, selectedMonth - 1, 0);
    const targetDay = Math.min(focusedDay, prevMonLastDay.getDate());
    targetDate = new Date(selectedYear, selectedMonth - 2, targetDay);
  };

  const handleNextMonthClick = (event: MouseEvent) => {
    const target = event.target as HTMLButtonElement;
    target.blur();
    if (!disableAnimation) {
      ctx.direction.set("left");
    }
    autoSelectTargetDay = false;
    let focusedDay = lastFocusedDayNumber !== -1 ? lastFocusedDayNumber : 1;
    if (lastFocusedDayNumber === -1 && selectedDayNumber !== -1) {
      focusedDay = selectedDayNumber;
    }
    const nextMonLastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const targetDay = Math.min(focusedDay, nextMonLastDay.getDate());
    targetDate = new Date(selectedYear, selectedMonth, targetDay);
  };

  const handleDayNumberClick = (event: MouseEvent) => {
    const target = event.target as HTMLButtonElement;
    const dayNumber = parseInt(target.textContent || "");

    if (!dayNumber) {
      return;
    }

    target.focus();

    selectedDayNumber = dayNumber;

    selectedYear = targetDate.getFullYear();
    selectedMonth = targetDate.getMonth() + 1;

    dispatch("dateSelected", {
      targetDate: new Date(selectedYear, selectedMonth - 1, dayNumber),
    });
  };

  // TODO: 'handleDayNumberKeyDown' 키보드 네비게이션 코드 분리 및 개선
  //
  // - '달 네비게이션'용의 '스토어 객체' 따위를 별도로 추가?
  const handleDayNumberKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const ctrlKey = event.ctrlKey;
    const metaKey = event.metaKey;
    const key = event.key;

    const parent = target.parentElement;
    if (!parent) return;

    if (key === "ArrowLeft") {
      const prevSibling = target.previousElementSibling as HTMLElement;
      if (prevSibling && prevSibling.dataset.day !== "") {
        prevSibling.focus();
      }
    } else if (key === "ArrowRight") {
      const nextSibling = target.nextElementSibling as HTMLElement | null;
      if (nextSibling && nextSibling.dataset.day !== "") {
        nextSibling.focus();
      }
    } else if (key === "ArrowUp") {
      const curDay = parseInt(target.dataset.day || "");
      if (!isNaN(curDay)) {
        const preRowDay = curDay - 7;
        const selectedDayElem = parent.querySelector(
          `[data-day="${preRowDay}"]`,
        ) as HTMLButtonElement | null;
        selectedDayElem?.focus();
      }
    } else if (key === "ArrowDown") {
      const curDay = parseInt(target.dataset.day || "");
      if (!isNaN(curDay)) {
        const nextRowDay = curDay + 7;
        const selectedDayElem = parent.querySelector(
          `[data-day="${nextRowDay}"]`,
        ) as HTMLButtonElement | null;
        selectedDayElem?.focus();
      }
    } else if (key === "Home") {
      if (ctrlKey) {
        const selectedDayElem = parent.querySelector(
          `[data-day]:not([data-day=""])`,
        ) as HTMLButtonElement | null;
        selectedDayElem?.focus();
      } else {
        const curDay = parseInt(target.dataset.day || "");
        const curDate = new Date(selectedYear, selectedMonth - 1, curDay);
        const dayOfWeek = curDate.getDay();
        const sundayDay = curDay - dayOfWeek;
        const selectedDayElem = parent.querySelector(
          `[data-day="${sundayDay > 0 ? sundayDay : 1}"]`,
        ) as HTMLButtonElement | null;
        selectedDayElem?.focus();
      }
    } else if (key === "End") {
      if (ctrlKey) {
        const lastDayElem = parent.querySelector(
          `[data-day]:not([data-day=""]):last-child`,
        ) as HTMLButtonElement | null;
        lastDayElem?.focus();
      } else {
        const curDay = parseInt(target.dataset.day || "");
        const curDate = new Date(selectedYear, selectedMonth - 1, curDay);
        const dayOfWeek = curDate.getDay();
        const saturdayDay = curDay + (6 - dayOfWeek);
        const lastDayElem = parent.querySelector(
          `[data-day]:not([data-day=""]):last-child`,
        ) as HTMLButtonElement | null;
        if (
          lastDayElem &&
          saturdayDay <= parseInt(lastDayElem.dataset.day || "")
        ) {
          const targetDayElem = parent.querySelector(
            `[data-day="${saturdayDay}"]`,
          ) as HTMLButtonElement | null;
          targetDayElem?.focus();
        } else if (lastDayElem) {
          lastDayElem.focus();
        }
      }
    } else if (key === "PageUp" || key === "PageDown") {
      const curDay = parseInt(target.dataset.day || "");

      if (isNaN(curDay)) {
        return;
      }

      autoSelectTargetDay = false;

      // NOTE: 'Ctrl(Command) + PageUp/PageDown'을 통해서 각각 '1월'과 '12월'로 점프시에는
      //       '애니메이션' 없이 곧바로 이동하도록 하기 위한 workaround 코드이다.
      let animationDurationBackUp = animationDuration;

      ctx.setFlyEndAction(() => {
        const targetDay = targetDate.getDate();
        const targetDayElem = calendar.querySelector(
          `button[data-day="${targetDay}"]`,
        ) as HTMLButtonElement | null;
        targetDayElem?.focus();
        if (animationDurationBackUp !== animationDuration) {
          animationDuration = animationDurationBackUp;
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
          if (!disableAnimation) {
            ctx.direction.set("down");
          }
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
          if (!disableAnimation) {
            ctx.direction.set("up");
          }
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
    bind:this={calendar}
    class="calendar"
    style:min-width={ctx.calendarWidth ?? "auto"}
    style:max-width={ctx.calendarWidth ?? "auto"}
    style:min-height={ctx.calendarHeight ?? "auto"}
    style:max-height={ctx.calendarHeight ?? "auto"}
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
    <div
      class="bottomPart"
      class:isFlying={!disableAnimation && $direction !== ""}
    >
      {#if disableAnimation}
        {#key `${selectedYear}-${selectedMonth}`}
          <DayNumbers
            bind:this={dayNumbersDiv}
            {dayNumbers}
            {selectedDayNumber}
            {handleDayNumberClick}
            {handleDayNumberKeyDown}
            on:dayNumberButtonFocus={(e) =>
              (lastFocusedDayNumber = e.detail.day)}
          />
        {/key}
      {:else}
        {#key `${selectedYear}-${selectedMonth}`}
          <div
            class="dayNumbersWrapper"
            in:fly={ctx.flyInProp}
            out:fly={ctx.flyOutProp}
            on:introstart={ctx.flyIntroStart}
            on:introend={ctx.flyIntroEnd}
            on:outrostart={ctx.flyOutroStart}
            on:outroend={ctx.flyOutroEnd}
          >
            <DayNumbers
              bind:this={dayNumbersDiv}
              {dayNumbers}
              {selectedDayNumber}
              {handleDayNumberClick}
              {handleDayNumberKeyDown}
              on:dayNumberButtonFocus={(e) =>
                (lastFocusedDayNumber = e.detail.day)}
            />
          </div>
        {/key}
      {/if}
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
        z-index: 1;
        background-color: $bg-color;

        .dayNumbersWrapper {
          position: relative;
        }

        &.isFlying {
          pointer-events: none;
        }
      }
    }
  }
</style>
