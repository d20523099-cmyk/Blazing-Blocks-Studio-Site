// ============================================================
// 🔐 ЗАЩИТА ОТ НАКРУТОК (IP + VPN + БЛОКИРОВКА)
// ============================================================

// Получить IP пользователя
function getIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(d => d.ip)
        .catch(() => null);
}

// Проверить, не использует ли пользователь VPN/прокси/хостинг
async function checkVPN(ip) {
    if (!ip) return false;
    try {
        const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,countryCode,isp,org`);
        const data = await response.json();
        if (data.status === 'success') {
            const allowedCountries = ['RU','BY','KZ','UA','AM','AZ','GE','MD','TJ','TM','UZ','KG'];
            if (!allowedCountries.includes(data.countryCode)) {
                return true;
            }
            const keywords = ['vpn','proxy','hosting','cloud','server','dedicated','vps','aws','digitalocean','linode','vultr','hetzner','ovh'];
            const org = (data.org || '').toLowerCase();
            const isp = (data.isp || '').toLowerCase();
            if (keywords.some(k => org.includes(k) || isp.includes(k))) {
                return true;
            }
        }
        return false;
    } catch (e) {
        console.warn('Ошибка проверки VPN:', e);
        return false;
    }
}

async function checkIP() {
    const ip = await getIP();
    if (!ip) return { allowed: true, ip: null };
    const blocked = JSON.parse(localStorage.getItem('blockedIPs') || '[]');
    if (blocked.includes(ip)) {
        return { allowed: false, reason: 'already_subscribed', ip };
    }
    const isVPN = await checkVPN(ip);
    if (isVPN) {
        return { allowed: false, reason: 'vpn_detected', ip };
    }
    return { allowed: true, ip };
}

function blockIP(ip) {
    if (ip) {
        const blocked = JSON.parse(localStorage.getItem('blockedIPs') || '[]');
        if (!blocked.includes(ip)) {
            blocked.push(ip);
            localStorage.setItem('blockedIPs', JSON.stringify(blocked));
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const subscribeBtn = document.getElementById('openSubscribeBtn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const result = await checkIP();
            if (!result.allowed) {
                if (result.reason === 'already_subscribed') {
                    alert('✅ Вы уже подписаны на новости! Спасибо.');
                } else if (result.reason === 'vpn_detected') {
                    alert('⛔ Подписка с VPN/прокси запрещена. Отключите VPN и попробуйте снова.');
                } else {
                    alert('❌ Не удалось проверить IP. Попробуйте позже.');
                }
                return;
            }
            if (typeof openOverlay === 'function') {
                openOverlay('subscribeOverlay');
            } else {
                console.error('openOverlay не определена');
                return;
            }
            const statusEl = document.getElementById('subscribeStatus');
            if (statusEl) statusEl.style.display = 'none';
            window._currentIP = result.ip;
        });
    } else {
        console.error('Кнопка подписки не найдена');
    }

    const iframe = document.getElementById('subscribeIframe');
    if (iframe) {
        iframe.addEventListener('load', function() {
            try {
                const url = iframe.contentWindow.location.href;
                if (url.includes('msndr.net') && url.includes('success')) {
                    if (window._currentIP) {
                        blockIP(window._currentIP);
                    }
                    const statusEl = document.getElementById('subscribeStatus');
                    if (statusEl) {
                        statusEl.style.display = 'block';
                        statusEl.style.background = 'rgba(40,167,69,0.2)';
                        statusEl.style.color = '#7ddf8a';
                        statusEl.style.border = '1px solid #28a745';
                        statusEl.textContent = '✅ Вы успешно подписались! Проверьте почту для подтверждения.';
                    }
                }
            } catch(e) {}
        });
    } else {
        console.error('iframe подписки не найден');
    }
});
