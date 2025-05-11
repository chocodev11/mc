document.addEventListener('DOMContentLoaded', async () => {
    const serverAddress = 'sever1000day.aternos.me:39576'; // Địa chỉ server cố định
    const statusResultDiv = document.getElementById('statusResult');

    statusResultDiv.innerHTML = '<p class="loading-message">Đang tải trạng thái server...</p>';

    try {
        const apiUrl = `https://api.mcsrvstat.us/3/${serverAddress}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.online) {
            let iconHtml = '';
            if (data.icon) {
                iconHtml = `<img src="${data.icon}" alt="Server Icon">`;
            } else {
                // Icon mặc định nếu không có icon từ API (ví dụ: icon của Aternos)
                iconHtml = `<img src="https://aternos.org/img/favicon/apple-touch-icon.png" alt="Default Server Icon">`;
            }

            let motdHtml = '';
            if (data.motd && data.motd.html) {
                // Sử dụng motd.html để giữ màu sắc, mỗi dòng MOTD là một <p>
                motdHtml = data.motd.html.map(line => `<p>${line}</p>`).join('');
            } else if (data.motd && data.motd.clean) {
                motdHtml = data.motd.clean.map(line => `<p>${line}</p>`).join('');
            } else {
                motdHtml = '<p>Không có MOTD.</p>';
            }

            let versionInfo = '';
            if (data.version) {
                versionInfo = data.version;
            } else if (data.protocol && data.protocol.name) {
                versionInfo = data.protocol.name;
            } else {
                versionInfo = 'N/A';
            }

            let playersCount = '';
            if (data.players) {
                playersCount = `<span class="online">${data.players.online}</span> / ${data.players.max}`;
            } else {
                playersCount = 'N/A';
            }

           

            // Tạo cấu trúc HTML dựa trên ảnh mẫu
            statusResultDiv.innerHTML = `
                ${iconHtml}
                <div class="server-info-text">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                        <div style="flex-grow: 1;">${motdHtml}</div>
                        <div class="player-count">${playersCount}</div>
                    </div>
                    
                    ${(data.players && data.players.list && data.players.list.length > 0) ? 
                        `<p class="player-list" style="font-size: 0.8em; margin-top: 5px;">Người chơi: ${data.players.list.map(p => p.name).join(', ')}</p>` : ''
                    }
                    ${data.software ? `<p style="font-size: 0.8em;">Phần mềm: ${data.software}</p>` : ''}
                    ${data.map && data.map.clean ? `<p style="font-size: 0.8em;">Map: ${data.map.clean}</p>` : ''}
                    ${(data.plugins && data.plugins.length > 0) ? 
                        `<p style="font-size: 0.8em;">Plugins: ${data.plugins.map(p => `${p.name} (${p.version || 'N/A'})`).join(', ')}</p>` : ''
                    }
                    ${(data.mods && data.mods.length > 0) ? 
                        `<p style="font-size: 0.8em;">Mods: ${data.mods.map(m => `${m.name} (${m.version || 'N/A'})`).join(', ')}</p>` : ''
                    }
                    ${(data.info && data.info.clean && data.info.clean.length > 0) ? 
                        `<p style="font-size: 0.8em;">Thông tin thêm: <br>${data.info.clean.join('<br>')}</p>` : ''
                    }
                </div>
            `;

        } else {
            statusResultDiv.innerHTML = `
                <div class="server-offline-message">
                    <p class="offline">Server hiện đang offline.</p>
                    <p class="offline-reason">Lý do: ${data.offline_reason || 'Không thể kết nối hoặc server không tồn tại.'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Lỗi khi lấy trạng thái server:', error);
        statusResultDiv.innerHTML = '<p class="offline">Đã xảy ra lỗi khi kiểm tra trạng thái server. Vui lòng thử lại sau.</p>';
    }
});