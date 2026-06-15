/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  images: {
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizeCss: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Built-By",                 value: "Kaushik Digital" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

module.exports = nextConfig;
