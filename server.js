const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

async function getOPGGData(summoner) {
    const encoded = encodeURIComponent(summoner);
    const url = `https://op.gg/api/v1.0/internal/bypass/summoners/na/${encoded}`;

    const { data } = await axios.get(url);

    const ranked = data?.data?.league_stats?.find(x => x.queue_info?.queue_type === "RANKED_SOLO_5x5");

    if (!ranked) {
        return {
            summoner,
            rank: "Unranked",
            lp: "0 LP",
            wins: "0",
            losses: "0"
        };
    }

    return {
        summoner,
        rank: ranked.tier_info.tier,
        lp: `${ranked.tier_info.lp} LP`,
        wins: ranked.wins,
        losses: ranked.losses
    };
}




app.get("/api/player", async (req, res) => {
    try {
        const name = req.query.name;
        if (!name) return res.status(400).json({ error: "Missing name" });

        const data = await getOPGGData(name);
        res.json(data);
    } catch (err) {
        res.json({ error: "Could not fetch data" });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
