const PRECACHE_URLS=[
    "/",
    "/index.html",
    "/style.css",
    "/katex.min.css",
    "/katex.min.js",
    "/auto-render.min.js",
    "/mathjax/tex-chtml.js",
    "/mathjax/startup.js",
    "/mathjax/loader.js",
    "/mathjax/core.js",
    "/mathjax/output/chtml.js",
    "/mathjax/output/chtml/fonts/tex.js",
    "/mathjax/input/tex.js",
    "/mathjax/input/tex-base.js",
    "/mathjax/adaptors/liteDOM.js",
    "/mathjax/sre/mathmaps/base.json",
    "/mathjax/sre/mathmaps/en.json",
    "/LibertinusMath-Regular.ttf",
    "/NotoSans-VariableFont_wdth_wght.ttf",
    "/OpenDyslexic-Regular.woff2",
    "/favicon.png"
];
const PRECACHE="precache-v1";
self.addEventListener("install",(event)=>{
    event.waitUntil(
        caches.open(PRECACHE).then((cache)=>{
            return cache.addAll(PRECACHE_URLS);
        })
    );
});
self.addEventListener("activate",(event)=>{
    event.waitUntil(
        caches.keys().then((cacheNames)=>{
            return Promise.all(
                cacheNames.filter((cacheName)=>{
                    return cacheName.startsWith("precache-")&&cacheName!==PRECACHE;
                }).map((cacheName)=>{
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
self.addEventListener("fetch",(event)=>{
    event.respondWith(
        caches.match(event.request).then((response)=>{
            return response||fetch(event.request);
        })
    );
});
