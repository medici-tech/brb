import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  webpack: (config, { dev, webpack }) => {
    if (!dev) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /ControlRoomPreview$/,
          path.resolve(
            process.cwd(),
            "src/components/brb/control-room/ControlRoomPreview.production.tsx",
          ),
        ),
      );
    }

    return config;
  },
};

export default nextConfig;
