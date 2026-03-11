const express = require('express');
const app = express();
const port = 80;
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()


const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(url, key)
app.use(express.json());

app.post('/submit', async (req, res) => {
    const data = req.body;

    try {
        const { error } = await supabase
        .from('stats_leaderboard')
        .insert([data]);

        if (error) {
            console.error(`Supabase insert error: ${error}`)
            return res.status(500).json({ status: 'error', error});
        }

        res.json({ status: 'ok'});
    }   catch (err) {
        console.error(`Unexpected error: ${err}`);
        res.status(500).json({ status: 'error', error: err.message})
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});