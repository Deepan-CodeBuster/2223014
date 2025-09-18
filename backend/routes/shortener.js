const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const geoip = require('geoip-lite');
const Url = require('../models/Url');
const { isValidCustom, generateShortcode } = require('../utils/shortcode');

const DEFAULT_MINUTES = 30;

function computeExpireAt(minutes) {
  const m = Math.max(1, Math.floor(Number(minutes) || 0));
  return new Date(Date.now() + m * 60000);
}

//Post Method
router.post('/shorturls', async (req, res, next) => {
  const { url, validity, shortcode } = req.body;
  const log = req.log;

  try {
    log.info({ body: req.body }, 'Create request received');

    if (!url || typeof url !== 'string' || !validUrl.isUri(url)) {
      return res.status(400).json({ error: 'Invalid URL. Provide a valid http/https URL.' });
    }

    const expireAt = computeExpireAt(validity || DEFAULT_MINUTES);

    let codeToUse;
    if (shortcode) {
      if (!isValidCustom(shortcode)) {
        return res.status(400).json({ error: 'Invalid shortcode. Must be alphanumeric (dash/underscore allowed), length 4–32.' });
      }
      const exists = await Url.findOne({ shortcode }).exec();
      if (exists) {
        return res.status(409).json({ error: 'Shortcode already in use.' });
      }
      codeToUse = shortcode;
    } else {
      let attempts = 0;
      do {
        codeToUse = generateShortcode();
        const exists = await Url.findOne({ shortcode: codeToUse }).exec();
        if (!exists) break;
        attempts++;
      } while (attempts < 5);
    }

    const urlDoc = new Url({
      shortcode: codeToUse,
      longUrl: url,
      expireAt
    });
    await urlDoc.save();

    const shortLink = `${req.protocol}://${req.get('host')}/${codeToUse}`;

    return res.status(201).json({
      shortLink,
      expiry: expireAt
    });
  } catch (err) {
    next(err);
  }
});

//Redirect Method

router.get('/:shortcode', async (req, res, next) => {
  const { shortcode } = req.params;

  try {
    const urlDoc = await Url.findOne({ shortcode }).exec();

    if (!urlDoc) {
      return res.status(404).json({ error: 'Shortcode not found' });
    }

    if (urlDoc.expireAt && new Date(urlDoc.expireAt).getTime() <= Date.now()) {
      return res.status(410).json({ error: 'Shortcode has expired' });
    }

    const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const referrer = req.get('referer') || null;

    const geoInfo = geoip.lookup(requestIp);
    let geo = geoInfo ? geoInfo.country : "Unknown";

    urlDoc.clicks += 1;
    urlDoc.clickData.push({
      timestamp: new Date(),
      referrer,
      ip: requestIp,
      location: geo
    });

    await urlDoc.save();

    return res.redirect(urlDoc.longUrl);
  } catch (err) {
    next(err);
  }
});

//Get Method
router.get('/shorturls/:shortcode', async (req, res, next) => {
  const { shortcode } = req.params;

  try {
    const urlDoc = await Url.findOne({ shortcode }).lean().exec();

    if (!urlDoc) {
      return res.status(404).json({ error: 'Shortcode not found' });
    }

    if (urlDoc.expireAt && new Date(urlDoc.expireAt).getTime() <= Date.now()) {
      return res.status(410).json({ error: 'Shortcode has expired' });
    }

    const stats = {
      shortcode: urlDoc.shortcode,
      originalUrl: urlDoc.longUrl,
      createdAt: urlDoc.createdAt,
      expiry: urlDoc.expireAt,
      totalClicks: urlDoc.clicks,
      clicks: urlDoc.clickData.map(c => ({
        timestamp: c.timestamp,
        referrer: c.referrer,
        location: c.location
      }))
    };

    return res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
