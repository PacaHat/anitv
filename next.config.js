const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  swSrc: 'public/sw.js',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} 
*/
const nextConfig = {
    images: {
        domains: ['s4.anilist.co','artworks.thetvdb.com','media.kitsu.io', 'image.tmdb.org'],
        unoptimized: true
      },
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
    },
  }
   
module.exports = withPWA(nextConfig);