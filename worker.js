// Cloudflare Worker: принимает записку со страницы и отправляет её в Telegram.
// Секреты TELEGRAM_TOKEN и CHAT_ID хранятся в настройках Worker, а не в коде.
const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
        if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

        let data;
        try { data = await request.json(); } catch { return new Response('Bad request', { status: 400, headers: CORS }); }

        const name = String(data.name || 'Ученик').slice(0, 40);
        const text = String(data.text || '').trim().slice(0, 280);
        if (!text) return new Response('Empty', { status: 400, headers: CORS });

        const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: env.CHAT_ID, text: `Записка для учителя\nОт: ${name}\n\n${text}` }),
        });
        return new Response(res.ok ? 'ok' : 'telegram error', { status: res.ok ? 200 : 502, headers: CORS });
    },
};