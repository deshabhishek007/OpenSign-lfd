// Randomized full-bleed background photos for the Login/Signup pages. Not
// part of upstream OpenSign. Six hand-picked, verified Unsplash photos of
// contract/document signing — on-theme for an e-signature product, swapped
// in for the earlier abstract-gradient set — hotlinked from Unsplash's own
// CDN, no API key needed. Picked once per page load, not per render, so
// the form doesn't flicker between them.
const AUTH_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1627514580923-0d6bc1632925", // pen signing, dark desk
  "https://images.unsplash.com/photo-1564846824172-dee7b0a26785", // signing a legal form, leather desk
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85", // classic pen-on-contract close-up
  "https://images.unsplash.com/photo-1562564055-71e051d33c19", // reviewing documents, bright office
  "https://images.unsplash.com/photo-1603796846097-bee99e4a601f", // signing, warm wood table
  "https://images.unsplash.com/photo-1627518788331-b3b7fdaa382f" // signing a contract, sunlit desk
];

export function randomAuthBackground() {
  const base =
    AUTH_BACKGROUNDS[Math.floor(Math.random() * AUTH_BACKGROUNDS.length)];
  return `${base}?w=1920&auto=format&fit=crop&q=80`;
}
