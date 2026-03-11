const express = require('express');
const app = express();
const port = 80;
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()


const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
const supabase = createClient(url, key)
app.use(express.json());

app.post('/submit', async (req, res) => {
    const data = req.body;

    try {
        const { error } = await supabase
        .from('stats_leaderboard')
        .upsert([data], { onConflict: "steam_id "});

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ status: 'error', error});
        }

        res.json({ status: 'ok'});
    }   catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ status: 'error', error: err.message})
    }
});

app.get('/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stats_leaderboard')
      .select('*')
      .order('stat_value', { ascending: false })

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ status: 'error', error });
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected fetch error:", err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});