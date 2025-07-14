document.addEventListener('DOMContentLoaded', () => {
    const serverAddress = 'newgenmc.asia:25565';
    const statusResultDiv = document.getElementById('statusResult');
    const refreshButton = document.getElementById('refreshButton');
    const faviconLink = document.getElementById('faviconLink');

    async function fetchServerStatus() {
        statusResultDiv.style.transition = 'max-height 0.5s ease-in-out, opacity 0.5s ease-in-out';
        statusResultDiv.style.overflow = 'hidden';

        statusResultDiv.style.maxHeight = '50px';
        statusResultDiv.style.opacity = '1';
        statusResultDiv.innerHTML = '<p class="loading-message">Đang tải trạng thái server...</p>';

        try {
            const timestamp = new Date().getTime();
            const apiUrl = `https://api.mcsrvstat.us/3/${serverAddress}?_=${timestamp}`;
            
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            statusResultDiv.style.opacity = '0';
            statusResultDiv.style.maxHeight = '0px';

            setTimeout(() => {
                if (data.online) {
                    let iconHtml = '';
                    if (data.icon) {
                        iconHtml = `<img src="${data.icon}" alt="Server Icon" class="server-icon">`;
                        if (faviconLink) {
                            faviconLink.href = data.icon;
                        }
                    } else {
                        iconHtml = `<img src="https://placehold.co/80x80/cccccc/333333?text=MC" alt="Default Server Icon" class="server-icon">`;
                        if (faviconLink) {
                            faviconLink.href = "https://placehold.co/32x32/cccccc/333333?text=MC";
                        }
                    }

                    let motdHtml = '';
                    if (data.motd && data.motd.html) {
                        motdHtml = data.motd.html.map(line => `<p class="motd-line">${line}</p>`).join('');
                    } else if (data.motd && data.motd.clean) {
                        motdHtml = data.motd.clean.map(line => `<p class="motd-line">${line}</p>`).join('');
                    } else {
                        motdHtml = '<p class="motd-line">Không có MOTD.</p>';
                    }

                    let versionInfo = data.version || (data.protocol && data.protocol.name) || 'N/A';
                    let playersCount = `${data.players.online || '0'} / ${data.players.max || '0'}`;

                    statusResultDiv.innerHTML = `
                        ${iconHtml}
                        <div class="server-info-text">
                            <div class="flex justify-between items-start w-full mb-2">
                                <div class="flex-grow">${motdHtml}</div>
                                <div class="player-count">
                                    <span class="online-players">${data.players.online || '0'}</span> / ${data.players.max || '0'}
                                </div>
                            </div>
                            <p class="detail-info"><strong>Phiên bản:</strong> ${versionInfo}</p>
                            ${(data.software) ? `<p class="detail-info"><strong>Phần mềm:</strong> ${data.software}</p>` : ''}
                            ${(data.map && data.map.clean) ? `<p class="detail-info"><strong>Map:</strong> ${data.map.clean}</p>` : ''}
                            ${(data.plugins && data.plugins.length > 0) ?
                                `<p class="detail-info"><strong>Plugins:</strong> ${data.plugins.map(p => `${p.name} (${p.version || 'N/A'})`).join(', ')}</p>` : ''
                            }
                            ${(data.mods && data.mods.length > 0) ?
                                `<p class="detail-info"><strong>Mods:</strong> ${data.mods.map(m => `${m.name} (${m.version || 'N/A'})`).join(', ')}</p>` : ''
                            }
                            ${(data.info && data.info.clean && data.info.clean.length > 0) ?
                                `<p class="detail-info"><strong>Thông tin thêm:</strong> <br>${data.info.clean.join('<br>')}</p>` : ''
                            }
                            ${(data.players && data.players.list && data.players.list.length > 0) ?
                                `<p class="detail-info"><strong>Người chơi online:</strong> ${data.players.list.map(p => p.name).join(', ')}</p>` : ''
                            }
                        </div>
                    `;
                    statusResultDiv.style.maxHeight = '1000px';
                    statusResultDiv.style.opacity = '1';

                } else {
                    statusResultDiv.innerHTML = `
                        <div class="server-offline-message">
                            <p class="offline-message">Server hiện đang offline.</p>
                            <p class="offline-reason">Lý do: ${data.offline_reason || data.debug?.error?.query || 'Không thể kết nối hoặc server không tồn tại.'}</p>
                        </div>
                    `;
                    if (faviconLink) {
                        faviconLink.href = "https://placehold.co/32x32/cccccc/333333?text=MC";
                    }
                    statusResultDiv.style.maxHeight = '200px';
                    statusResultDiv.style.opacity = '1';
                }
            }, 500);

        } catch (error) {
            console.error('Lỗi khi lấy trạng thái server:', error);
            statusResultDiv.style.opacity = '0';
            statusResultDiv.style.maxHeight = '0px';

            setTimeout(() => {
                statusResultDiv.innerHTML = '<p class="offline-message">Đã xảy ra lỗi khi kiểm tra trạng thái server. Vui lòng thử lại sau.</p>';
                if (faviconLink) {
                    faviconLink.href = "https://placehold.co/32x32/cccccc/333333?text=MC";
                }
                statusResultDiv.style.maxHeight = '200px';
                statusResultDiv.style.opacity = '1';
            }, 500);
        }
    }

    fetchServerStatus();

    let refreshInterval = setInterval(fetchServerStatus, 30000);

    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            clearInterval(refreshInterval);
            fetchServerStatus();
            refreshInterval = setInterval(fetchServerStatus, 30000);
        });
    } else {
        console.warn("Element with ID 'refreshButton' not found. Manual refresh button will not work.");
    }
});
