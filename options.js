const saveOptions = () => {
  let duration = document.getElementById('pause-duration').value;
  let durationInt = parseInt(duration, 10);

  if (isNaN(durationInt) || durationInt < 27) {
    durationInt = 27;
    document.getElementById('pause-duration').value = durationInt; 
  }
  
  chrome.storage.sync.set(
    { pauseDuration: durationInt },
    () => {
      const status = document.getElementById('status-message');
      status.textContent = 'Options saved.';
      status.style.opacity = 1;
      setTimeout(() => {
        status.style.opacity = 0;
      }, 2000);
    }
  );
};

const restoreOptions = () => {
  chrome.storage.sync.get(
    { pauseDuration: 27 },
    (items) => {
      document.getElementById('pause-duration').value = items.pauseDuration;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-btn').addEventListener('click', saveOptions);