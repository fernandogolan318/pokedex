document.addEventListener("DOMContentLoaded",function(){
    //#region IntersectionObserver
    const imgOptions = {}
    const imgObserver = new IntersectionObserver((entries, imgObserver) =>{
        entries.forEach((entry) => {
            if(!entry.isIntersecting) return
            const img = entry.target
            var dataImg = img.getAttribute("data-image")
            img.src = dataImg
            imgObserver.unobserve(img)
        })
    }, imgOptions)
    //#endregion

    async function mostrarNotificacion(titulo, opciones) {
      try {
        const sw = await navigator.serviceWorker.getRegistration();
        const permission = await Notification.requestPermission();
        if (sw && permission === 'granted') {
        console.log(opciones.body);
          return new Notification(titulo, opciones);
        } else if (Notification.permission !== 'denied' && permission === 'granted') {
          return new Notification(titulo, opciones);
        }
      } catch (error) {
        console.log('Error al mostrar la notificación:', error);
        throw error; // Lanza una excepción para manejo externo
      }
      }
      
      var logo = document.getElementById('icono');
      logo.addEventListener('click', async () => {
        var title = '¡Bienvenido a mi Pokedex!';
        var options = { body: 'by: Fernando Gómez Landaverde',
        icon: 'img/pokebola.png'}
        await mostrarNotificacion(title,options);
      })
      const fetchPokemones = async (endpoint, CACHE_NAME) => {
        try {
          
            const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(endpoint);
          if (cachedResponse) {
            const data = await cachedResponse.json();
            return data.pokemon_species;
          }
          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            cache.put(endpoint, response.clone());
            const data = await response.json();
            return data.pokemon_species;
          }
        } catch (error) {
          console.log(error);
        }
        return [];
      };
    
    function ordenarPokemones(str){
        var miSubstring = str.substring(
            str.lastIndexOf("s/")+2, str.lastIndexOf("/")
        )
        return miSubstring
    }

    async function obtenerPokemones(numero){
        let endpoint = `https://pokeapi.co/api/v2/generation/${numero}/`
        var contenedor = document.getElementById("contenedor")
        contenedor.innerHTML = ""
        let pokemons = []
        const CACHE_NAME = 'v1_cache_pokedex';
        pokemons = await fetchPokemones(endpoint, CACHE_NAME)
        pokemons.forEach(pokemon => {
            pokemon.nr=ordenarPokemones(pokemon.url)
        })
        pokemons.sort((a,b) => a.nr-b.nr)
        pokemons.forEach(pokemon => {
            let divItem = document.createElement("li")
            divItem.classList.add("item")
            urlImg = "https://www.serebii.net/pokemongo/pokemon/"+ordenarPokemones(pokemon.url).toString().padStart(3, '0');+"/.shtml"
            divItem.innerHTML = `
            <img src="img/pokebola.gif" class="pokeimage" alt="${pokemon.name}" data-image="${urlImg}.png">
            <div>
            ${ordenarPokemones(pokemon.url)} - ${pokemon.name}
            </div>`
            const img = divItem.querySelector(".pokeimage")
            contenedor.appendChild(divItem)
            imgObserver.observe(img)

        })

       
    }

    //#region HTML
    var generacion = [ "generación-1",
    "generación-2",
    "generación-3",
    "generación-4",
    "generación-5",
    "generación-6",
    "generación-7"]
    var generacionHTML=""
    var filtros = document.getElementById("filtros")
    generacion.forEach((gen) => {
        generacionHTML+=`<input class="radio-gen" type="radio" id="${gen}" name="generacion" value=${gen.charAt(gen.length - 1)} checked>
        <label for="${gen}" class="label-sgeneracion">${gen}</label>`
        })
    filtros.innerHTML = generacionHTML;
    filtros.addEventListener("click", function(e){
        let targGen = e.target.type
        if(targGen == "radio"){
            obtenerPokemones(e.target.value)
            titulo.innerHTML = e.target.id
        }
    })
    //#endregion

    
})


