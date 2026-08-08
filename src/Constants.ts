export const Brand: BrandingContainer = {
  Github: {
    Icon: "/public/icons/github.svg",
    Link: "https://github.com/Vicente0670/eshop-anywhere",
    Alt: "Github"
  },
  Shop: {
    Icon: "/public/favicon.svg",
    Alt: "Shop"
  }
}

interface BrandingContainer { [Platform: string]: Branding }

interface Branding {
  Icon: string,
  Link?: string,
  Alt?: string
}