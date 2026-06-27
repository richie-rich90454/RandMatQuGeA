/// <reference types="vitest" />
import {defineConfig} from "vite";
import {readFileSync} from "fs";
import {join} from "path";
import {visualizer} from "rollup-plugin-visualizer";
let packageJson=JSON.parse(readFileSync(join(__dirname,"package.json"),"utf-8"));
let version=packageJson.version;
export default defineConfig({
	clearScreen: false,
	base: "./",
	test:{
		setupFiles:["./src/vitest.setup.ts"],
		environment:"jsdom",
		testTimeout:10000,
		pool:"forks",
		maxConcurrency:4,
	},
	root: "src",
	publicDir: "../public",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
		assetsDir: "",
		minify: "oxc",
		target: "es2020",
		cssMinify: true,
		cssCodeSplit: true,
		modulePreload: {polyfill: false},
		chunkSizeWarningLimit: 2000
	},
	plugins: [
		{
			name: "inject-version",
			transformIndexHtml(html){
				return html.replace(/__APP_VERSION__/g, version);
			}
		},
		visualizer({open: false, gzipSize: true, brotliSize: true})
	],
	server: {
		host: false,
		port: 1331,
		strictPort: true,
		open: false,
		watch: {
			ignored: ["**/src-tauri/**"]
		}
	},
	preview: {
		host: false,
		port: 1331,
		strictPort: true,
		open: false
	}
});
