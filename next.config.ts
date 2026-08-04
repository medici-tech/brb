import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Next.js 16.3+ rewrites AGENTS.md in place when it detects a coding agent,
  // appending its own managed rules block. AGENTS.md is this repository's single
  // source of truth and is authored deliberately, so it is not a file a build
  // tool gets to edit. The advice in that block is sound, so it is restated in
  // the maintainer's own words in AGENTS.md § React and Next.js Rules instead.
  agentRules: false,
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
