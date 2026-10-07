const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/tiktok', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.json({ success: false, message: "කරුණාකර TikTok Link එකක් ඇතුළත් කරන්න." });
    }

    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        
        if (response.data && response.data.code === 0 && response.data.data) {
            const d = response.data.data;
            
            const formatUrl = (path) => {
                if (!path) return null;
                return path.startsWith('http') ? path : `https://www.tikwm.com${path}`;
            };

            return res.json({
                success: true,
                data: {
                    title: d.title || "TikTok Video",
                    author: d.author?.nickname || "TikTok User",
                    cover: formatUrl(d.cover || d.origin_cover),
                    video_hd: formatUrl(d.hdplay),
                    video_sd: formatUrl(d.play),
                    audio: formatUrl(d.music)
                }
            });
        } else {
            return res.json({ success: false, message: "TikTok වීඩියෝව සකසා ගැනීමට නොහැකි විය. Link එක නිවැරදිදැයි පරීක්ෂා කරන්න." });
        }
    } catch (error) {
        console.error("TikTok API Error:", error);
        return res.json({ success: false, message: "Server දෝෂයකි. නැවත උත්සාහ කරන්න." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
