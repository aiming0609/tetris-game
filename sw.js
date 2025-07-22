const CACHE_NAME = "tetris-game-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  // 图标文件将在创建后添加
];

// 安装Service Worker并缓存所有资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("缓存已打开");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // 强制新的Service Worker立即激活，不等待旧的关闭
        return self.skipWaiting();
      })
  );
});

// 激活Service Worker并清除旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("删除旧缓存:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 确保Service Worker控制所有客户端页面
        return self.clients.claim();
      })
  );
});

// 拦截网络请求并从缓存中提供资源
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // 如果在缓存中找到匹配的资源，则返回缓存的版本
        if (response) {
          return response;
        }

        // 否则尝试从网络获取资源
        return fetch(event.request).then((networkResponse) => {
          // 检查是否收到有效响应
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // 克隆响应，因为响应是流，只能使用一次
          const responseToCache = networkResponse.clone();

          // 将新资源添加到缓存
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
      .catch(() => {
        // 如果网络请求失败且缓存中没有匹配项，可以返回一个离线页面
        // 这里简单返回，实际应用中可能需要更复杂的处理
        console.log("网络请求失败且缓存中无匹配项");
      })
  );
});
