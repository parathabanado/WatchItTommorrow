const saveVideo = (videoData, callback) => { 
  chrome.storage.local.get({ watchTomorrowList: [] }, (result) => {
    const list = result.watchTomorrowList;
    
    const isAlreadyAdded = list.some(video => video.url === videoData.url);
    if (!isAlreadyAdded) {
      list.push(videoData);
      chrome.storage.local.set({ watchTomorrowList: list }, () => {
        console.log('Video saved:', videoData.title);
        if (callback) callback(); 
      });
    } else {
      if (callback) callback(); 
    }
  });
};

async function fetchVideoData(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const titleMatch = text.match(/<title>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'YouTube Video';
    const thumbMatch = text.match(/<meta property="og:image" content="(.*?)">/);
    const thumbnail = thumbMatch ? thumbMatch[1] : 'icons/icon128.svg';
    return { url, title, thumbnail };
  } catch (error) {
    console.error('Failed to fetch video data:', error);
    return null;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "watchTomorrow",
    title: "Watch Tomorrow",
    contexts: ["link"],
    targetUrlPatterns: ["*://www.youtube.com/watch?v=*"]
  });
  chrome.storage.local.get(['watchTomorrowList'], (result) => {
    if (!result.watchTomorrowList) {
      chrome.storage.local.set({ watchTomorrowList: [] });
    }
  });
  chrome.storage.sync.get(['pauseDuration'], (result) => {
    if (result.pauseDuration === undefined || result.pauseDuration < 27) {
      chrome.storage.sync.set({ pauseDuration: 27 });
    }
  });
  console.log("YouTube Procrastinator extension installed/updated.");
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "watchTomorrow" && info.linkUrl) {
    const videoData = await fetchVideoData(info.linkUrl);
    if (videoData) {
      saveVideo(videoData); 
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_VIDEO') {
    saveVideo(message.videoData, () => {
      chrome.tabs.update(sender.tab.id, { url: 'https://www.youtube.com' });
    });
    return true;
  }
  
  if (message.type === 'DELETE_VIDEO') {
    chrome.storage.local.get({ watchTomorrowList: [] }, (result) => {
      let list = result.watchTomorrowList;
      list = list.filter(video => video.url !== message.url);
      chrome.storage.local.set({ watchTomorrowList: list }, () => {
        console.log('Video deleted:', message.url);
        sendResponse({ status: 'success' });
      });
    });
    return true;
  }

  if (message.type === 'CLEAR_LIST') {
    chrome.storage.local.set({ watchTomorrowList: [] }, () => {
      console.log('Watch Tomorrow list cleared.');
      sendResponse({ status: 'success', message: 'List cleared!' });
    });
    return true;
  }
});
