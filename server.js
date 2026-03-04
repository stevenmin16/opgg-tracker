const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

async function getOPGGData(summoner) {
    const encoded = encodeURIComponent(summoner);
    const url = `https://op.gg/api/v2/lol/summoners/na/${encoded}`;

    const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "x-opgg-platform": "web"
        }
    });

    const ranked = data?.summoner?.league_stats?.find(
        x => x.queue_info?.queue_type === "RANKED_SOLO_5x5"
    );

    if (!ranked) {
        return {
            summoner,
            rank: "Unranked",
            lp: "0 LP",
            wins: "0",
            losses: "0",
            winrate: "0%"
        };
    }

    const wins = ranked.wins;
    const losses = ranked.losses;
    const total = wins + losses;
    const winrate = total > 0 ? Math.round((wins / total) * 100) + "%" : "0%";

    return {
        summoner,
        rank: ranked.tier_info.tier,
        lp: `${ranked.tier_info.lp} LP`,
        wins,
        losses,
        winrate
    };
}


    const wins = ranked.wins;
    const losses = ranked.losses;
    const total = wins + losses;
    const winrate = total > 0 ? Math.round((wins / total) * 100) + "%" : "0%";

    return {
        summoner,
        rank: ranked.tier_info.tier,
        lp: `${ranked.tier_info.lp} LP`,
        wins,
        losses,
        winrate
    };
}

app.get("/api/player", async (req, res) => {
    try {
        const name = req.query.name;
        if (!name) return res.status(400).json({ error: "Missing name" });

        const data = await getOPGGData(name);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.json({ error: "Could not fetch data" });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
