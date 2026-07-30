// ============================================================
// 📊 ДАННЫЕ
// ============================================================
const statsData = [
    { label: 'Подписчиков в Telegram', value: 120, link: 'https://t.me/BlazingBlocksStudio', linkText: 'Перейти в канал' },
    { label: 'Подписчиков в TikTok', value: 85, link: 'https://www.tiktok.com/@blazing.blocks.studio', linkText: 'Перейти в TikTok' }
];
const projects = [
    { name: 'Samurai Clicker', progress: 99 },
    { name: 'Новый секретный проект', progress: 2 },
    { name: 'Майнкрафт пак', progress: 0 },
    { name: 'Визуальная новела', progress: 4 }
];

// ============================================================
// 🚀 ГАРАЖ
// ============================================================
function openGarageDoor() {
    const door = document.getElementById('garageDoor');
    if (!door) return;
    door.classList.add('open');
    setTimeout(() => {
        door.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 1900);
}
window.addEventListener('load', () => {
    setTimeout(openGarageDoor, 300);
});

// ============================================================
// ⭐ ЗВЁЗДЫ
// ============================================================
(function initStarfield() {
    const canvas = document.getElementById('starfieldCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const stars = [];
    const numStars = 150;
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        generateStars();
    }

    function generateStars() {
        stars.length = 0;
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 0.8 + Math.random() * 2.5,
                speed: 0.3 + Math.random() * 0.9,
                brightness: 0.5 + Math.random() * 0.5,
                twinkleSpeed: 0.02 + Math.random() * 0.04,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / w - 0.5) * 2;
        targetY = (e.clientY / h - 0.5) * 2;
    });
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (touch) {
            targetX = (touch.clientX / w - 0.5) * 2;
            targetY = (touch.clientY / h - 0.5) * 2;
        }
    }, { passive: true });
    document.addEventListener('touchstart', () => { targetX = 0; targetY = 0; }, { passive: true });

    function draw() {
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;
        ctx.clearRect(0, 0, w, h);

        for (let star of stars) {
            star.y -= star.speed * 0.6;
            if (star.y < 0) {
                star.y = h + Math.random() * 20;
                star.x = Math.random() * w;
            }
            const ox = currentX * 15 * (star.speed / 1.2);
            const oy = currentY * 10 * (star.speed / 1.2);
            const twinkle = Math.sin(performance.now() * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            const alpha = star.brightness * twinkle;
            ctx.beginPath();
            ctx.arc(star.x + ox, star.y + oy, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 220, ${alpha})`;
            ctx.shadowColor = 'rgba(255, 220, 180, 0.2)';
            ctx.shadowBlur = 8;
            ctx.fill();
        }
        for (let i = 0; i < 3; i++) {
            const px = (0.15 + i * 0.35) * w + currentX * 20;
            const py = (0.2 + i * 0.25) * h + currentY * 20;
            const grad = ctx.createRadialGradient(px, py, 0, px, py, 120 + Math.abs(currentX) * 10);
            grad.addColorStop(0, 'rgba(255, 180, 130, 0.04)');
            grad.addColorStop(1, 'rgba(255, 180, 130, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(px - 150, py - 150, 300, 300);
        }
        requestAnimationFrame(draw);
    }
    resize();
    draw();
})();

// ============================================================
// 📈 АНИМАЦИЯ ЧИСЕЛ
// ============================================================
function animateNumber(element, target, duration = 1000, suffix = '') {
    const start = 0;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        element.textContent = current + suffix;
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target + suffix;
        }
    }
    requestAnimationFrame(update);
}

// ============================================================
// 📊 РЕНДЕРИНГ ПРОГРЕССА
// ============================================================
function renderProgress() {
    const container = document.getElementById('progressList');
    if (!container) return;
    container.innerHTML = projects.map((p) => `
        <div class="progress-item">
            <div class="label">
                <span>${p.name}</span>
                <span class="progress-percent" data-target="${p.progress}">0%</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" data-progress="${p.progress}" style="width:0%;"></div>
            </div>
        </div>
    `).join('');
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach(el => {
            el.style.width = el.dataset.progress + '%';
        });
    }, 50);
    setTimeout(() => {
        document.querySelectorAll('.progress-percent').forEach(el => {
            const target = parseInt(el.dataset.target);
            if (target > 0) animateNumber(el, target, 1000, '%');
            else el.textContent = '0%';
        });
    }, 100);
}

// ============================================================
// 📊 РЕНДЕРИНГ СТАТИСТИКИ
// ============================================================
function renderStats(visits = null) {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    let html = statsData.map(s => `
        <div class="stat-card">
            <div class="stat-number" data-target="${s.value}">0</div>
            <div class="stat-label">${s.label}</div>
            <a href="${s.link}" target="_blank" class="stat-link">${s.linkText}</a>
        </div>
    `).join('');
    const visitsDisplay = (visits !== null) ? visits : '—';
    const visitsTarget = (visits !== null) ? visits : 0;
    html += `
        <div class="stat-card">
            <div class="stat-number" data-target="${visitsTarget}">${visitsDisplay}</div>
            <div class="stat-label">Посещений сайта</div>
            <span style="display:inline-block;margin-top:10px;color:#666;font-size:.8rem;">обновляется автоматически</span>
        </div>
    `;
    grid.innerHTML = html;
    if (document.getElementById('statsOverlay')?.classList.contains('active')) {
        setTimeout(startStatsAnimation, 100);
    }
}

function startStatsAnimation() {
    document.querySelectorAll('#statsGrid .stat-number').forEach(el => {
        const target = parseInt(el.dataset.target);
        if (!isNaN(target) && target > 0) animateNumber(el, target, 1000, '');
    });
}

function updateVisitCounter() {
    fetch('https://api.countapi.xyz/hit/blazing-blocks-visits')
        .then(r => r.json())
        .then(d => renderStats(d.value))
        .catch(() => renderStats(null));
}

// ============================================================
// 🧊 3D-КУБ
// ============================================================
let scene, camera, renderer, cube;

function initThree() {
    const container = document.getElementById('three-container');
    if (!container) return;
    while (container.firstChild) container.removeChild(container.firstChild);
    const width = container.clientWidth || 180;
    const height = container.clientHeight || 180;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xff6a00, emissive: 0xff4400, emissiveIntensity: 0.3, metalness: 0.5, roughness: 0.2 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffaa00 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    cube.add(wireframe);
    animateThree();
}

function animateThree() {
    if (!cube) return;
    requestAnimationFrame(animateThree);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.015;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    const container = document.getElementById('three-container');
    if (container && renderer) {
        const width = container.clientWidth || 180;
        const height = container.clientHeight || 180;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
});

// ============================================================
// 🎛️ УПРАВЛЕНИЕ ОВЕРЛЕЯМИ
// ============================================================
const overlays = document.querySelectorAll('.overlay');
const mainContainer = document.getElementById('mainContainer');

function openOverlay(id) {
    overlays.forEach(o => o.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    if (mainContainer) mainContainer.classList.add('blurred');
    if (id === 'progressOverlay') renderProgress();
    if (id === 'statsOverlay') setTimeout(startStatsAnimation, 100);
}

function closeAllOverlays() {
    overlays.forEach(o => o.classList.remove('active'));
    if (mainContainer) mainContainer.classList.remove('blurred');
}

document.getElementById('openProgressBtn')?.addEventListener('click', () => openOverlay('progressOverlay'));
document.getElementById('openStatsBtn')?.addEventListener('click', () => openOverlay('statsOverlay'));
document.getElementById('openFilesBtn')?.addEventListener('click', () => openOverlay('filesOverlay'));
document.getElementById('openEventsBtn')?.addEventListener('click', () => openOverlay('eventsOverlay'));

// Обработчик для кнопки подписки будет в protection.js, поэтому здесь не дублируем.

document.querySelectorAll('.close-overlay-btn').forEach(btn => btn.addEventListener('click', closeAllOverlays));
overlays.forEach(overlay => overlay.addEventListener('click', function(e) { if (e.target === overlay) closeAllOverlays(); }));
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeAllOverlays(); });

// ============================================================
// 🚀 ЗАПУСК
// ============================================================
renderProgress();
renderStats(null);
updateVisitCounter();

window.addEventListener('load', () => {
    setTimeout(initThree, 400);
});
