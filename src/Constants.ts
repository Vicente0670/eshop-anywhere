import type { Setting } from "./Settings";

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
  OffscreenURL: "offscreen.html"
}

interface Key {
  [Message: string]: string
}

export const MusicURLBase = "https://jetta.vgmtreasurechest.com/soundtracks/nintendo-eshop-original-soundtrack-2011-2017/";
export const MusicURL: MusicContainer[] = [
  {
    Title: "June 2011 (3DS)",
    Console: ["3ds"],
    URL: "ewujnkop/08.%20June%202011%20%283DS%29.mp3",
  },
  {
    Title: "November 2012 (Wii U)",
    Console: ["wiiu"],
    URL: "sqaewuhc/11.%20November%202012%20%28Wii%20U%29.mp3",
  },
  {
    Title: "September 2013 (Wii U)",
    Console: ["wiiu"],
    URL: "psusgecz/12.%20September%202013%20%28Wii%20U%29.mp3",
  },
  {
    Title: "December 2013 (Wii U)",
    Console: ["wiiu"],
    URL: "oyywmupm/13.%20December%202013%20%28Wii%20U%29.mp3",
  },
  {
    Title: "January 2014 (Wii U)",
    Console: ["wiiu"],
    URL: "tgybjtqy/14.%20January%202014%20%28Wii%20U%29.mp3",
  },
  {
    Title: "April 2014 (Wii U)",
    Console: ["wiiu"],
    URL: "vgvkmdji/15.%20April%202014%20%28Wii%20U%29.mp3",
  },
  {
    Title: "July 2014 (3DS & Wii U)",
    Console: ["3ds", "wiiu"],
    URL: "nszuxegq/16.%20July%202014%20%283DS%20%26%20Wii%20U%29.mp3",
  },
  {
    Title: "January 2015 (3DS & Wii U)",
    Console: ["3ds", "wiiu"],
    URL: "kcijuury/17.%20January%202015%20%283DS%20%26%20Wii%20U%29.mp3",
  },
  {
    Title: "June 2015 (3DS & Wii U)",
    Console: ["3ds", "wiiu"],
    URL: "rqdvqsrf/18.%20June%202015%20%283DS%20%26%20Wii%20U%29.mp3",
  },
  {
    Title: "September 2015 (3DS & Wii U)",
    Console: ["3ds", "wiiu"],
    URL: "dyiuxgnw/19.%20September%202015%20%283DS%20%26%20Wii%20U%29.mp3",
  },
  {
    Title: "December 2015 (3DS & Wii U)",
    Console: ["3ds", "wiiu"],
    URL: "tdmxffnx/20.%20December%202015%20%283DS%20%26%20Wii%20U%29.mp3",
  },
  {
    Title: "January 2016 (3DS & Wii U)",
    Console: ["3ds", "wiiu"],
    URL: "xxueoiwk/21.%20January%202016%20%283DS%20%26%20Wii%20U%29.mp3",
  },
  {
    Title: "May 2016 (3DS & Wii U)",
    Console: ["3ds", "wiiu"],
    URL: "imlsikaw/22.%20May%202016%20%283DS%20%26%20Wii%20U%29.mp3",
  },
  {
    Title: "May 2019 (3DS & Wii U)",
    Console: ["3ds", "wiiu"],
    URL: "jcngtauz/23.%20May%202019%20%283DS%20%26%20Wii%20U%29.mp3",
  }
];

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
];

export const WishlistPaths: string[] = [

];

export const SettingsPaths: string[] = [

];

export interface Message {
  Type: string,
  Value?: Setting,
  Event?: string,
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

interface MusicContainer {
  Title: string,
  Console: ConsoleTypes[],
  URL: string
}

type ConsoleTypes = "3ds" | "dsi" | "wii" | "wiiu";

export function compareArrays<T>(x: T[], y: typeof x): boolean {
  if (x.length !== y.length)
    return false;

  const z = new Set(y);
  x.forEach((e) => {
    if (!z.has(e))
      return false;
  })

  return true;
}