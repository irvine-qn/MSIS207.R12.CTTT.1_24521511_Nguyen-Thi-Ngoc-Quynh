/**
 * Photo contract
 * @typedef {Object} Photo
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} src HTTPS image url provided by the owner
 * @property {string} alt
 * @property {number} width
 * @property {number} height
 */

export const CATEGORIES = ['nature', 'city', 'people'];

/** @type {Photo[]} */
export const PHOTOS = [
  { id: 'nature-mountain', title: 'Mountain Ridge', category: 'nature', src: '/images/nature-mountain.svg', alt: 'Two green mountains under a blue sky with a yellow sun', width: 800, height: 600 },
  { id: 'nature-forest', title: 'Pine Forest', category: 'nature', src: '/images/nature-forest.svg', alt: 'Three dark green pine trees on a grassy field', width: 800, height: 600 },
  { id: 'nature-lake', title: 'Sunset Lake', category: 'nature', src: '/images/nature-lake.svg', alt: 'Orange sun setting over a calm teal lake', width: 800, height: 600 },
  { id: 'city-skyline', title: 'Night Skyline', category: 'city', src: '/images/city-skyline.svg', alt: 'Dark silhouettes of tall buildings under a full moon', width: 800, height: 600 },
  { id: 'city-street', title: 'Downtown Street', category: 'city', src: '/images/city-street.svg', alt: 'Road with yellow lane markings between two grey buildings', width: 800, height: 600 },
  { id: 'city-bridge', title: 'Red Bridge', category: 'city', src: '/images/city-bridge.svg', alt: 'Red suspension bridge spanning a dark blue river', width: 800, height: 600 },
  { id: 'people-portrait', title: 'Portrait', category: 'people', src: '/images/people-portrait.svg', alt: 'Simple silhouette of one person on a pink background', width: 800, height: 600 },
  { id: 'people-group', title: 'Friends', category: 'people', src: '/images/people-group.svg', alt: 'Silhouettes of three people standing together in purple', width: 800, height: 600 },
  { id: 'people-market', title: 'Fruit Market', category: 'people', src: '/images/people-market.svg', alt: 'Market stall with a red awning and colourful fruit', width: 800, height: 600 },
];
