chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);

  if (message.action === "startAutomation") {
    console.log("Starting LinkedIn automation...");

    chrome.tabs.query({ url: "https://www.linkedin.com/feed*" }, (tabs) => {
      if (tabs.length > 0) {
        const linkedinTab = tabs[0];
        chrome.tabs.update(linkedinTab.id, { active: true }, () => {
          setTimeout(() => {
            chrome.scripting.executeScript(
              {
                target: { tabId: linkedinTab.id },
                files: ["content.js"],
              },
              () => {
                console.log("content.js injected into existing tab");

                setTimeout(() => {
                  chrome.tabs.sendMessage(linkedinTab.id, {
                    action: "automateFeed",
                    likeCount: message.likeCount,
                    commentCount: message.commentCount,
                  });
                  console.log(" Sent automation message to content.js");
                }, 1000);
              }
            );
          }, 2000);
        });
      } else {
        chrome.tabs.create({ url: "https://www.linkedin.com/feed/" }, (tab) => {
          console.log(" New tab created with ID:", tab.id);

          const listener = (tabId, info) => {
            if (tabId === tab.id && info.status === "complete") {
              console.log(" LinkedIn feed fully loaded");

              chrome.scripting.executeScript(
                {
                  target: { tabId: tab.id },
                  files: ["content.js"],
                },
                () => {
                  console.log(" content.js injected");

                  setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, {
                      action: "automateFeed",
                      likeCount: message.likeCount,
                      commentCount: message.commentCount,
                    });
                    console.log("Sent automation message to content.js");
                  }, 2000);
                }
              );

              chrome.tabs.onUpdated.removeListener(listener);
            }
          };

          chrome.tabs.onUpdated.addListener(listener);
        });
      }
    });
  }
});
