chrome.runtime.onInstalled.addListener(() => {
  console.log("Malicious Website Checker installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendUrlToWebsite') {
    setUrlToCheck(message.urlToCheck);
    console.log('URL to check:', message.urlToCheck);
  }
});
