// metro.config.js
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

/** @type {import('expo/metro-config').MetroConfig} */
let config = getSentryExpoConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
