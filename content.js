const createMindfulPause = () => {
  const existingOverlay = document.querySelector('.mindful-pause-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  chrome.storage.sync.get({ pauseDuration: 27 }, (result) => {
    let duration = result.pauseDuration;
    if (duration < 27) {
        duration = 27;
    }
    const initialDuration = duration;

    const video = document.querySelector('video.html5-main-video');
    if (!video) return;

    const overlay = document.createElement('div');
    overlay.className = 'mindful-pause-overlay';

    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';
    
    const countdownText = document.createElement('p');
    countdownText.innerText = `Mindful Pause: Video plays in ${duration}...`;
    textContainer.appendChild(countdownText);
    overlay.appendChild(textContainer);

    const videoContainer = document.querySelector('#movie_player');
    if (videoContainer) {
      videoContainer.appendChild(overlay);

      if (initialDuration > 8) {
        setTimeout(() => {
          if (!document.querySelector('.mindful-pause-overlay')) return;

          const tomorrowButton = document.createElement('button');
          tomorrowButton.innerText = 'Watch it Tomorrow?';
          tomorrowButton.className = 'watch-tomorrow-overlay-btn';
          
          tomorrowButton.addEventListener('click', () => {
            let thumbnailUrl = '';
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const videoId = urlParams.get('v');
                if (videoId) {
                    thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                } else {
                    thumbnailUrl = document.querySelector('meta[property="og:image"]')?.content || '';
                }
            } catch (e) {
                thumbnailUrl = document.querySelector('meta[property="og:image"]')?.content || '';
            }

            const videoData = {
              url: window.location.href,
              title: document.title.replace(' - YouTube', ''),
              thumbnail: thumbnailUrl
            };
            
            chrome.runtime.sendMessage({ type: 'SAVE_VIDEO', videoData });

            tomorrowButton.innerText = 'Saving...';
            tomorrowButton.disabled = true;
          });
          
          textContainer.appendChild(tomorrowButton);
        }, 8000);
      }

      video.pause();
      const pauseGuardInterval = setInterval(() => {
        if (!video.paused) {
          video.pause();
        }
      }, 50);

      const countdownInterval = setInterval(() => {
        duration--;
        if (duration > 0) {
          countdownText.innerText = `Mindful Pause: Video plays in ${duration}...`;
        } else {
          clearInterval(countdownInterval);
          clearInterval(pauseGuardInterval);
          if (overlay.parentNode) {
            overlay.remove();
          }
          video.play();
        }
      }, 1000);
    }
  });
};

const initializePauseFeature = () => {
  if (window.location.href.includes('/watch')) {
    const videoReadyCheck = setInterval(() => {
      const video = document.querySelector('video.html5-main-video');
      if (video && video.readyState >= 1) {
        clearInterval(videoReadyCheck);
        createMindfulPause();
      }
    }, 100);
  }
};

document.body.addEventListener('yt-navigate-finish', () => {
  initializePauseFeature();
});
initializePauseFeature();