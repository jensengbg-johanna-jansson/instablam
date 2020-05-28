self.addEventListener('install', event => {
    console.log('sw installd at: ', new Date().toLocaleTimeString);
    
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll(['index.html',
                                'css/styles.css',
                                'js/index.js',
                                'js/filters.js',
                                'offline.html'])
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('activated at: ', new Date().toLocaleTimeString);
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            if (!navigator.onLine) {
                console.log('You are offline');
                if (response) { 
                    console.log('Cached page found')
                    return response;
                } else {
                    console.log('Error 404: page not found')
                    return caches.match(new Request('offline.html'));
                }
            } else {
                return updateCache(event.request);
            }
        })
    )
});

async function updateCache(request) {
    return fetch(request)
    .then((response) => {
        if(response) {
            return caches.open('v1')
            .then((cache) => {
                return cache.put(request, response.clone())
                .then(() => {
                    return response;
                })
            });
        }
    })
}
