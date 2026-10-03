const PRECACHE="precache-v3.1.0";
const RUNTIME="runtime-v3.1.0";
const PRECACHE_URLS=[
	".",
	"index.html",
	"manifest.webmanifest",
	"katex.min.css",
	"katex.min.js",
	"mathjax/tex-chtml.js",
	"LibertinusMath-Regular.ttf",
	"NotoSans-VariableFont_wdth_wght.ttf",
	"OpenDyslexic-Regular.woff2",
	"favicon.png",
	"favicon.ico",
	"apple-touch-icon.png",
	"fonts/KaTeX_AMS-Regular.woff2",
	"fonts/KaTeX_Caligraphic-Bold.woff2",
	"fonts/KaTeX_Caligraphic-Regular.woff2",
	"fonts/KaTeX_Fraktur-Bold.woff2",
	"fonts/KaTeX_Fraktur-Regular.woff2",
	"fonts/KaTeX_Main-Bold.woff2",
	"fonts/KaTeX_Main-BoldItalic.woff2",
	"fonts/KaTeX_Main-Italic.woff2",
	"fonts/KaTeX_Main-Regular.woff2",
	"fonts/KaTeX_Math-BoldItalic.woff2",
	"fonts/KaTeX_Math-Italic.woff2",
	"fonts/KaTeX_SansSerif-Bold.woff2",
	"fonts/KaTeX_SansSerif-Italic.woff2",
	"fonts/KaTeX_SansSerif-Regular.woff2",
	"fonts/KaTeX_Script-Regular.woff2",
	"fonts/KaTeX_Size1-Regular.woff2",
	"fonts/KaTeX_Size2-Regular.woff2",
	"fonts/KaTeX_Size3-Regular.woff2",
	"fonts/KaTeX_Size4-Regular.woff2",
	"fonts/KaTeX_Typewriter-Regular.woff2",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_AMS-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Calligraphic-Bold.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Calligraphic-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Fraktur-Bold.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Fraktur-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Main-Bold.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Main-Italic.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Main-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Math-BoldItalic.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Math-Italic.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Math-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_SansSerif-Bold.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_SansSerif-Italic.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_SansSerif-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Script-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Size1-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Size2-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Size3-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Size4-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Typewriter-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Vector-Bold.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Vector-Regular.woff",
	"mathjax/output/chtml/fonts/woff-v2/MathJax_Zero.woff",
	"mathjax/input/tex/extensions/action.js",
	"mathjax/input/tex/extensions/all-packages.js",
	"mathjax/input/tex/extensions/ams.js",
	"mathjax/input/tex/extensions/autoload.js",
	"mathjax/input/tex/extensions/bbox.js",
	"mathjax/input/tex/extensions/boldsymbol.js",
	"mathjax/input/tex/extensions/color.js",
	"mathjax/input/tex/extensions/gensymb.js",
	"mathjax/input/tex/extensions/html.js",
	"mathjax/input/tex/extensions/newcommand.js",
	"mathjax/input/tex/extensions/noerrors.js",
	"mathjax/input/tex/extensions/noundefined.js",
	"mathjax/input/tex/extensions/physics.js",
	"mathjax/input/tex/extensions/require.js",
	"mathjax/input/tex/extensions/unicode.js"
];
self.addEventListener("install",(event)=>{
	event.waitUntil(
		caches.open(PRECACHE).then((cache)=>{
			const baseUrl=self.registration.scope;
			const absoluteUrls=PRECACHE_URLS.map((url)=>new URL(url, baseUrl).href);
			return cache.addAll(absoluteUrls).catch(()=>{
				return Promise.allSettled(absoluteUrls.map((url)=>{
					return cache.add(url);
				}));
			}).then(()=>{
				return self.skipWaiting();
			});
		})
	);
});
self.addEventListener("activate",(event)=>{
	event.waitUntil(
		caches.keys().then((cacheNames)=>{
			return Promise.all(
				cacheNames.filter((cacheName)=>{
					return (cacheName.startsWith("precache-")||cacheName.startsWith("runtime-"))&&cacheName!==PRECACHE&&cacheName!==RUNTIME;
				}).map((cacheName)=>{
					return caches.delete(cacheName);
				})
			);
		}).then(()=>{
			return self.clients.claim();
		})
	);
});
self.addEventListener("fetch",(event)=>{
	if (event.request.method!=="GET"){
		return;
	}
	let sameOrigin=false;
	try {
		sameOrigin=new URL(event.request.url).origin===self.location.origin;
	}
	catch (e){
		sameOrigin=false;
	}
	if (!sameOrigin){
		return;
	}
	// Navigation (HTML) requests: network-first so rebuilt bundles are always
	// picked up, with a cached fallback for offline use.
	if (event.request.mode==="navigate"){
		event.respondWith(
			fetch(event.request).then((r)=>{
				if (r&&r.ok){
					const copy=r.clone();
					caches.open(RUNTIME).then((cache)=>{
						cache.put(event.request, copy);
					}).catch(()=>{});
				}
				return r;
			}).catch(()=>{
				return caches.match(event.request).then((c)=>{
					return c||caches.match(new URL("index.html", self.registration.scope)).then((h)=>h||Response.error());
				});
			})
		);
		return;
	}
	event.respondWith(
		caches.match(event.request).then((cached)=>{
			if (cached){
				fetch(event.request).then((r)=>{
					if (r&&r.ok){
						caches.open(RUNTIME).then((cache)=>{
							cache.put(event.request, r.clone());
						}).catch(()=>{});
					}
				}).catch(()=>{});
				return cached;
			}
			return fetch(event.request).then((r)=>{
				// A response that claims success but carries the wrong content type is
				// not a success. A server configured to fall back to index.html answers
				// a missing chunk with HTML, and caching that under the chunk's URL
				// poisons the cache permanently: the failure survives the rebuild that
				// would otherwise have fixed it, and every later load fails the same
				// way. So the type is checked before anything is stored.
				if (r&&r.ok&&isUsableAsset(event.request,r)){
					caches.open(RUNTIME).then((cache)=>{
						cache.put(event.request, r.clone());
					}).catch(()=>{});
				}
				return r;
		}).catch(()=>{
			// The shell is the fallback for a navigation, which is what makes an
			// installed app open when the network is gone. It is never the answer to a
			// request for a script: the browser would report a MIME type error and name
			// neither the missing file nor the reason, and the application would lose
			// one subject's generators at the moment a learner asks for a question. A
			// 404 says what happened.
			if (event.request.mode==="navigate"){
				return caches.match(new URL("index.html", self.registration.scope)).then((r)=>r||Response.error());
			}
			return new Response("Not found: "+event.request.url, {
				status:404,
				headers:{"Content-Type":"text/plain"}
			});
		});
	})
	);
});
/**
 * Reports whether a response may be stored for an asset request.
 *
 * @param {Request} request - The request being answered.
 * @param {Response} response - The response the network gave.
 * @returns {boolean} True when the response is safe to cache.
 */
function isUsableAsset(request, response){
	const type=response.headers.get("Content-Type")||"";
	const wantsScript=(request.url.endsWith(".js")||request.url.endsWith(".mjs"));
	if (wantsScript&&type.indexOf("javascript")<0) return false;
	if (request.url.endsWith(".css")&&type.indexOf("css")<0) return false;
	return true;
}
// A request the cache cannot satisfy falls back to the shell, which is what makes
// an installed app open when the network is gone rather than showing the browser's
// own error page inside a window that looks like the app.
self.addEventListener("message",(event)=>{
	if (event.data==="skip-waiting"){
		self.skipWaiting();
	}
});
