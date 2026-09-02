'use strict';

// Portfolio entries. Adding work is a code change plus a deploy — this was the
// agreed scope. If it becomes tedious, the upgrade is to move this array into a
// database table and add admin screens; nothing outside this file assumes an
// array, so that change stays contained.
//
// `slug` must be unique and URL safe. `cover` points at a file in public/img.

module.exports = [
  {
    slug: 'northbound',
    title: 'Northbound',
    client: 'Meridian Outdoor',
    category: 'Commercial',
    year: 2025,
    role: 'Production, edit, grade',
    summary: 'A 60 second brand film shot over four days on the Icelandic ring road.',
    body:
      'Meridian wanted a campaign film that did not look like every other outdoor brand. ' +
      'We shot handheld on location with a crew of six, cutting a 60 second hero and nine ' +
      'social variants from the same three day shoot.',
    embed: 'https://player.vimeo.com/video/76979871',
    cover: '/img/placeholder-1.svg',
    featured: true,
  },
  {
    slug: 'low-tide',
    title: 'Low Tide',
    client: 'Hana Okonkwo',
    category: 'Music video',
    year: 2025,
    role: 'Direction, production, post',
    summary: 'Single take performance promo shot at dawn on a tidal causeway.',
    body:
      'One location, one take, one hour of usable light. The entire video is the eleventh ' +
      'attempt, shot on the morning the tide and the weather finally agreed.',
    embed: 'https://player.vimeo.com/video/76979871',
    cover: '/img/placeholder-2.svg',
    featured: true,
  },
  {
    slug: 'the-long-count',
    title: 'The Long Count',
    client: 'Independent',
    category: 'Documentary',
    year: 2024,
    role: 'Field production, story edit',
    summary: 'A 28 minute documentary following a boxing gym through its final season.',
    body:
      'Eighteen months of access to a gym scheduled for demolition. Cut from roughly 90 ' +
      'hours of material into a festival length short.',
    embed: 'https://player.vimeo.com/video/76979871',
    cover: '/img/placeholder-3.svg',
    featured: true,
  },
  {
    slug: 'first-light',
    title: 'First Light',
    client: 'Calder Group',
    category: 'Corporate / brand',
    year: 2024,
    role: 'Production, post',
    summary: 'Internal launch film for a 4,000 person organisation.',
    body:
      'Interviews across six sites in three countries, delivered as one launch film and ' +
      'six regional cuts, all finished to broadcast specification.',
    embed: 'https://player.vimeo.com/video/76979871',
    cover: '/img/placeholder-4.svg',
    featured: false,
  },
  {
    slug: 'salt-and-iron',
    title: 'Salt and Iron',
    client: 'Verano Spirits',
    category: 'Commercial',
    year: 2023,
    role: 'Direction, production, grade',
    summary: 'Product film for a coastal distillery, shot entirely in available light.',
    body:
      'No lighting package, no studio, one macro lens and a rigid rule that nothing in ' +
      'frame would be staged. Delivered as a 45 second spot and a stills set.',
    embed: 'https://player.vimeo.com/video/76979871',
    cover: '/img/placeholder-5.svg',
    featured: false,
  },
  {
    slug: 'carriageway',
    title: 'Carriageway',
    client: 'Transit Authority',
    category: 'Documentary',
    year: 2023,
    role: 'Production, edit',
    summary: 'Six part series on the people who keep a motorway network running overnight.',
    body:
      'Filmed across eleven night shifts. The brief was a safety film; what came back was ' +
      'a portrait series, and the client ran it as one.',
    embed: 'https://player.vimeo.com/video/76979871',
    cover: '/img/placeholder-6.svg',
    featured: false,
  },
];
