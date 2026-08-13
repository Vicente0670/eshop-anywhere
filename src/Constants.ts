// Shows more logs than is supposed to if true
export const IsDev = false;

export const Brand: BrandingContainer = {
  Shop: {
    Icon: "/favicon.svg",
    Alt: "Shop",
    CanVisit: false
  },
  Github: {
    Icon: "/platforms/github.svg",
    Link: "https://github.com/Vicente0670/eshop-anywhere",
    Alt: "Github"
  },
  Khinsider: {
    Icon: "/platforms/khinsider.svg",
    Link: "https://downloads.khinsider.com/game-soundtracks/album/nintendo-eshop-original-soundtrack-2011-2017",
    Alt: "Khinsider"
  }
}

export const Keys: Key = {
  Start: "start-audio",
  OffscreenURL: "offscreen.html"
}

export const MusicURLBase = "https://jetta.vgmtreasurechest.com/soundtracks/nintendo-eshop-original-soundtrack-2011-2017/";
export const MusicURL: MusicContainer[] = [
  {
    Title: "something",
    URL: "nszuxegq/16.%20July%202014%20%283DS%20%26%20Wii%20U%29.mp3"
  },
  {
    Title: "something2",
    URL: "jcngtauz/23.%20May%202019%20%283DS%20%26%20Wii%20U%29.mp3"
  },
]

export const UserOptionsDefault: UserOptions = {
  Continuous: true,
  Effects: true,
  Volume: 1/3,
}

export const Websites: string[] = [
  "https://*.amazon.ae/*", // United Arab Emirates
  "https://*.amazon.ca/*", // Canada
  "https://*.amazon.co.jp/*", // Japan
  "https://*.amazon.co.uk/*", // UK
  "https://*.amazon.co.za/*", // South Africa
  "https://*.amazon.com/*", // US
  "https://*.amazon.com.au/*", // Australia
  "https://*.amazon.com.be/*", // Belgium
  "https://*.amazon.com.br/*", // Brazil
  "https://*.amazon.com.mx/*", // Mexico
  "https://*.amazon.com.tr/*", // Turkey
  "https://*.amazon.de/*", // Germany
  "https://*.amazon.eg/*", // Egypt
  "https://*.amazon.es/*", // Spain
  "https://*.amazon.fr/*", // France
  "https://*.amazon.ie/*", // Ireland
  "https://*.amazon.in/*", // India
  "https://*.amazon.it/*", // Italy
  "https://*.amazon.nl/*", // Netherlands
  "https://*.amazon.pl/*", // Poland
  "https://*.amazon.sa/*", // Saudi Arabia
  "https://*.amazon.sg/*", // Singapore
]

export interface UserOptions {
  Continuous?: boolean,
  Effects?: boolean,
  MusicBlacklist?: string[],
  MusicWhitelist?: string[],
  Muted?: boolean;
  SiteBlacklist?: string[],
  SiteWhitelist?: string[],
  Volume?: number,
}

interface BrandingContainer {
  [Platform: string]: Branding
}

interface Branding {
  Alt?: string,
  CanVisit?: boolean
  Icon: string,
  Link?: string,
}

interface Key {
  [Message: string]: string
}

interface MusicContainer {
  Title: string,
  URL: string
}