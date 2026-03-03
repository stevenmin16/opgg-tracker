const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

async function getOPGGData(summoner) {
    const url = `https://www.op.gg/summoners/na/${encodeURIComponent(summoner)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // New OP.GG layout selectors (2025–2026)
    const rank = $('div.tier').first().text().trim() || "Unranked";
    const lp = $('span.lp').first().text().trim() || "0 LP";

    const wins = $('span.wins').first().text().trim() || "0W";
    const losses = $('span.losses').first().text().trim() || "0L";

    return { summoner, rank, lp, wins, losses };
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
