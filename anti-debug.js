// ============================================================
// 🚫 ЗАЩИТА ОТ КОНСОЛИ (F12, очистка, блокировка методов)
// ============================================================

// 1. Блокировка клавиш F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener('keydown', function(e) {
    const key = e.key;
    if (key === 'F12') {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.shiftKey && (key === 'I' || key === 'J' || key === 'i' || key === 'j')) {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && (key === 'U' || key === 'u')) {
        e.preventDefault();
        return false;
    }
});

// 2. Блокировка правой кнопки мыши (контекстное меню)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 3. "Убиваем" все методы console, чтобы они ничего не выводили
if (window.console) {
    const noop = function() {};
    const methods = ['log','warn','error','info','debug','table','group','groupEnd','dir','trace','assert','count','countReset','time','timeEnd'];
    methods.forEach(function(m) {
        if (console[m]) console[m] = noop;
    });
}

// 4. Автоматическая очистка консоли каждые 500 мс (если кто-то всё же открыл)
setInterval(function() {
    if (window.console) {
        console.clear();
    }
}, 500);

// 5. Детектор открытой консоли (по времени выполнения) – если открыта, перезагружаем страницу
(function detectConsole() {
    function check() {
        const start = performance.now();
        // Выполняем простую операцию
        for (let i = 0; i < 100000; i++) {
            Math.sqrt(i);
        }
        const end = performance.now();
        // Если время выполнения > 100 мс, вероятно, консоль открыта
        if (end - start > 100) {
            // Можно либо перезагрузить страницу, либо показать сообщение
            // alert('Консоль открыта! Пожалуйста, закройте её.');
            // Перезагружаем страницу, чтобы сбросить попытку отладки
            window.location.reload();
        }
    }
    // Запускаем проверку каждые 3 секунды
    setInterval(check, 3000);
})();

console.log('Защита от консоли активирована!');
