import Calendar from "/build/dev/default/Calendar.js";

const calendar = new Calendar({
  target: document.getElementById("container"),
  props: {
    targetDate: new Date(),
    autoSelectTargetDay: true,
    autoFocusTargetDay: true,

    disableAnimation: false,
    animationDuration: 600,
  },
});

calendar.$on("dateSelected", (event) => {
  console.log("dateSelected", event.detail);
});

window.addEventListener("beforeunload", () => calendar?.$destroy());
