import { defineConfig } from "vitepress";

export default defineConfig({
    title: "RandMatQuGeA",
    description: "Random math question generator — 134+ topics across 7 subjects",
    base: "/",
    lang: "en-US",
    themeConfig: {
        nav: [
            { text: "Home", link: "/" },
            { text: "Guide", link: "/guide/getting-started" },
            { text: "API", link: "/api/" },
            { text: "Contributing", link: "/contributing" },
        ],
        sidebar: [
            {
                text: "Guide",
                items: [
                    { text: "Getting Started", link: "/guide/getting-started" },
                    { text: "Architecture", link: "/guide/architecture" },
                    { text: "Usage", link: "/guide/usage" },
                ],
            },
            {
                text: "API Reference",
                items: [
                    { text: "Overview", link: "/api/" },
                ],
            },
            {
                text: "Project",
                items: [
                    { text: "Contributing", link: "/contributing" },
                ],
            },
        ],
        search: { provider: "local" },
        editLink: {
            pattern: "https://github.com/richie-rich90454/RandMatQuGeA/edit/main/docs/:path",
            text: "Edit this page on GitHub",
        },
        socialLinks: [
            { icon: "github", link: "https://github.com/richie-rich90454/RandMatQuGeA" },
        ],
    },
});
