export const siteConfig = {
  name: "Typeform Clone",
  description:
    "A beautiful form builder inspired by Typeform, built with Next.js and modern web technologies.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/your-repo/typeform-clone",
  },
};

export type SiteConfig = typeof siteConfig;
