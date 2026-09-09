import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  turbopack: {}, // acknowledges Turbopack is in use for dev
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);