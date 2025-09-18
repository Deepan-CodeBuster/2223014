const shortid = require('shortid');

const MIN_LEN = 4;
const MAX_LEN = 32;
const RE_ALPHANUM = /^[A-Za-z0-9_-]+$/;

function isValidCustom(code) {
  if (!code || typeof code !== 'string') return false;
  const len = code.length;
  if (len < MIN_LEN || len > MAX_LEN) return false;
  return RE_ALPHANUM.test(code);
}

function generateShortcode() {
  // generate a short, URL-friendly id
  // shortid generates around 7-10 chars; you can adjust if you want longer
  return shortid.generate();
}

module.exports = { isValidCustom, generateShortcode };
