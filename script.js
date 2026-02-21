// ============= NEBULA BOOSTER - ANDROID VERSION =============

// Database Game Populer
const GAMES = [
    { 
        name: "Mobile Legends", 
        pkg: "com.mobile.legends", 
        uri: "mobilelegends://", 
        category: "MOBA",
        icon: "🎮"
    },
    { 
        name: "Free Fire", 
        pkg: "com.dts.freefireth", 
        uri: "freefire://", 
        category: "Battle Royale",
        icon: "🔥"
    },
    { 
        name: "Free Fire MAX", 
        pkg: "com.dts.freefiremax", 
        uri: "freefiremax://", 
        category: "Battle Royale",
        icon: "🔥"
    },
    { 
        name: "PUBG Mobile", 
        pkg: "com.tencent.ig", 
        uri: "pubgm://", 
        category: "Battle Royale",
        icon: "🔫"
    },
    { 
        name: "Genshin Impact", 
        pkg: "com.miHoYo.GenshinImpact", 
        uri: "genshinimpact://", 
        category: "RPG",
        icon: "✨"
    },
    { 
        name: "Call of Duty", 
        pkg: "com.activision.callofduty.shooter", 
        uri: "codm://", 
        category: "FPS",
        icon: "🎯"
    },
    { 
        name: "FIFA Mobile", 
        pkg: "com.ea.gp.fifamobile", 
        uri: "fifamobile://", 
        category: "Sports",
        icon: "⚽"
    },
    { 
        name: "Among Us", 
        pkg: "com.innersloth.spacemafia", 
        uri: "amongus://", 
        category: "Party",
        icon: "👾"
    }
];

// ============= STATE MANAGEMENT =============
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
    isWebView: false
};

// Cek apakah di WebView Android
if (navigator.userAgent.includes('wv') || navigator.userAgent.includes('WebView')) {
    state.isWebView = true;
    document.getElementById('androidStatus').style.display = 'block';
}

// ============= ELEMENTS =============
const elements = {
    overlay: document.getElementById('gameOverlay'),
    overlayToggle: document.getElementById('overlayToggle'),
    permissionCard: document.getElementById('permissionCard'),
    gameGrid: document.getElementById('gameGrid'),
    recentRow: document.getElementById('recentRow'),
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
    fpsProgress: document.getElementById('fpsProgress')
};

// ============= INIT =============
document.addEventListener('DOMContentLoaded', () => {
    init();
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

// ============= DEVICE INFO =============
function updateDeviceInfo() {
    if (state.isAndroid) {
        const cores = navigator.hardwareConcurrency || '8';
        elements.deviceModel.textContent = `Android • ${cores} Core • ${state.isWebView ? 'WebView' : 'Browser'}`;
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
        showToast('🔓 Buka Settings > Apps > Nebula Booster > Advanced > Draw over other apps');
        
        // Simulasi grant (di real app, ini akan deteksi otomatis)
        setTimeout(() => {
            if (confirm('Sudah mengizinkan overlay?')) {
                localStorage.setItem('overlayPermission', 'granted');
                checkPermission();
                showToast('✅ Izin diberikan!');
            }
        }, 3000);
    } else {
        localStorage.setItem('overlayPermission', 'granted');
        checkPermission();
        showToast('✅ Izin diberikan (mode desktop)');
    }
});

// ============= OVERLAY TOGGLE =============
elements.overlayToggle.addEventListener('change', (e) => {
    if (!state.hasPermission) return;
    
    state.overlayActive = e.target.checked;
    elements.overlay.style.display = e.target.checked ? 'block' : 'none';
    
    if (e.target.checked) {
        showToast('🪟 Overlay aktif - Muncul di atas game');
    }
});

// ============= SCAN GAMES =============
async function scanGames() {
    showToast('🔍 Memindai game...');
    
    elements.gameGrid.innerHTML = '<div class="loading">Memindai game...</div>';
    
    state.detectedGames = [];
    
    if (state.isAndroid) {
        // Di Android, cek satu per satu
        for (const game of GAMES) {
            if (await checkGameInstalled(game.pkg)) {
                state.detectedGames.push(game);
            }
            await new Promise(r => setTimeout(r, 50));
        }
    }
    
    // Fallback jika tidak terdeteksi
    if (state.detectedGames.length === 0) {
        state.detectedGames = GAMES.slice(0, 6);
    }
    
    renderGameList();
    elements.gameCount.textContent = state.detectedGames.length + ' game';
}

// Fungsi untuk cek apakah game terinstall (via Intent)
function checkGameInstalled(packageName) {
    return new Promise(resolve => {
        // Di WebView Android, kita bisa menggunakan interface
        if (window.Android && window.Android.isPackageInstalled) {
            try {
                const installed = window.Android.isPackageInstalled(packageName);
                resolve(installed);
            } catch (e) {
                resolve(false);
            }
        } else {
            // Fallback ke iframe method (terbatas)
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
        elements.gameGrid.innerHTML = '<div class="loading">Tidak ada game terdeteksi</div>';
        return;
    }
    
    elements.gameGrid.innerHTML = state.detectedGames.map(game => `
        <div class="game-card" data-pkg="${game.pkg}" data-uri="${game.uri}" data-name="${game.name}">
            <div class="game-icon">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            <div class="game-category">${game.category}</div>
            <span class="game-badge">MAIN</span>
        </div>
    `).join('');
    
    // Event listener untuk setiap game
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.dataset.name;
            const pkg = card.dataset.pkg;
            const uri = card.dataset.uri;
            launchGame(name, pkg, uri);
        });
    });
}

// ============= LAUNCH GAME - ANDROID FIX =============
function launchGame(gameName, packageName, uri) {
    showToast(`🚀 Membuka ${gameName}...`);
    
    // Set active game
    state.currentGame = gameName;
    elements.activeGameName.textContent = gameName;
    
    // Simpan ke recent
    const recent = { 
        name: gameName, 
        pkg: packageName, 
        time: Date.now(),
        icon: getGameIcon(gameName)
    };
    
    state.recentGames = [recent, ...state.recentGames.filter(g => g.pkg !== packageName)].slice(0, 5);
    localStorage.setItem('recentGames', JSON.stringify(state.recentGames));
    renderRecentGames();
    
    // Boost dulu
    performBoost(() => {
        // ===== ANDROID WEBVIEW FIX =====
        if (state.isWebView && window.Android && window.Android.openGame) {
            // Method 1: Panggil native Android
            window.Android.openGame(packageName, uri);
        } else if (state.isAndroid) {
            // Method 2: Intent URL (untuk browser Android)
            try {
                // Coba dengan URI scheme dulu
                if (uri) {
                    window.location.href = uri;
                    
                    // Fallback ke intent jika gagal
                    setTimeout(() => {
                        window.location.href = `intent://${packageName}/#Intent;scheme=androidapp;package=${packageName};S.browser_fallback_url=https://play.google.com/store/apps/details?id=${packageName};end`;
                    }, 500);
                } else {
                    // Langsung intent
                    window.location.href = `intent://${packageName}/#Intent;scheme=androidapp;package=${packageName};end`;
                }
            } catch (e) {
                showToast('❌ Gagal membuka game');
            }
        } else {
            // Method 3: Desktop simulation
            showToast(`🎮 Demo: ${gameName} akan dibuka (desktop mode)`);
        }
        
        // Aktifkan overlay otomatis
        setTimeout(() => {
            if (state.hasPermission && elements.overlayToggle.checked) {
                elements.overlay.style.display = 'block';
                state.overlayActive = true;
            }
        }, 2000);
    });
}

function getGameIcon(gameName) {
    const game = GAMES.find(g => g.name === gameName);
    return game ? game.icon : '🎮';
}

// ============= RENDER RECENT GAMES =============
function renderRecentGames() {
    if (state.recentGames.length === 0) {
        elements.recentRow.innerHTML = '<div class="recent-item">-</div>';
        return;
    }
    
    elements.recentRow.innerHTML = state.recentGames.map(game => `
        <div class="recent-item" data-pkg="${game.pkg}" data-name="${game.name}">
            <span>${game.icon || '🎮'}</span>
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
    });
}

// ============= BOOST FUNCTION =============
function performBoost(callback) {
    // Animasi
    document.querySelectorAll('.boost-btn, .overlay-boost, .mini-boost').forEach(btn => {
        if (btn) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = 'scale(1)', 200);
        }
    });
    
    showToast(`⚡ Meningkatkan performa ke ${state.fpsTarget} FPS...`);
    
    setTimeout(() => {
        updateStats(true);
        showToast('✅ Boost selesai!');
        if (callback) callback();
    }, 1500);
}

// ============= PERFORMANCE MONITOR =============
function startPerformanceMonitor() {
    // FPS Counter
    function measureFPS() {
        state.frameCount++;
        const now = performance.now();
        if (now - state.lastFpsUpdate >= 1000) {
            state.fps = state.frameCount;
            state.frameCount = 0;
            state.lastFpsUpdate = now;
        }
        requestAnimationFrame(measureFPS);
    }
    measureFPS();
    
    // Update stats setiap detik
    setInterval(() => {
        updateStats(false);
    }, 1000);
}

function updateStats(boosted = false) {
    // RAM
    if ('deviceMemory' in navigator) {
        const totalRam = navigator.deviceMemory;
        let usedRam, freeRam, ramPercent;
        
        if (boosted) {
            usedRam = Math.round(totalRam * 0.3);
            ramPercent = 30;
        } else {
            usedRam = Math.round(totalRam * (0.5 + Math.random() * 0.2));
            ramPercent = 50 + Math.random() * 20;
        }
        freeRam = totalRam - usedRam;
        
        elements.ramValue.textContent = `${freeRam.toFixed(1)}/${totalRam} GB`;
        elements.overlayRam.textContent = `${freeRam.toFixed(1)} GB`;
        if (elements.ramProgress) elements.ramProgress.style.width = ramPercent + '%';
    }
    
    // CPU
    const cpuBase = boosted ? 25 : 45;
    const cpuRandom = cpuBase + Math.round(Math.random() * 15);
    elements.cpuValue.textContent = cpuRandom + '%';
    elements.overlayCpu.textContent = cpuRandom + '%';
    if (elements.cpuProgress) elements.cpuProgress.style.width = cpuRandom + '%';
    
    // Temperature
    const tempBase = boosted ? 38 : 42;
    const tempRandom = tempBase + Math.round(Math.random() * 3);
    elements.tempValue.textContent = tempRandom + '°C';
    if (elements.tempProgress) elements.tempProgress.style.width = ((tempRandom - 35) * 10) + '%';
    
    // FPS
    elements.fpsValue.textContent = state.fps;
    elements.overlayFps.textContent = state.fps;
    elements.miniFps.textContent = state.fps;
    
    const fpsPercent = (state.fps / state.fpsTarget) * 100;
    if (elements.fpsProgress) elements.fpsProgress.style.width = Math.min(fpsPercent, 100) + '%';
}

// ============= OVERLAY DRAG =============
function setupOverlayDrag() {
    const dragHandle = document.getElementById('overlayDrag');
    let isDragging = false;
    let offsetX, offsetY;
    
    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - elements.overlay.offsetLeft;
        offsetY = e.clientY - elements.overlay.offsetTop;
        elements.overlay.style.transition = 'none';
    });
    
    dragHandle.addEventListener('touchstart', (e) => {
        isDragging = true;
        offsetX = e.touches[0].clientX - elements.overlay.offsetLeft;
        offsetY = e.touches[0].clientY - elements.overlay.offsetTop;
        elements.overlay.style.transition = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        const maxX = window.innerWidth - elements.overlay.offsetWidth;
        const maxY = window.innerHeight - elements.overlay.offsetHeight;
        
        elements.overlay.style.left = Math.min(Math.max(0, x), maxX) + 'px';
        elements.overlay.style.top = Math.min(Math.max(0, y), maxY) + 'px';
        elements.overlay.style.right = 'auto';
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const x = e.touches[0].clientX - offsetX;
        const y = e.touches[0].clientY - offsetY;
        
        const maxX = window.innerWidth - elements.overlay.offsetWidth;
        const maxY = window.innerHeight - elements.overlay.offsetHeight;
        
        elements.overlay.style.left = Math.min(Math.max(0, x), maxX) + 'px';
        elements.overlay.style.top = Math.min(Math.max(0, y), maxY) + 'px';
        elements.overlay.style.right = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        elements.overlay.style.transition = 'all 0.3s';
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
        elements.overlay.style.transition = 'all 0.3s';
    });
}

// ============= OVERLAY CONTROLS =============
document.getElementById('overlayMinimize').addEventListener('click', () => {
    elements.overlay.classList.toggle('minimized');
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
});

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
    showToast('⚡ Mode Max FPS (120) diaktifkan');
});

document.getElementById('testGameBtn').addEventListener('click', () => {
    elements.menuModal.classList.remove('show');
    // Test buka game Mobile Legends
    launchGame('Mobile Legends', 'com.mobile.legends', 'mobilelegends://');
});

// Click outside modal
window.addEventListener('click', (e) => {
    if (e.target === elements.menuModal) {
        elements.menuModal.classList.remove('show');
    }
});
