// ===== protection.js =====
// Вся защита от накруток: IP + VPN + блокировка через localStorage

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
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,isp,org`);
        const data = await response.json();
        if (data.status === 'success') {
            // Разрешённые страны (можно менять под себя)
            const allowedCountries = ['RU','BY','KZ','UA','AM','AZ','GE','MD','TJ','TM','UZ','KG'];
            if (!allowedCountries.includes(data.countryCode)) return true;
            // Ключевые слова для определения VPN/прокси/хостинга
            const keywords = ['vpn','proxy','hosting','cloud','server','dedicated','vps','aws','digitalocean','linode','vultr','hetzner','ovh'];
            const org = (data.org || '').toLowerCase();
            const isp = (data.isp || '').toLowerCase();
            if (keywords.some(k => org.includes(k) || isp.includes(k))) return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

// Основная проверка: IP + VPN + уже подписан?
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

// Заблокировать IP (сохранить в localStorage)
function blockIP(ip) {
    if (ip) {
        const blocked = JSON.parse(localStorage.getItem('blockedIPs') || '[]');
        if (!blocked.includes(ip)) {
            blocked.push(ip);
            localStorage.setItem('blockedIPs', JSON.stringify(blocked));
        }
    }
}

// Обработчик кнопки "Подписаться" – привязать к глобальному объекту
function setupSubscribeButton() {
    const btn = document.getElementById('openSubscribeBtn');
    if (!btn) return;
    btn.addEventListener('click', async function() {
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
        // Открываем оверлей подписки (функция из основного скрипта)
        if (typeof openOverlay === 'function') {
            openOverlay('subscribeOverlay');
        }
        // Сбрасываем статус подписки
        const statusEl = document.getElementById('subscribeStatus');
        if (statusEl) statusEl.style.display = 'none';
        // Запоминаем IP для последующей блокировки после успешной подписки
        window._currentIP = result.ip;
    });
}

// Прослушиваем загрузку iframe, чтобы перехватить успешную подписку
function setupIframeListener() {
    const iframe = document.getElementById('subscribeIframe');
    if (!iframe) return;
    iframe.addEventListener('load', function() {
        try {
            const url = iframe.contentWindow.location.href;
            if (url.includes('msndr.net') && url.includes('success')) {
                if (window._currentIP) blockIP(window._currentIP);
                const statusEl = document.getElementById('subscribeStatus');
                if (statusEl) {
                    statusEl.style.display = 'block';
                    statusEl.style.background = 'rgba(40,167,69,0.2)';
                    statusEl.style.color = '#7ddf8a';
                    statusEl.style.border = '1px solid #28a745';
                    statusEl.textContent = '✅ Вы успешно подписались! Проверьте почту для подтверждения.';
                }
            }
        } catch(e) {
            // если не удалось прочитать URL (CORS) – игнорируем
        }
    });
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    setupSubscribeButton();
    setupIframeListener();
});
