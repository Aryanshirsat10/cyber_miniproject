document.getElementById("scan").addEventListener("click", async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.runtime.sendMessage({ action: "scan", url: activeTab.url }, (response) => {
          alert(response.message);
        });
      }
    });
  });