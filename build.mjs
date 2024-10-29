import esbuild from "esbuild";

const commonConfig = {
  entryPoints: ["src/index.js"], // Your main JavaScript file that imports the others
  bundle: true, // Bundle all dependencies into a single file
  format: "esm", // Use ES modules format
  sourcemap: true, // Generate source maps for debugging
  target: ["es2020"], // Target browser compatibility
};

async function build() {
  try {
    // Production (minified) build
    await esbuild.build({
      ...commonConfig,
      outfile: "dist/jsjiit.min.esm.js",
      minify: true,
    });
    console.log("✅ Production build complete");

    // Development (unminified) build
    await esbuild.build({
      ...commonConfig,
      outfile: "dist/jsjiit.esm.js",
      minify: false,
    });
    console.log("✅ Development build complete");

    console.log("🎉 All builds completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();
