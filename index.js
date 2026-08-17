const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Environment variables
const API_SEND = process.env.API_SEND || 'https://znn-alightmotion.vercel.app/api/send';
const API_VERIFY = process.env.API_VERIFY || 'https://znn-alightmotion.vercel.app/api/verify';
const USE_EXTERNAL_API = process.env.USE_EXTERNAL_API === 'true';

// ============================================================
// ENDPOINT: Send Magic Link
// ============================================================
app.post('/api/send', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({
            success: false,
            message: 'Email tidak valid!'
        });
    }

    try {
        if (USE_EXTERNAL_API) {
            // Gunakan API eksternal
            const response = await axios.post(API_SEND, { email }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            return res.status(response.status).json(response.data);
        } else {
            // Simulasi kirim email (mode demo)
            console.log(`📧 Sending magic link to: ${email}`);
            
            // Simulasi delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate fake link
            const fakeLink = `https://alight.link/verify/${Buffer.from(email).toString('base64')}/${Date.now()}`;
            
            return res.status(200).json({
                success: true,
                message: '✅ Magic link telah dikirim ke email Anda! Cek folder Spam.',
                debug: {
                    email,
                    link: fakeLink,
                    note: 'Mode demo - gunakan link ini untuk verifikasi'
                }
            });
        }
    } catch (error) {
        console.error('Send error:', error.message);
        
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        
        return res.status(500).json({
            success: false,
            message: 'Gagal mengirim magic link. Silakan coba lagi.',
            error: error.message
        });
    }
});

// ============================================================
// ENDPOINT: Verify Link
// ============================================================
app.post('/api/verify', async (req, res) => {
    const { email, link } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({
            success: false,
            message: 'Email tidak valid!'
        });
    }

    if (!link || !link.startsWith('http')) {
        return res.status(400).json({
            success: false,
            message: 'Link verifikasi tidak valid!'
        });
    }

    try {
        if (USE_EXTERNAL_API) {
            // Gunakan API eksternal
            const response = await axios.post(API_VERIFY, { email, link }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            return res.status(response.status).json(response.data);
        } else {
            // Mode demo - verifikasi sederhana
            console.log(`🔍 Verifying link for: ${email}`);
            console.log(`🔗 Link: ${link}`);
            
            // Simulasi delay
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            // Cek apakah link mengandung email (base64)
            const emailBase64 = Buffer.from(email).toString('base64');
            
            if (link.includes(emailBase64) || link.includes('alight.link')) {
                return res.status(200).json({
                    success: true,
                    message: '✅ Verifikasi berhasil! Alight Motion Premium aktif.',
                    data: {
                        email: email,
                        status: 'premium',
                        expires: '2099-12-31'
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: '❌ Link verifikasi tidak valid atau sudah kadaluarsa.'
                });
            }
        }
    } catch (error) {
        console.error('Verify error:', error.message);
        
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        
        return res.status(500).json({
            success: false,
            message: 'Gagal verifikasi link. Silakan coba lagi.',
            error: error.message
        });
    }
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mode: USE_EXTERNAL_API ? 'external' : 'demo',
        endpoints: {
            send: '/api/send',
            verify: '/api/verify'
        }
    });
});

// ============================================================
// ROOT - Serve index.html
// ============================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Mode: ${USE_EXTERNAL_API ? 'External API' : 'Demo Mode'}`);
    console.log(`🔗 http://localhost:${PORT}`);
});

module.exports = app;
