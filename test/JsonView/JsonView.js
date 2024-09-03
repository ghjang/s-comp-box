import JsonView from "/build/dev/default/JsonView.js";

const jsonData1 = {
  floorId: "0c64f340-5b62-4ce7-97a8-e691e38e83fd",
  ancestorFloorId: "ac012243-b45c-4161-af26-97207d021385",
  childComponentInfo: {
    customElementName: "null",
    floorId: "0c64f340-5b62-4ce7-97a8-e691e38e83fd",
  },
  nonFloorParentInfo: {
    ancestorFloorId: "ac012243-b45c-4161-af26-97207d021385",
    containerName: "Tab",
    ensureTabVisible: "removed: ensureTabVisible",
    tabIndex: 9,
    tabLength: 10,
  },
};

const jsonView1 = new JsonView({
  target: document.getElementById("container1"),
  props: {
    jsonData: jsonData1,
    openChildren: true,
  },
});

const jsonData2 = {
  name: "테스트 데이터",
  numbers: [1, 2, 3, 4, 5],
  mixedArray: ["문자열", 42, { key: "값" }, [1, 2, 3]],
  객체배열: [
    { id: 1, name: "항목 1" },
    { id: 2, name: "항목 2" },
    { id: 3, name: "항목 3" },
  ],
};

const jsonView2 = new JsonView({
  target: document.getElementById("container2"),
  props: {
    jsonData: jsonData2,
    openChildren: true,
  },
});

window.addEventListener("beforeunload", () => {
  jsonView1?.$destroy();
  jsonView2?.$destroy();
});
