import ListView from "/build/dev/default/ListView.js";

const listView = new ListView({
  target: document.getElementById("container"),
  props: {
    store: {
      dbName: "SCompBox",
      dbVersion: 1,
      storeName: "floors",
    },
  },
});

window.addEventListener("beforeunload", () => listView?.$destroy());
