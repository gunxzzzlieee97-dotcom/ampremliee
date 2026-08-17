# Alight Motion Premium Generator

## Deploy ke Vercel

### 1. Upload ke GitHub

### 2. Deploy ke Vercel
- Buka [Vercel](https://vercel.com)
- Klik "Add New Project"
- Import repository ini
- Setup Environment Variables (lihat di bawah)
- Klik Deploy

### 3. Environment Variables (di Vercel Dashboard)
| Key | Value | Keterangan |
|-----|-------|------------|
| `USE_EXTERNAL_API` | `false` | `false` = demo mode, `true` = pakai API eksternal |
| `API_SEND` | `https://znn-alightmotion.vercel.app/api/send` | Endpoint kirim (opsional) |
| `API_VERIFY` | `https://znn-alightmotion.vercel.app/api/verify` | Endpoint verifikasi (opsional) |

### 4. Akses
Setelah deploy, buka URL yang diberikan Vercel.

## Fitur
- ✅ Kirim magic link
- ✅ Verifikasi link
- ✅ Demo mode (tanpa API eksternal)
- ✅ Support API eksternal

## Struktur
