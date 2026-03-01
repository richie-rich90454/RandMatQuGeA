import {defineConfig} from "vite";
import {createHtmlPlugin} from "vite-plugin-html";
import {readFileSync} from "fs";
import {join} from "path";

let packageJson=JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8"));
let version=packageJson.version;

export default defineConfig({
    root: "src",
    publicDir: "../public",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        assetsDir: "assets",
        minify: "esbuild",
        cssMinify: true,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks(id){
                    if (id.includes("node_modules")){
                        let parts=id.split("node_modules/")[1];
                        let topLevel=parts.split("/")[0];
                        if (topLevel.startsWith("@")){
                            let scoped=topLevel+"/"+parts.split("/")[1];
                            return `vendor-${scoped.replace("@", "")}`;
                        }
                        if (topLevel=="three"||topLevel=="mathjs"){
                            return `vendor-${topLevel}`;
                        }
                        return "vendor-other";
                    }
                },
            },
        },
    },
    plugins: [
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    version,
                },
            },
        }),
    ],
    server: {
        port: 1331,
        open: false
    },
    preview: {
        port: 1331,
        open: false
    }
});