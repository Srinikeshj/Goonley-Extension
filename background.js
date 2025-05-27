let extensionWindowId = null;

chrome.action.onClicked.addListener(createExtensionWindow);
chrome.runtime.onInstalled.addListener(createExtensionWindow);

function createExtensionWindow() {
  if (extensionWindowId) {
    chrome.windows.get(extensionWindowId, {}, (window) => {
      if (chrome.runtime.lastError || !window) {
        // Window doesn't exist, create new one
        createNewWindow();
      } else {
        // Window exists, focus it
        chrome.windows.update(extensionWindowId, { focused: true });
      }
    });
  } else {
    createNewWindow();
  }
}

function createNewWindow() {
  chrome.windows.create({
    url: "index.html",
    type: "popup",
    width: 350,
    height: 350,
    left: 100,
    top: 10,
    focused: true
  }, (window) => {
    extensionWindowId = window.id;
  });
}

// Try to make window always on top (works best on Windows/Linux, but not guaranteed)
function makeWindowAlwaysOnTop(windowId) {
  chrome.windows.update(windowId, {
    drawAttention: true,
    focused: true
  });
}