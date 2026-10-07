const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// TikTok Search API
app.post('/api/tiktok', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, message: 'URL අවශ්‍යයි.' });

        const response = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({
            url: url,
            hd: 1
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const data = response.data;

        if (data.code === 0 && data.data) {
            const base = 'https://www.tikwm.com';
            const video_hd = data.data.hdplay ? (data.data.hdplay.startsWith('http') ? data.data.hdplay : base + data.data.hdplay) : null;
            const video_sd = data.data.play ? (data.data.play.startsWith('http') ? data.data.play : base + data.data.play) : null;
            const audio = data.data.music ? (data.data.music.startsWith('http') ? data.data.music : base + data.data.music) : null;

            return res.json({
                success: true,
                data: {
                    title: data.data.title || 'TikTok Video',
                    cover: data.data.cover ? (data.data.cover.startsWith('http') ? data.data.cover : base + data.data.cover) : '',
                    author: data.data.author ? data.data.author.nickname : 'TikTok User',
                    video_hd: video_hd,
                    video_sd: video_sd,
                    audio: audio
                }
            });
        } else {
            return res.json({ success: false, message: 'TikTok වීඩියෝව සොයාගත නොහැකි විය.' });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server දෝෂයක් සිදුවිය.' });
    }
});

// Direct Download Endpoint (Force File Download)
app.get('/api/download', async (req, res) => {
    try {
        const { url, title, ext } = req.query;
        if (!url) return res.status(400).send('URL missing');

        const extension = ext || 'mp4';
        const fileName = (title ? title.replace(/[^a-zA-Z0-9]/g, '_') : 'tiktok_download') + '.' + extension;

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const contentType = extension === 'mp3' ? 'audio/mpeg' : 'video/mp4';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        response.data.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send('Download Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
