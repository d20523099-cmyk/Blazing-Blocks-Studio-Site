// ============================================================
// 🔐 УСИЛЕННАЯ ЗАЩИТА (IP + VPN + прокси + хостинг)
// ============================================================

// Получить IP
function getIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(d => d.ip)
        .catch(() => null);
}

// Проверка VPN/прокси/хостинга через ip-api.com с полями proxy и hosting
async function checkVPN(ip) {
    if (!ip) return false;
    try {
        // Запрашиваем поля: status, countryCode, isp, org, proxy, hosting
        const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,countryCode,isp,org,proxy,hosting`);
        const data = await response.json();
        if (data.status === 'success') {
            // 1. Проверка страны: разрешены только страны СНГ и ближнего зарубежья
            const allowedCountries = ['RU','BY','KZ','UA','AM','AZ','GE','MD','TJ','TM','UZ','KG'];
            if (!allowedCountries.includes(data.countryCode)) {
                console.warn('Страна не разрешена:', data.countryCode);
                return true; // блокируем
            }
            // 2. Проверка прокси и хостинга (прямые флаги от ip-api)
            if (data.proxy === true || data.hosting === true) {
                console.warn('Обнаружен proxy или hosting');
                return true;
            }
            // 3. Проверка по ключевым словам в провайдере
            const keywords = ['vpn','proxy','hosting','cloud','server','dedicated','vps','aws','digitalocean','linode','vultr','hetzner','ovh','m247','datacenter'];
            const org = (data.org || '').toLowerCase();
            const isp = (data.isp || '').toLowerCase();
            if (keywords.some(k => org.includes(k) || isp.includes(k))) {
                console.warn('Обнаружен VPN/прокси по провайдеру');
                return true;
            }
        }
        return false;
    } catch (e) {
        console.warn('Ошибка проверки VPN:', e);
        // В случае ошибки разрешаем (чтобы не ломать)
        return false;
    }
}

// Основная проверка
async function checkIP() {
    const ip = await getIP();
    if (!ip) {
        // Если IP не определён, разрешаем (но можно и блокировать)
        return { allowed: true, ip: null };
    }
    // Проверяем, не подписывался ли уже этот IP
    const blocked = JSON.parse(localStorage.getItem('blockedIPs') || '[]');
    if (blocked.includes(ip)) {
        return { allowed: false, reason: 'already_subscribed', ip };
    }
    // Проверяем VPN/прокси
    const isVPN = await checkVPN(ip);
    if (isVPN) {
        return { allowed: false, reason: 'vpn_detected', ip };
    }
    return { allowed: true, ip };
}

// Блокировка IP в localStorage
function blockIP(ip) {
    if (ip) {
        const blocked = JSON.parse(localStorage.getItem('blockedIPs') || '[]');
        if (!blocked.includes(ip)) {
            blocked.push(ip);
            localStorage.setItem('blockedIPs', JSON.stringify(blocked));
        }
    }
}

// Обработчик кнопки подписки
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
                    alert('⛔ Подписка с VPN/прокси или из неразрешённой страны запрещена. Отключите VPN и попробуйте снова.');
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

    // Отслеживание успешной подписки через iframe
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
