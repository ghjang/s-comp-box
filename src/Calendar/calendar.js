import { writable, get } from "svelte/store";

// 'getDaysInMonth()'는 '해당 월의 일 수'를 반환한다.
function getDaysInMonth(year, month) {
  // 'getDate()'는 'Date 객체'에 지정된 '월'의 '일 수'를 반환한다.
  // 'new Date(year, month + 1, 0)'은 '다음 달의 0일'을 의미한다.
  // '0일'은 '이전 달의 마지막 날'과도 같은 의미다. 따라서 '다음 달의 0일'의
  // 'getDate()'를 호출하면 '이전 달의 마지막 날'을 반환한다. '월'의
  // '마지막 날'은 '윤년'과 '큰 달'과 '작은 달'에 따라 다르다. '다음 달의 0일'이라는
  // 트릭을 사용하면 '해당 월의 전체 일 수'를 쉽게 구할 수 있다.
  return new Date(year, month + 1, 0).getDate();
}

// 'getDay()'는 '0(일요일)'부터 '6(토요일)'까지의 값을 반환한다.
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function getCalendarData(targetDate) {
  let date = null;

  if (targetDate instanceof Date) {
    date = targetDate;
  } else if (typeof targetDate === "string") {
    date = new Date(targetDate);
  } else {
    throw new Error("Invalid targetDay type");
  }

  let dayNumbers = [];

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

  return {
    year,
    month: month + 1,
    day,
    dayNumbers,
  };
}

// NOTE: 'calendar'가 최초에 마운트된 후에 캘린더 자체의 크기가 변경되지는 않는 것을 가정한다.
//       최초 마운트 시점의 초기 영역 크기 값을 저장한다. 캘린더의 크기가 동적으로 변하게 추후에
//       수정할 경우 'ResizeObserver'를 사용해서 캘린더 크기 변화를 감지하고 'calendarWidth',
//       'calendarHeight' 값을 업데이트는 방식으로 구현이 가능할 것으로 보인다.
export function createContext(calendarElem) {
  let _direction = writable("");
  let _duration = writable(600);
  let _flyEndAction = null;

  const calendarSize = calendarElem.getBoundingClientRect();
  const initialCalendarWidth = `${calendarSize.width}px`;
  const initialCalendarHeight = `${calendarSize.height}px`;

  // '일 숫자' 부분을 나타내는 'bottomPart'를 찾는다.
  const bottomPart = calendarElem.querySelector(".bottomPart");
  const _bottomPartSize = bottomPart.getBoundingClientRect();

  // NOTE: 'in:fly'에서 'x, y'의 의미는 '현재의 위치'로 최종적으로 도착하기 전의 '애니메이션 시작 위치'를 의미한다.
  class FlyInProp {
    get x() {
      const direction = get(_direction);
      const xOffset = _bottomPartSize.width;

      switch (direction) {
        case "left":
          return xOffset;
        case "right":
          return -xOffset;
        default:
          return 0;
      }
    }

    get y() {
      const direction = get(_direction);
      const yOffset = _bottomPartSize.height;

      switch (direction) {
        case "up":
          return yOffset;
        case "down":
          return -yOffset;
        default:
          return 0;
      }
    }

    get duration() {
      return get(_duration);
    }
  }

  // NOTE: 'fly' 애니메이션에 설정되는 '속성 객체'는 'DOM'에 추가될 때 설정된다.
  //       'in:fly'의 경우는 해당 요소 객체가 'DOM'에 추가될 때 '속성 객체'를 설정하기 때문에
  //       '현재의 이동 방향'이 반영되어 문제가 없다. 하지만 'out:fly'의 경우는 해당 요소 객체가
  //       'DOM'에서 제거될 때 '속성 객체'를 설정하기 때문에 '현재의 이동 방향'이 아닌 '이전의 이동 방향'이
  //       반영되어 문제가 발생한다. 이 문제를 해결하기 위해 'FlyOutProp' 클래스 객체를 사용하여
  //       'out:fly'에서 동적으로 현재의 이동 방향에을 참조할 수 있도록 함.
  //
  // NOTE: 'out:fly'에서 'x, y'의 의미는 '현재의 위치'에서 최종적으로 '이동할 위치'를 의미한다.
  class FlyOutProp {
    get x() {
      const direction = get(_direction);
      const xOffset = _bottomPartSize.width;

      switch (direction) {
        case "left":
          return -xOffset;
        case "right":
          return xOffset;
        default:
          return 0;
      }
    }

    get y() {
      const direction = get(_direction);
      const yOffset = _bottomPartSize.height;

      switch (direction) {
        case "up":
          return -yOffset;
        case "down":
          return yOffset;
        default:
          return 0;
      }
    }

    get duration() {
      return get(_duration);
    }
  }

  return {
    calendarWidth: initialCalendarWidth,
    calendarHeight: initialCalendarHeight,

    direction: _direction,
    duration: _duration,

    flyOutProp: new FlyOutProp(),
    flyInProp: new FlyInProp(),

    flyOutroStart: (event) => {
      const direction = get(_direction);

      if (direction === "up" || direction === "down") {
        event.target.style.willChange = "top";
      } else if (direction === "left" || direction === "right") {
        event.target.style.willChange = "left";
      } else {
        // do nothing
      }
    },

    flyOutroEnd: (event) => {
      event.target.style.willChange = "auto";
    },

    // NOTE: 'in:fly' 대상인 'div'는 'display: relative'로 설정되어 있는 'block' 요소이다.
    //       'document flow'상 'out:fly' 대상인 'div'의 아래에 위치하고 있다. 'in:fly' 애니메이션의
    //       'offset'값이 정상 적용될 수 있도록 div의 위치를 미리 조정해 주어야 한다.
    flyIntroStart: (event) => {
      const style = event.target.style;
      const h = _bottomPartSize.height;
      const direction = get(_direction);

      // 'style.top = `${-h}px`;'의 의미는 'out:fly'가 적용되는 이전 'div'의 위치로
      // 'in:fly' 애니메이션을 적용한 'div'의 최종 도착 위치로 설정하기 위함이다.
      // 'in:fly' 애니메이션은 설정된 최종 도착 위치에 대한 'offset'값을 적용해서 실행된다.
      if (direction === "up" || direction === "down") {
        style.willChange = "top";
        style.top = `${-h}px`;
      } else if (direction === "left" || direction === "right") {
        style.willChange = "top, left";
        style.top = `${-h}px`;
      } else {
        // do nothing
      }
    },

    flyIntroEnd: (event) => {
      event.target.style.willChange = "auto";
      event.target.style.top = "0";
      event.target.style.left = "0";
      _direction.set("");

      if (typeof _flyEndAction === "function") {
        _flyEndAction();
      }
      _flyEndAction = null;
    },

    // NOTE: 'set flyEndAction(action)'과 같은 'setter'를 의도적으로 사용하지 않음.
    //       현재 작성된 코드 구조상 'Calendar.svelte'에서 'ctx.flyEndAction = <함수>'와 같이
    //       '대입'을 할 경우에 의도하지 않게 'createContext'를 호출하는 '스벨트 반응형 블럭'이
    //       호출되는 문제가 있다. 결과적으로 새로운 '익명 컨텍스트 객체'가 생성되어 '_flyEndAction'가
    //       'null'이 되어 버린다.
    setFlyEndAction(action) {
      _flyEndAction = action;
    },
  };
}
