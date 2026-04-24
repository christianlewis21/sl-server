const express = require('express');
const app = express();
const port = 80;
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
const supabase = createClient(url, key)
app.use(express.json());

let leaderboardCache = [];

async function refreshCache() {
  const { data, error } = await supabase
    .from('stats_leaderboard')
    .select('*')
    .order('steam_id', { ascending: false });

  if (error) {
    console.error("Failed to refresh cache:", error);
    return;
  }

  leaderboardCache = data;
  console.log("Leaderboard cache refreshed");
}

app.post('/submit', async (req, res) => {
  const data = req.body;

  try {
    const { error } = await supabase
      .from('stats_leaderboard')
      .upsert([data], { onConflict: "steam_id" });

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ status: 'error', error });
    }

    await refreshCache();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/leaderboard', (req, res) => {
  res.set('Connection', 'close');
  res.json(leaderboardCache);
});

app.listen(port, '0.0.0.0', async () => {
  await refreshCache();
  console.log(`Server is running on http://localhost:${port}`);
});