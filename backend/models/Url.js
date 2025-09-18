// models/Url.js
const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String },
  ip: { type: String },
  location: { type: String } // coarse-grained location (e.g., "India", "US")
});

const UrlSchema = new mongoose.Schema({
  shortcode: { type: String, required: true, unique: true, index: true },
  longUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, required: true },
  clicks: { type: Number, default: 0 },
  clickData: [ClickSchema]
});

UrlSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', UrlSchema);
