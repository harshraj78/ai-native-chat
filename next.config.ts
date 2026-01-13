import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* config options here */
  // reactCompiler: true, // Disabled to rule out stability issues
  serverExternalPackages: ['pdfjs-dist'], // Ensure it's not bundled securely
};

export default nextConfig;
