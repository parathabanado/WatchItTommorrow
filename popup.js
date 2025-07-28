document.addEventListener('DOMContentLoaded', () => {
    const videoListContainer = document.getElementById('video-list-container');
    const clearButton = document.getElementById('clear-list-btn');

    const renderVideoList = () => {
        chrome.storage.local.get({ watchTomorrowList: [] }, (result) => {
            const videos = result.watchTomorrowList;
            videoListContainer.innerHTML = ''; 

            if (videos.length === 0) {
                videoListContainer.innerHTML = '<p class="empty-message">No videos saved for tomorrow!</p>';
                return;
            }

            videos.forEach((video) => {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';

                const thumbnailLink = document.createElement('a');
                thumbnailLink.href = video.url;
                thumbnailLink.target = '_blank';

                const thumbnail = document.createElement('img');
                thumbnail.src = video.thumbnail;
                thumbnail.className = 'video-thumbnail';
                thumbnailLink.appendChild(thumbnail);

                const videoInfo = document.createElement('div');
                videoInfo.className = 'video-info';

                const link = document.createElement('a');
                link.href = video.url;
                link.target = '_blank';
                link.className = 'video-title';
                link.textContent = video.title;

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.innerHTML = '&times;'; 
                deleteButton.title = 'Remove video';
                
                deleteButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    chrome.runtime.sendMessage({ type: 'DELETE_VIDEO', url: video.url }, (response) => {
                        if (response.status === 'success') {
                            videoItem.remove();
                            if (videoListContainer.children.length === 0) {
                                videoListContainer.innerHTML = '<p class="empty-message">No videos saved for tomorrow!</p>';
                            }
                        }
                    });
                });

                videoInfo.appendChild(link);
                videoItem.appendChild(thumbnailLink);
                videoItem.appendChild(videoInfo);
                videoItem.appendChild(deleteButton); 
                videoListContainer.appendChild(videoItem);
            });
        });
    };

    clearButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'CLEAR_LIST' }, (response) => {
            if (response.status === 'success') {
                renderVideoList(); 
            }
        });
    });

    renderVideoList();
});