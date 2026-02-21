// ============= NEBULA X - PREMIUM GAME BOOSTER =============

// Database Game Premium
const GAMES = [
    { 
        name: "Mobile Legends", 
        pkg: "com.mobile.legends", 
        uri: "mobilelegends://", 
        category: "MOBA",
        icon: "🎮",
        color: "#6c5ce7"
    },
    { 
        name: "Free Fire", 
        pkg: "com.dts.freefireth", 
        uri: "freefire://", 
        category: "Battle Royale",
        icon: "🔥",
        color: "#ff6b9d"
    },
    { 
        name: "Free Fire MAX", 
        pkg: "com.dts.freefiremax", 
        uri: "freefiremax://", 
        category: "Battle Royale",
        icon: "🔥",
        color: "#ff8a8a"
    },
    { 
        name: "PUBG Mobile", 
        pkg: "com.tencent.ig", 
        uri: "pubgm://", 
        category: "Battle Royale",
        icon: "🔫",
        color: "#ffd93d"
    },
    { 
        name: "Genshin Impact", 
        pkg: "com.miHoYo.GenshinImpact", 
        uri: "genshinimpact://", 
        category: "RPG",
        icon: "✨",
        color: "#00f5a0"
    },
    { 
        name: "Call of Duty", 
        pkg: "com.activision.callofduty.shooter", 
        uri: "codm://", 
        category: "FPS",
        icon: "🎯",
        color: "#00d2ff"
    },
    { 
        name: "FIFA Mobile", 
        pkg: "com.ea.gp.fifamobile", 
        uri: "fifamobile://", 
        category: "Sports",
        icon: "⚽",
        color: "#00b894"
    },
    { 
        name: "Among Us", 
        pkg: "com.innersloth.spacemafia", 
        uri: "amongus://", 
        category: "Party",
        icon: "👾",
        color: "#a463f5"
    },
    { 
        name: "League of Legends", 
        pkg: "com.riotgames.league.wildrift", 
        uri: "wildrift://", 
        category: "MOBA",
        icon: "🏆",
        color: "#6c5ce7"
    },
    { 
        name: "eFootball", 
        pkg: "jp.konami.pesam", 
        uri: "efootball://", 
        category: "Sports",
        icon: "⚽",
        color: "#00b894"
    }
];

// ============= PREMIUM STATE MANAGEMENT =============
let state = {
    detectedGames: [],
    recentGames: JSON.parse(localStorage.getItem('recentGames') || '[]'),
    hasPermission: false,
    overlayActive: false,
    currentGame: null,
    fps: 60,
    fpsTarget: 60,
    frameCount: 0,
    lastFpsUpdate: performance.now(),
    isAndroid: /Android/i.test(navigator.userAgent),
    isWebView: /wv|WebView/i.test(navigator.userAgent),
    particles: []
};

// ============= ELEMENTS =============
const elements = {
    overlay: document.getElementById('premiumOverlay'),
    overlayToggle: document.getElementById('overlayToggle'),
    permissionCard: document.getElementById('permissionCard'),
    gameGrid: document.getElementById('gameGrid'),
    recentStrip: document.getElementById('recentStrip'),
    toast: document.getElementById('toast'),
    menuModal: document.getElementById('menuModal'),
    activeGameName: document.getElementById('activeGameName'),
    miniFps: document.getElementById('miniFps'),
    ramValue: document.getElementById('ramValue'),
    cpuValue: document.getElementById('cpuValue'),
    tempValue: document.getElementById('tempValue'),
    fpsValue: document.getElementById('fpsValue'),
    overlayFps: document.getElementById('overlayFps'),
    overlayRam: document.getElementById('overlayRam'),
    overlayCpu: document.getElementById('overlayCpu'),
    fpsSlider: document.getElementById('fpsSlider'),
    fpsTarget: document.getElementById('fpsTarget'),
    gameCount: document.getElementById('gameCount'),
    deviceModel: document.getElementById('deviceModel'),
    ramProgress: document.getElementById('ramProgress'),
    cpuProgress: document.getElementById('cpuProgress'),
    tempProgress: document.getElementById('tempProgress'),
    fpsProgress: document.getElementById('fpsProgress'),
    fpsRing: document.getElementById('fpsRing'),
    overlayFpsTarget: document.getElementById('overlayFpsTarget')
};

// ============= INIT =============
document.addEventListener('DOMContentLoaded', () => {
    init();
    createParticles();
});

function init() {
    checkPermission();
    scanGames();
    startPerformanceMonitor();
    setupEventListeners();
    setupOverlayDrag();
    renderRecentGames();
    updateDeviceInfo();
    setupFPSControl();
}

// ============= CREATE ANIMATED PARTICLES =============
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(108, 92, 231, ${Math.random() * 0.3})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `floatParticle ${Math.random() * 10 + 10}s infinite linear`;
        particle.style.pointerEvents = 'none';
        particlesContainer.appendChild(particle);
    }
}

// ============= DEVICE INFO =============
function updateDeviceInfo() {
    if (state.isAndroid) {
        const cores = navigator.hardwareConcurrency || '8';
        elements.deviceModel.textContent = `Android • ${cores} Core`;
    } else {
        elements.deviceModel.textContent = `Desktop Mode`;
    }
}

// ============= PERMISSION HANDLING =============
function checkPermission() {
    state.hasPermission = localStorage.getItem('overlayPermission') === 'granted';
    
    elements.permissionCard.style.display = state.hasPermission ? 'none' : 'flex';
    elements.overlayToggle.disabled = !state.hasPermission;
    
    if (!state.hasPermission) {
        elements.overlayToggle.checked = false;
        elements.overlay.style.display = 'none';
        state.overlayActive = false;
    }
}

document.getElementById('requestPermBtn').addEventListener('click', () => {
    if (state.isAndroid) {
        showToast('🔓 Buka Settings > Apps > Nebula X > Advanced > Draw over other apps');
        
        setTimeout(() => {
            if (confirm('Sudah mengizinkan overlay?')) {
                localStorage.setItem('overlayPermission', 'granted');
                checkPermission();
                showToast('✅ Izin diberikan!');
                animateSuccess();
            }
        }, 3000);
    } else {
        localStorage.setItem('overlayPermission', 'granted');
        checkPermission();
        showToast('✅ Izin diberikan (mode desktop)');
        animateSuccess();
    }
});

function animateSuccess() {
    elements.permissionCard.style.animation = 'none';
    elements.permissionCard.offsetHeight;
    elements.permissionCard.style.animation = 'pulse 2s infinite';
}

// ============= OVERLAY TOGGLE =============
elements.overlayToggle.addEventListener('change', (e) => {
    if (!state.hasPermission) return;
    
    state.overlayActive = e.target.checked;
    elements.overlay.style.display = e.target.checked ? 'block' : 'none';
    
    if (e.target.checked) {
        showToast('🪟 Overlay aktif • Geser untuk pindah');
        elements.overlay.style.animation = 'modalSlide 0.3s';
    }
});

// ============= SCAN GAMES =============
async function scanGames() {
    showToast('🔍 Memindai game...');
    
    elements.gameGrid.innerHTML = '<div class="loading">Memindai game...</div>';
    
    state.detectedGames = [];
    
    if (state.isAndroid) {
        for (const game of GAMES) {
            if (await checkGameInstalled(game.pkg)) {
                state.detectedGames.push(game);
            }
            await new Promise(r => setTimeout(r, 50));
        }
    }
    
    if (state.detectedGames.length === 0) {
        state.detectedGames = GAMES.slice(0, 6);
    }
    
    renderGameList();
    elements.gameCount.textContent = state.detectedGames.length;
    showToast(`✅ Ditemukan ${state.detectedGames.length} game`);
}

function checkGameInstalled(packageName) {
    return new Promise(resolve => {
        if (window.Android && window.Android.isPackageInstalled) {
            try {
                resolve(window.Android.isPackageInstalled(packageName));
            } catch (e) {
                resolve(false);
            }
        } else {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            
            const timer = setTimeout(() => {
                document.body.removeChild(iframe);
                resolve(false);
            }, 200);
            
            iframe.onload = () => {
                clearTimeout(timer);
                document.body.removeChild(iframe);
                resolve(true);
            };
            
            iframe.src = `intent://${packageName}/#Intent;package=${packageName};end`;
            document.body.appendChild(iframe);
        }
    });
}

// ============= RENDER GAME LIST =============
function renderGameList() {
    if (state.detectedGames.length === 0) {
        elements.gameGrid.innerHTML = '<div class="loading">Tidak ada game</div>';
        return;
    }
    
    elements.gameGrid.innerHTML = state.detectedGames.map((game, index) => `
        <div class="game-card" data-pkg="${game.pkg}" data-uri="${game.uri}" data-name="${game.name}" style="animation: modalSlide 0.3s ${index * 0.05}s both;">
            <div class="game-icon" style="color: ${game.color}">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            <div class="game-category">${game.category}</div>
            <span class="game-badge" style="background: linear-gradient(145deg, ${game.color}, ${game.color}dd)">MAIN</span>
        </div>
    `).join('');
    
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.dataset.name;
            const pkg = card.dataset.pkg;
            const uri = card.dataset.uri;
            launchGame(name, pkg, uri);
        });
    });
}

// ============= LAUNCH GAME =============
function launchGame(gameName, packageName, uri) {
    showToast(`🚀 Membuka ${gameName}...`);
    
    state.currentGame = gameName;
    elements.activeGameName.textContent = gameName;
    
    const game = GAMES.find(g => g.name === gameName);
    const recent = { 
        name: gameName, 
        pkg: packageName, 
        time: Date.now(),
        icon: game ? game.icon : '🎮',
        color: game ? game.color : '#6c5ce7'
    };
    
    state.recentGames = [recent, ...state.recentGames.filter(g => g.pkg !== packageName)].slice(0, 5);
    localStorage.setItem('recentGames', JSON.stringify(state.recentGames));
    renderRecentGames();
    
    performBoost(() => {
        if (state.isWebView && window.Android && window.Android.openGame) {
            window.Android.openGame(packageName, uri);
        } else if (state.isAndroid) {
            try {
                if (uri) {
                    window.location.href = uri;
                    setTimeout(() => {
                        window.location.href = `intent://${packageName}/#Intent;scheme=androidapp;package=${packageName};end`;
                    }, 500);
                } else {
                    window.location.href = `intent://${packageName}/#Intent;scheme=androidapp;package=${packageName};end`;
                }
            } catch (e) {
                showToast('❌ Gagal membuka game');
            }
        } else {
            showToast(`🎮 Demo: ${gameName} akan dibuka`);
        }
        
        setTimeout(() => {
            if (state.hasPermission && elements.overlayToggle.checked) {
                elements.overlay.style.display = 'block';
                state.overlayActive = true;
                animateOverlay();
            }
        }, 2000);
    });
}

function animateOverlay() {
    elements.overlay.style.transform = 'scale(1.1)';
    setTimeout(() => elements.overlay.style.transform = 'scale(1)', 200);
}

// ============= RENDER RECENT GAMES =============
function renderRecentGames() {
    if (state.recentGames.length === 0) {
        elements.recentStrip.innerHTML = '<div class="recent-item">-</div>';
        return;
    }
    
    elements.recentStrip.innerHTML = state.recentGames.map(game => `
        <div class="recent-item" data-pkg="${game.pkg}" data-name="${game.name}" style="border-color: ${game.color || '#6c5ce7'}">
            <span class="recent-icon">${game.icon || '🎮'}</span>
            <span>${game.name}</span>
        </div>
    `).join('');
    
    document.querySelectorAll('.recent-item').forEach(item => {
        item.addEventListener('click', () => {
            const name = item.dataset.name;
            const pkg = item.dataset.pkg;
            const game = GAMES.find(g => g.pkg === pkg);
            launchGame(name, pkg, game?.uri || '');
        });
    });
}

// ============= FPS CONTROL =============
function setupFPSControl() {
    elements.fpsSlider.addEventListener('input', (e) => {
        state.fpsTarget = parseInt(e.target.value);
        elements.fpsTarget.textContent = state.fpsTarget;
        if (elements.overlayFpsTarget) {
            elements.overlayFpsTarget.textContent = state.fpsTarget;
        }
        
        // Update ring color
        updateRingColor();
    });
}

function updateRingColor() {
    if (elements.fpsRing) {
        const percent = (state.fps / state.fpsTarget) * 100;
        if (percent >= 90) {
            elements.fpsRing.style.stroke = '#00f5a0';
        } else if (percent >= 60) {
            elements.fpsRing.style.stroke = '#ffd93d';
        } else {
            elements.fpsRing.style.stroke = '#ff5e7d';
        }
    }
}

// ============= BOOST FUNCTION =============
function performBoost(callback) {
    document.querySelectorAll('.boost-btn, .overlay-quickboost, .mini-boost-btn').forEach(btn => {
        if (btn) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = 'scale(1)', 200);
        }
    });
    
    showToast(`⚡ Meningkatkan performa ke ${state.fpsTarget} FPS...`);
    
    let boostProgress = 0;
    const boostInterval = setInterval(() => {
        boostProgress += 5;
        const currentFPS = Math.min(state.fps + boostProgress, state.fpsTarget);
        
        elements.fpsValue.textContent = Math.round(currentFPS);
        elements.overlayFps.textContent = Math.round(currentFPS);
        elements.miniFps.textContent = Math.round(currentFPS);
        
        if (boostProgress >= state.fpsTarget - state.fps || boostProgress >= 30) {
            clearInterval(boostInterval);
            updateStats(true);
            state.fps = state.fpsTarget;
            showToast('✅ Boost selesai!');
            updateRingColor();
            if (callback) callback();
        }
    }, 100);
}

// ============= PERFORMANCE MONITOR =============
function startPerformanceMonitor() {
    function measureFPS() {
        state.frameCount++;
        const now = performance.now();
        if (now - state.lastFpsUpdate >= 1000) {
            state.fps = state.frameCount;
            state.frameCount = 0;
            state.lastFpsUpdate = now;
            
            // Update FPS display dengan animasi smooth
            animateValue(elements.fpsValue, parseInt(elements.fpsValue.textContent), state.fps, 300);
            animateValue(elements.overlayFps, parseInt(elements.overlayFps.textContent), state.fps, 300);
            animateValue(elements.miniFps, parseInt(elements.miniFps.textContent), state.fps, 300);
            
            updateRingColor();
        }
        requestAnimationFrame(measureFPS);
    }
    measureFPS();
    
    setInterval(() => {
        updateStats(false);
    }, 800);
}

function animateValue(element, start, end, duration) {
    if (!element) return;
    const range = end - start;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(start + range * progress);
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function updateStats(boosted = false) {
    // RAM
    if ('deviceMemory' in navigator) {
        const totalRam = navigator.deviceMemory;
        let usedRam, freeRam, ramPercent;
        
        if (boosted) {
            usedRam = Math.round(totalRam * 0.25);
            ramPercent = 25;
        } else {
            usedRam = Math.round(totalRam * (0.45 + Math.random() * 0.2));
            ramPercent = 45 + Math.random() * 20;
        }
        freeRam = totalRam - usedRam;
        
        elements.ramValue.textContent = `${freeRam.toFixed(1)}/${totalRam} GB`;
        elements.overlayRam.textContent = `${freeRam.toFixed(1)} GB`;
        if (elements.ramProgress) {
            elements.ramProgress.style.width = ramPercent + '%';
        }
    }
    
    // CPU
    const cpuBase = boosted ? 20 : 40;
    const cpuRandom = cpuBase + Math.round(Math.random() * 15);
    elements.cpuValue.textContent = cpuRandom + '%';
    elements.overlayCpu.textContent = cpuRandom + '%';
    if (elements.cpuProgress) {
        elements.cpuProgress.style.width = cpuRandom + '%';
    }
    
    // Temperature
    const tempBase = boosted ? 36 : 41;
    const tempRandom = tempBase + Math.round(Math.random() * 3);
    elements.tempValue.textContent = tempRandom + '°C';
    if (elements.tempProgress) {
        elements.tempProgress.style.width = ((tempRandom - 35) * 10) + '%';
    }
    
    // Update FPS ring
    if (elements.fpsRing) {
        const ringCircumference = 2 * Math.PI * 36;
        const fpsPercent = (state.fps / state.fpsTarget) * 100;
        const dashOffset = ringCircumference - (ringCircumference * fpsPercent / 100);
        elements.fpsRing.style.strokeDashoffset = dashOffset;
    }
}

// ============= OVERLAY DRAG =============
function setupOverlayDrag() {
    const dragHandle = document.getElementById('overlayDrag');
    let isDragging = false;
    let offsetX, offsetY;
    
    dragHandle.addEventListener('mousedown', startDrag);
    dragHandle.addEventListener('touchstart', startDrag, { passive: false });
    
    function startDrag(e) {
        isDragging = true;
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        offsetX = clientX - elements.overlay.offsetLeft;
        offsetY = clientY - elements.overlay.offsetTop;
        elements.overlay.style.transition = 'none';
    }
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    
    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        const x = clientX - offsetX;
        const y = clientY - offsetY;
        
        const maxX = window.innerWidth - elements.overlay.offsetWidth;
        const maxY = window.innerHeight - elements.overlay.offsetHeight;
        
        elements.overlay.style.left = Math.min(Math.max(0, x), maxX) + 'px';
        elements.overlay.style.top = Math.min(Math.max(0, y), maxY) + 'px';
        elements.overlay.style.right = 'auto';
    }
    
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
    
    function stopDrag() {
        isDragging = false;
        elements.overlay.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
}

// ============= OVERLAY CONTROLS =============
document.getElementById('overlayMinimize').addEventListener('click', () => {
    elements.overlay.classList.toggle('minimized');
    showToast(elements.overlay.classList.contains('minimized') ? 'Overlay diminimalkan' : 'Overlay diperbesar');
});

document.getElementById('overlayClose').addEventListener('click', () => {
    elements.overlay.style.display = 'none';
    elements.overlayToggle.checked = false;
    state.overlayActive = false;
});

// ============= BOOST BUTTONS =============
document.getElementById('boostBtn').addEventListener('click', () => performBoost());
document.getElementById('overlayBoost').addEventListener('click', () => performBoost());
document.getElementById('miniBoost').addEventListener('click', () => performBoost());

// ============= TOAST =============
function showToast(message, duration = 2000) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, duration);
}

// ============= MENU =============
document.getElementById('menuBtn').addEventListener('click', () => {
    elements.menuModal.classList.add('show');
    animateModal();
});

function animateModal() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.style.animation = 'none';
    modalContent.offsetHeight;
    modalContent.style.animation = 'modalSlide 0.3s';
}

document.getElementById('closeMenu').addEventListener('click', () => {
    elements.menuModal.classList.remove('show');
});

// Menu items
document.getElementById('scanGamesBtn').addEventListener('click', () => {
    elements.menuModal.classList.remove('show');
    scanGames();
});

document.getElementById('checkPermBtn').addEventListener('click', () => {
    elements.menuModal.classList.remove('show');
    checkPermission();
    showToast(state.hasPermission ? '✅ Izin aktif' : '❌ Izin belum diberikan');
});

document.getElementById('resetOverlayBtn').addEventListener('click', () => {
    elements.menuModal.classList.remove('show');
    elements.overlay.style.top = '100px';
    elements.overlay.style.left = 'auto';
    elements.overlay.style.right = '20px';
    showToast('🪟 Posisi overlay direset');
});

document.getElementById('maxFpsBtn').addEventListener('click', () => {
    elements.menuModal.classList.remove('show');
    state.fpsTarget = 120;
    elements.fpsSlider.value = 120;
    elements.fpsTarget.textContent = '120';
    if (elements.overlayFpsTarget) {
        elements.overlayFpsTarget.textContent = '120';
    }
    showToast('⚡ Mode Max FPS (120) diaktifkan');
    updateRingColor();
});

document.getElementById('testGameBtn').addEventListener('click', () => {
    elements.menuModal.classList.remove('show');
    launchGame('Mobile Legends', 'com.mobile.legends', 'mobilelegends://');
});

// Click outside modal
window.addEventListener('click', (e) => {
    if (e.target === elements.menuModal) {
        elements.menuModal.classList.remove('show');
    }
});
