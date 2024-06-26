<script>
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

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

  let selectedYear = -1;
  let selectedMonth = -1;
  let selectedDayNumber = -1;

  let xDirection = 0;
  const animationDuration = 600;

  // 'getDaysInMonth()'는 '해당 월의 일 수'를 반환한다.
  const getDaysInMonth = (year, month) => {
    // 'getDate()'는 'Date 객체'에 지정된 '월'의 '일 수'를 반환한다.
    // 'new Date(year, month + 1, 0)'은 '다음 달의 0일'을 의미한다.
    // '0일'은 '이전 달의 마지막 날'과도 같은 의미다. 따라서 '다음 달의 0일'의
    // 'getDate()'를 호출하면 '이전 달의 마지막 날'을 반환한다. '월'의
    // '마지막 날'은 '윤년'과 '큰 달'과 '작은 달'에 따라 다르다. '다음 달의 0일'이라는
    // 트릭을 사용하면 '해당 월의 전체 일 수'를 쉽게 구할 수 있다.
    return new Date(year, month + 1, 0).getDate();
  };

  // 'getDay()'는 '0(일요일)'부터 '6(토요일)'까지의 값을 반환한다.
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonthClick = (event) => {
    event.target.blur();
    xDirection = -1;
    autoSelectTargetDay = false;
    targetDate = new Date(selectedYear, selectedMonth - 2, 1);
  };

  const handleNextMonthClick = (event) => {
    event.target.blur();
    xDirection = 1;
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

  const handleFlyOutroStart = (event) => {
    if (xDirection === 1) {
      event.target.style.willChange = "top";
    } else if (xDirection === -1) {
      event.target.style.willChange = "top";
    } else {
      // do nothing
    }
  };

  const handleFlyOutroEnd = (event) => {
    event.target.style.willChange = "auto";
  };

  const handleFlyIntroStart = (event) => {
    const h = xDirection * bottomPartSize.height;
    const style = event.target.style;

    if (xDirection === 1) {
      style.willChange = "top";
      style.top = `-${h}px`;
    } else if (xDirection === -1) {
      style.willChange = "top";
      style.top = `${h}px`;
    } else {
      // do nothing
    }
  };

  const handleFlyIntroEnd = (event) => {
    event.target.style.willChange = "auto";
    event.target.style.top = "0";
    xDirection = 0;
  };

  let dayNumbers = [];

  $: {
    let date = null;

    if (targetDate instanceof Date) {
      date = targetDate;
    } else if (typeof targetDate === "string") {
      date = new Date(targetDate);
    } else {
      throw new Error("Invalid targetDay type");
    }

    dayNumbers = [];

    const year = date.getFullYear(); // 'getFullYear()'는 '4자리 연도'를 반환한다.
    const month = date.getMonth(); // 'getMonth()'는 '0(1월)'부터 '11(12월)'까지의 값을 반환한다.
    const day = date.getDate(); // 'getDate()'는 '1(1일)'부터 '31(31일)'까지의 값을 반환한다.

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    for (let i = 0; i < firstDayOfMonth; ++i) {
      dayNumbers.push({ day: null, key: crypto.randomUUID() });
    }
    for (let i = 1; i <= daysInMonth; ++i) {
      dayNumbers.push({ day: i, key: crypto.randomUUID() });
    }

    selectedYear = year;
    selectedMonth = month + 1;

    if (autoSelectTargetDay) {
      selectedDayNumber = day;
    } else {
      selectedDayNumber = -1;
      autoSelectTargetDay = true;
    }
  }

  class FlyInProp {
    get y() {
      return xDirection * bottomPartSize.height;
    }

    get duration() {
      return animationDuration;
    }
  }

  // NOTE: 'fly' 애니메이션에 설정되는 '속성 객체'는 'DOM'에 추가될 때 설정된다.
  //       'in:fly'의 경우는 해당 요소 객체가 'DOM'에 추가될 때 '속성 객체'를 설정하기 때문에
  //       '현재의 이동 방향'이 반영되어 문제가 없다. 하지만 'out:fly'의 경우는 해당 요소 객체가
  //       'DOM'에서 제거될 때 '속성 객체'를 설정하기 때문에 '현재의 이동 방향'이 아닌 '이전의 이동 방향'이
  //       반영되어 문제가 발생한다. 이 문제를 해결하기 위해 'FlyOutProp' 클래스 객체를 사용하여
  //       'out:fly'에서 동적으로 현재의 이동 방향에을 참조할 수 있도록 함.
  //
  class FlyOutProp {
    get y() {
      return xDirection * -calendarSize.height;
    }

    get duration() {
      return animationDuration;
    }
  }

  let calendar;
  let calendarSize;
  let initialCalendarWidth = "auto";
  let initialCalendarHeight = "auto";
  let bottomPart;
  let bottomPartSize;

  $: if (calendar) {
    // NOTE: 'calendar'가 최초에 마운트된 시점의 초기 영역 크기 값을 저장한다.
    calendarSize = calendar.getBoundingClientRect();
    initialCalendarWidth = `${calendarSize.width}px`;
    initialCalendarHeight = `${calendarSize.height}px`;
    bottomPartSize = bottomPart.getBoundingClientRect();
  }

  const flyInProp = new FlyInProp();
  const flyOutProp = new FlyOutProp();

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
    style:min-width={initialCalendarWidth}
    style:max-width={initialCalendarWidth}
    style:min-height={initialCalendarHeight}
    style:max-height={initialCalendarHeight}
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
          disabled={xDirection !== 0}
          on:click={handlePrevMonthClick}>&lt;</button
        >
        <button
          class="nextMonth"
          disabled={xDirection !== 0}
          on:click={handleNextMonthClick}>&gt;</button
        >
        {#each dayNamesOfWeek as dayName}
          <div class="dayName">{dayName}</div>
        {/each}
      </div>
    </div>
    <div class="bottomPart" bind:this={bottomPart}>
      {#key `${selectedYear}-${selectedMonth}`}
        <div
          class="dayNumbers"
          in:fly={flyInProp}
          out:fly={flyOutProp}
          on:introstart={handleFlyIntroStart}
          on:introend={handleFlyIntroEnd}
          on:outrostart={handleFlyOutroStart}
          on:outroend={handleFlyOutroEnd}
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
