import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.js"], // Your main JavaScript file that imports the others
    bundle: true, // Bundle all dependencies into a single file
    outfile: "dist/jsjiit.esm.js", // Output file
    format: "esm", // Use ES modules format
    minify: false, // Minify the output
    sourcemap: true, // Generate source maps for debugging
    target: ["es2020"], // Target browser compatibility
  })
  .catch(() => process.exit(1));
