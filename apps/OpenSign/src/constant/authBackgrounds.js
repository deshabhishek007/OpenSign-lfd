// Randomized full-bleed background photos for the Login/Signup pages. Not
// part of upstream OpenSign. Six hand-picked, verified Unsplash gradient
// photos (abstract, on-theme with the indigo/violet accent used elsewhere)
// — hotlinked from Unsplash's own CDN, no API key needed. Picked once per
// page load, not per render, so the form doesn't flicker between them.
const AUTH_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1617957772002-57adde1156fa",
  "https://images.unsplash.com/photo-1615714734856-23c57dac16dd",
  "https://images.unsplash.com/photo-1615715757486-a506c8c596fd",
  "https://images.unsplash.com/photo-1617957743103-310accdfb999",
  "https://images.unsplash.com/photo-1615714880989-1b48c82d8f45",
  "https://images.unsplash.com/photo-1557683304-673a23048d34"
];

export function randomAuthBackground() {
  const base =
    AUTH_BACKGROUNDS[Math.floor(Math.random() * AUTH_BACKGROUNDS.length)];
  return `${base}?w=1920&auto=format&fit=crop&q=80`;
}
