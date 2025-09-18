self.addEventListener("install", (event) => {
  console.log("✅ Service Worker تم تثبيته");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => new Response("أنت غير متصل الآن ❌"))
  );
});
