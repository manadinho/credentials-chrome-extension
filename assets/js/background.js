let plateforms = [];

chrome.storage.sync.get(["credentials"], function (result) {
  if (result.credentials) {
    const credentials = JSON.parse(result.credentials);
    console.log(credentials);
    if (credentials) {
      for (let cred of credentials) {
        plateforms = [...plateforms, cred.plateform.url];
      }
    }
    console.log(plateforms);
  }
});

// chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//   console.log(tabs[0].url);
//   if (plateforms.includes(tabs[0].url)) {
//     console.log("url matched");
//   }
// });

chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (plateforms.includes(details.url)) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { message: "url matched" },
          function (response) {
            console.log(response);
          }
        );
      });
      console.log("url matched");
    }
  },
  { urls: ["<all_urls>"] }
);
