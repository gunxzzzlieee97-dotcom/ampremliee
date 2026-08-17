// ============================================================
// ALIGHT MOTION PREMIUM — VERCEL EDITION
// ============================================================

// ===== DOM REFS =====
const emailInput = document.getElementById('emailInput');
const linkInput = document.getElementById('linkInput');
const btnSend = document.getElementById('btnSend');
const btnVerify = document.getElementById('btnVerify');
const btnBack = document.getElementById('btnBack');
const statusEl = document.getElementById('status');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step1Dot = document.getElementById('step1Dot');
const step2Dot = document.getElementById('step2Dot');
const stepLine = document.getElementById('stepLine');

// ===== API BASE =====
const API_BASE = window.__ENV__?.API_BASE || '/api';

// ===== SVG ICONS =====
const SVG = {
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    mail: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    note: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
};

// ===== MASK EMAIL =====
function maskEmail(email) {
    if (!email || !email.includes('@')) return email || '';
    const [local, domain] = email.split('@');
    const m = local.match(/^([a-zA-Z]+)(.*?)(\d*)$/);
    if (m) {
        let name = m[1];
        const middle = m[2];
        const nums = m[3];
        if (name.length > 4) {
            name = name.slice(0, 4) + '*'.repeat(Math.min(name.length - 4, 3));
        }
        const maskedMiddle = middle ? '*'.repeat(Math.max(middle.length, 2)) : '';
        return `${name}${maskedMiddle}${nums}@${domain}`;
    }
    if (local.length <= 4) return local[0] + '***@' + domain;
    return local.slice(0, 3) + '***' + local.slice(-2) + '@' + domain;
}

// ===== VALIDASI =====
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== STEP FUNCTIONS =====
function goToStep(step) {
    if (step === 1) {
        step1.style.display = 'block';
        step2.style.display = 'none';
        step1Dot.className = 'step-dot active';
        step2Dot.className = 'step-dot';
        stepLine.className = 'step-line';
    } else {
        step1.style.display = 'none';
        step2.style.display = 'block';
        step1Dot.className = 'step-dot done';
        step2Dot.className = 'step-dot active';
        stepLine.className = 'step-line done';
    }
    hideStatus();
}

// ===== STATUS =====
function showStatus(msg, type = '') {
    statusEl.innerHTML = msg;
    statusEl.className = 'status ' + (msg ? 'show ' : '') + type;
}

function hideStatus() {
    statusEl.className = 'status';
    statusEl.innerHTML = '';
}

// ===== SET LOADING =====
function setLoading(btn, loading) {
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ===== REQUEST HELPER =====
async function apiRequest(endpoint, payload) {
    const url = `${API_BASE}${endpoint}`;
    console.log(`📤 ${endpoint} →`, url);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
    });

    const text = await response.text();
    console.log(`📥 Response ${response.status}:`, text.slice(0, 200));

    let result;
    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = { raw: text };
    }

    return { result, ok: response.ok, status: response.status };
}

// ============================================================
// BUTTON: SEND
// ============================================================
btnSend.addEventListener('click', async () => {
    const email = emailInput.value.trim();

    if (!email) {
        showStatus(`${SVG.x} Masukkan email terlebih dahulu!`, 'err');
        return;
    }

    if (!isValidEmail(email)) {
        showStatus(`${SVG.x} Email tidak valid! Contoh: nama@domain.com`, 'err');
        return;
    }

    setLoading(btnSend, true);
    hideStatus();

    try {
        const { result, ok, status } = await apiRequest('/send', { email });

        if (ok) {
            const msg = result?.message || result?.msg || 'Verifikasi terkirim!';
            showStatus(`${SVG.check} ${msg}`, 'ok');
            goToStep(2);
        } else {
            const msg = result?.message || result?.msg || result?.error || `HTTP ${status}`;
            showStatus(`${SVG.x} Gagal: ${msg}`, 'err');
        }

    } catch (err) {
        showStatus(`${SVG.x} ${err.message}`, 'err');
        console.error('Error:', err);
    } finally {
        setLoading(btnSend, false);
    }
});

// ============================================================
// BUTTON: VERIFY
// ============================================================
btnVerify.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    let link = linkInput.value.trim();

    if (!email) {
        showStatus(`${SVG.x} Masukkan email terlebih dahulu!`, 'err');
        return;
    }

    if (!isValidEmail(email)) {
        showStatus(`${SVG.x} Email tidak valid!`, 'err');
        return;
    }

    if (!link) {
        showStatus(`${SVG.x} Masukkan link verifikasi!`, 'err');
        return;
    }

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link;
    }

    setLoading(btnVerify, true);
    hideStatus();

    try {
        const { result, ok, status } = await apiRequest('/verify', {
            email: email,
            link: link,
        });

        if (ok) {
            const msg = result?.message || result?.msg || 'Verifikasi berhasil!';
            showStatus(
                `${SVG.check} ${msg}<br><br>${SVG.mail} Email: ${maskEmail(email)}<br>${SVG.note} Status: Premium aktif`,
                'ok'
            );
        } else {
            const msg = result?.message || result?.msg || result?.error || `HTTP ${status}`;
            showStatus(`${SVG.x} Gagal: ${msg}`, 'err');
        }

    } catch (err) {
        showStatus(`${SVG.x} ${err.message}`, 'err');
        console.error('Error:', err);
    } finally {
        setLoading(btnVerify, false);
    }
});

// ============================================================
// BUTTON: BACK
// ============================================================
btnBack.addEventListener('click', () => {
    goToStep(1);
});

// ============================================================
// KEYBOARD SHORTCUT
// ============================================================
emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        btnSend.click();
    }
});

linkInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        btnVerify.click();
    }
});

// ============================================================
// INIT
// ============================================================
console.log('🚀 Alight Motion Premium — Vercel Edition');
console.log('📍 API Base:', API_BASE);
console.log('Lucky Zuby AI Breaker // Core Online');
