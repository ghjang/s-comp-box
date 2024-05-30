chrome.action.onClicked.addListener((tab) => {
    const url = chrome.runtime.getURL('test/s-comp.treeview.html');
    chrome.tabs.create({ url });
});
