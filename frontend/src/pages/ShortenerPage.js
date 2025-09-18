import { useState } from "react";
import { TextField, Button, Grid, Paper, Typography } from "@mui/material";
import axios from "axios";
import logger, { withLogging } from "../logger";

const API_BASE = "http://localhost:5000";

function ShortenerPage() {
  const [urls, setUrls] = useState([{ url: "", validity: "", shortcode: "" }]);
  const [results, setResults] = useState([]);

  const handleChange = (index, field, value) => {
    const copy = [...urls];
    copy[index][field] = value;
    setUrls(copy);
  };

  const addField = () => {
    if (urls.length < 5) setUrls([...urls, { url: "", validity: "", shortcode: "" }]);
  };

  const validate = (u) => {
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(u.url)) return "Invalid URL";
    if (u.validity && isNaN(parseInt(u.validity))) return "Validity must be integer";
    if (u.shortcode && !/^[a-zA-Z0-9_-]{4,32}$/.test(u.shortcode)) return "Invalid shortcode";
    return null;
  };

  const shortenUrls = withLogging(async () => {
    const payloads = urls.map(u => {
      const error = validate(u);
      if (error) throw new Error(error);
      return {
        url: u.url,
        validity: u.validity ? parseInt(u.validity) : undefined,
        shortcode: u.shortcode || undefined
      };
    });

    const responses = await Promise.all(
      payloads.map(p => axios.post(`${API_BASE}/shorturls`, p))
    );

    setResults(responses.map(r => r.data));
    logger.info({ results: responses.map(r => r.data) }, "Short URLs created");
  }, "shortenUrls");

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Shorten URLs</Typography>
      {urls.map((u, i) => (
        <Grid container spacing={2} key={i} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Long URL"
              value={u.url}
              onChange={(e) => handleChange(i, "url", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth label="Validity (mins)"
              value={u.validity}
              onChange={(e) => handleChange(i, "validity", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Custom Shortcode"
              value={u.shortcode}
              onChange={(e) => handleChange(i, "shortcode", e.target.value)}
            />
          </Grid>
        </Grid>
      ))}
      <Button onClick={addField} disabled={urls.length >= 5}>+ Add URL</Button>
      <Button variant="contained" onClick={shortenUrls} sx={{ ml: 2 }}>Shorten</Button>

      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Typography variant="h6">Results</Typography>
          {results.map((r, i) => (
            <Typography key={i}>
              {r.shortLink} (expires: {new Date(r.expiry).toLocaleString()})
            </Typography>
          ))}
        </div>
      )}
    </Paper>
  );
}

export default ShortenerPage;
