export const Brand: BrandingContainer = {
  Github: {
    Icon: "/icons/github.svg",
    Link: "https://github.com/Vicente0670/eshop-anywhere",
    Alt: "Github"
  },
  Shop: {
    Icon: "/favicon.svg",
    Alt: "Shop"
  }
}

export const Keys: Key = {
  Start: "start-audio",
  OffscreenURL: "offscreen.html",
}

export const MusicUrlBase = "https://jetta.vgmtreasurechest.com/soundtracks/nintendo-eshop-original-soundtrack-2011-2017/";
export const MusicUrl: string[] = [
  "jcngtauz/23.%20May%202019%20%283DS%20%26%20Wii%20U%29.mp3",
  "nszuxegq/16.%20July%202014%20%283DS%20%26%20Wii%20U%29.mp3"
]

export const Websites: string[] = [
  "https://*.amazon.com/*",
  "ebay.com"
]

interface BrandingContainer {
  [Platform: string]: Branding
}

interface Branding {
  Icon: string,
  Link?: string,
  Alt?: string
}

interface Key {
  [Message: string]: string
}