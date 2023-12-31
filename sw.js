;
//asignar un nombre y versión al cache
const CACHE_NAME = 'v1_cache_pokedex',
  urlsToCache = [
    './',
    './style.css',
    './script.js',
    './img/pokebola.png',
    'https://pokeapi.co/api/v2/generation/1',
    'https://www.serebii.net/pokemongo/pokemon/001.shtml'
  ]

//durante la fase de instalación, generalmente se almacena en caché los activos estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache)
          .then(() => self.skipWaiting())
      })
      .catch(err => console.log('Falló registro de cache',err))
  )
})

//una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexión
self.addEventListener('activate', e => {
  const cacheWhitelist = [CACHE_NAME]
  e.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            //Eliminamos lo que ya no se necesita en cache
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      // Le indica al SW activar el cache actual
      .then(() => self.clients.claim())
  )
})

//cuando el navegador recupera una url
self.addEventListener('fetch', e => {
  if (e.data && e.data.type === 'showNotification') {
    const title = e.data.title;
    const options = e.data.options;

    // Mostrar la notificación
    self.registration.showNotification(title, options);
  } else {
    // Responder ya sea con el objeto en caché o continuar y buscar la URL real
    e.respondWith(
      caches.match(e.request)
        .then(res => {
          if (res) {
            // Recuperar del caché
            return res;
          }
          // Recuperar de la petición a la URL
          return fetch(e.request);
        })
    );
  }
})