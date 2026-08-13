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

interface MusicContainer {
  Title: string,
  URL: string
}

export const Websites: string[] = [
  "https://*.amazon.com/*",
  "ebay.com"
]

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