'use strict';

// Every piece of business copy lives here. Editing the site's wording never
// requires touching a route or a template.

module.exports = {
  name: 'Tsai-Friedericks',
  tagline: 'Film and video production',
  description:
    'Tsai-Friedericks is a film and video production company making commercials, ' +
    'music videos and documentary work from concept through to final grade.',

  contact: {
    email: 'hello@tsai-friedericks.com',
    phone: '+1 (555) 014-8820',
    address: 'Studio 4, 118 Fremont Ave',
  },

  social: [
    { label: 'Instagram', url: 'https://instagram.com/' },
    { label: 'Vimeo', url: 'https://vimeo.com/' },
    { label: 'LinkedIn', url: 'https://linkedin.com/' },
  ],

  nav: [
    { label: 'Work', href: '/work' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],

  home: {
    heroTitle: 'We make films that hold attention.',
    heroSubtitle:
      'A production company for brands, artists and storytellers — from first treatment to final grade.',
    reelEmbed: 'https://player.vimeo.com/video/76979871',
    intro:
      'We are a small crew that takes on a small number of projects a year. That keeps the ' +
      'people who pitched your film on set shooting it, and in the suite finishing it.',
    stats: [
      { value: '60+', label: 'Films delivered' },
      { value: '12', label: 'Years working' },
      { value: '4', label: 'Continents shot on' },
    ],
  },

  services: [
    {
      title: 'Commercials',
      body:
        'Brand films and campaign work, from single hero spots to full cutdown packages ' +
        'for broadcast, cinema and social.',
      includes: ['Concept and treatment', 'Casting and location scouting', 'Production', 'Edit, grade and sound'],
    },
    {
      title: 'Music videos',
      body:
        'Performance and narrative promos built around the track, made to survive the ' +
        'budget rather than pretend it is bigger than it is.',
      includes: ['Treatment and pitch', 'Shoot', 'Offline and online edit', 'Colour and delivery'],
    },
    {
      title: 'Documentary',
      body:
        'Short and long form documentary, including brand documentary and impact films ' +
        'for organisations with a story worth the time.',
      includes: ['Research and access', 'Field production', 'Story edit', 'Archive and licensing'],
    },
    {
      title: 'Post production',
      body:
        'Finishing for work we did not shoot: offline edit, colour, sound mix and ' +
        'delivery to broadcast specification.',
      includes: ['Offline and online', 'Colour grade', 'Sound design and mix', 'Deliverables'],
    },
  ],

  about: {
    lead: 'Two directors, one crew, and a stubborn preference for doing fewer things properly.',
    body: [
      'Tsai-Friedericks was founded to work the way its founders actually wanted to work: ' +
        'small teams, long relationships, and enough time in prep that the shoot day is calm.',
      'We take on a limited slate each year. That means we say no to good projects, and it ' +
        'means the people you meet in the pitch are the people on set and in the grade.',
      'We work with agencies, labels, and directly with brands and organisations. If you are ' +
        'not sure which of those you are, that is fine — start with the contact form.',
    ],
    team: [
      { name: 'M. Tsai', role: 'Director / Founder' },
      { name: 'L. Friedericks', role: 'Director / Founder' },
      { name: 'Production office', role: 'Scheduling and budgets' },
    ],
  },
};
