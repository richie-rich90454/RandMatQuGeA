import {defineConfig} from "vite";
import {readFileSync} from "fs";
import {join} from "path";

let packageJson=JSON.parse(readFileSync(join(__dirname,"package.json"),"utf-8"));
let version=packageJson.version;

export default defineConfig({
	root: "src",
	publicDir: "../public",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
		assetsDir: "assets",
		minify: "oxc",
		target: "es2020",
		cssMinify: true,
		chunkSizeWarningLimit: 2000,
		rolldownOptions: {
			output: {
				codeSplitting: true,
				manualChunks(id){
					if (id.includes("node_modules")){
						if (id.includes("node_modules/mathjs/")){
							let parts=id.split("node_modules/mathjs/")[1].split("/");
							return `vendor-mathjs-${parts[0]}`;
						}
						let parts=id.split("node_modules/")[1].split("/");
						let topLevel=parts[0];
						if (topLevel.startsWith("@")){
							let scoped=`${topLevel}/${parts[1]}`;
							return `vendor-${scoped.replace("@","")}`;
						}
						if (["three"].includes(topLevel)){
							return `vendor-${topLevel}`;
						}
						return "vendor-other";
					}
				}
			}
		}
	},
	plugins: [
		{
			name: "inject-version",
			transformIndexHtml(html){
				return html.replace(/__APP_VERSION__/g, version);
			}
		}
	],
	server: {
		host: "::",
		port: 1331,
		open: false
	},
	preview: {
		host: "::",
		port: 1331,
		open: false
	}
});