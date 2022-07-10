const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	images: {
		domains: ['raw.githubusercontent.com', 'assets.coingecko.com'],
	},
	webpack5: true,
	webpack: config => {
		config.resolve.fallback = { fs: false };
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack'],
		});

		return config;
	},
};

module.exports = nextConfig;
