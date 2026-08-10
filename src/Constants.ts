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
  Alert: "Alert-User",
  OffscreenURL: "offscreen.html",
}

interface BrandingContainer { [Platform: string]: Branding }

interface Branding {
  Icon: string,
  Link?: string,
  Alt?: string
}

interface Key { [Message: string]: string }