// ============================================================
// 📱 МОБИЛЬНАЯ АДАПТАЦИЯ (Blazing Blocks Studio)
// ============================================================
(function() {
    // 1. Отключаем кастомный курсор на touch-устройствах
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        const cursor = document.getElementById('custom-cursor');
        if (cursor) cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
        // Также убираем cursor: none у всех элементов
        document.querySelectorAll('.btn, .file-btn, .overlay-close, a, button').forEach(el => {
            el.style.cursor = 'pointer';
        });
    }

    // 2. Функция подстройки под экран
    function adjustLayout() {
        const w = window.innerWidth;
        const container = document.querySelector('.container');
        if (!container) return;

        // Для маленьких экранов уменьшаем отступы
        if (w < 480) {
            container.style.padding = '4px 2px';
            // Уменьшаем gap у кнопок
            const links = document.querySelector('.links');
            if (links) links.style.gap = '6px';
            // Уменьшаем отступы у кнопок
            document.querySelectorAll('.btn').forEach(btn => {
                btn.style.padding = '10px 4px';
                btn.style.minHeight = '40px';
                btn.style.fontSize = '0.8rem';
            });
        } else if (w < 768) {
            container.style.padding = '8px 4px';
            const links = document.querySelector('.links');
            if (links) links.style.gap = '8px';
            document.querySelectorAll('.btn').forEach(btn => {
                btn.style.padding = '12px 6px';
                btn.style.minHeight = '44px';
                btn.style.fontSize = '0.9rem';
            });
        } else {
            // Возвращаем стандартные стили (они уже заданы в CSS)
            container.style.padding = '';
            const links = document.querySelector('.links');
            if (links) links.style.gap = '';
            document.querySelectorAll('.btn').forEach(btn => {
                btn.style.padding = '';
                btn.style.minHeight = '';
                btn.style.fontSize = '';
            });
        }
    }

    // 3. Запускаем при загрузке и при изменении размера
    window.addEventListener('load', adjustLayout);
    window.addEventListener('resize', adjustLayout);
    window.addEventListener('orientationchange', function() {
        setTimeout(adjustLayout, 300);
    });

    // 4. Дополнительно: если на телефоне контент не влезает, уменьшаем 3D-куб
    function adjustThreeContainer() {
        const threeContainer = document.getElementById('three-container');
        if (!threeContainer) return;
        const w = window.innerWidth;
        if (w < 480) {
            threeContainer.style.width = '80px';
            threeContainer.style.height = '80px';
        } else if (w < 768) {
            threeContainer.style.width = '110px';
            threeContainer.style.height = '110px';
        } else {
            threeContainer.style.width = '';
            threeContainer.style.height = '';
        }
    }
    window.addEventListener('load', adjustThreeContainer);
    window.addEventListener('resize', adjustThreeContainer);
})();
