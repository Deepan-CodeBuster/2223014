import { useState } from "react";
import { TextField, Button, Paper, Typography } from "@mui/material";
import axios from "axios";
import logger, { withLogging } from "../logger";

const API_BASE = process.env.REACT_APP_API_BASE;
console.log(API_BASE);

function StatsPage() {
  const [shortcode, setShortcode] = useState("");
  const [stats, setStats] = useState(null);

  const fetchStats = withLogging(async () => {
    const res = await axios.get(`${API_BASE}/shorturls/${shortcode}`);
    setStats(res.data);
  }, "fetchStats");

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>URL Statistics</Typography>
      <TextField
        label="Enter Shortcode"
        value={shortcode}
        onChange={(e) => setShortcode(e.target.value)}
        sx={{ mr: 2 }}
      />
      <Button variant="contained" onClick={fetchStats}>Get Stats</Button>

      {stats && (
        <div style={{ marginTop: 20 }}>
          <Typography>Original URL: {stats.originalUrl}</Typography>
          <Typography>Created At: {new Date(stats.createdAt).toLocaleString()}</Typography>
          <Typography>Expiry: {new Date(stats.expiry).toLocaleString()}</Typography>
          <Typography>Total Clicks: {stats.totalClicks}</Typography>
          <Typography variant="h6">Clicks:</Typography>
          <ul>
            {stats.clicks.map((c, i) => (
              <li key={i}>
                {new Date(c.timestamp).toLocaleString()} | Referrer: {c.referrer || "N/A"} | Location: {c.location}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Paper>
  );
}

export default StatsPage;
