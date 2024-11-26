// VISTA CENTRAL
function showSection(viewName, buttonElement) {
    const sections = document.querySelectorAll('.main-content');
    const mainContent = document.querySelector('.main-content');
    
    sections.forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('visible');
    });

    fetch(`views/${viewName}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar la vista parcial');
            }
            return response.text();
        })
        .then(data => {
            mainContent.innerHTML = data;
            mainContent.classList.add('visible');
            mainContent.classList.remove('hidden');

            const rect = buttonElement.getBoundingClientRect();
            const highlightBox = document.getElementById('highlight-box');
            highlightBox.style.top = `${rect.top + window.scrollY - (highlightBox.offsetHeight / 2) + (rect.height / 2)}px`;
            highlightBox.style.left = `${rect.left + window.scrollX - (highlightBox.offsetWidth / 2) + (rect.width / 2)}px`;
            highlightBox.style.display = 'block';

            if (viewName === 'righta') {
                loadAvisos();
            }

            if (viewName === 'homea') {
                initializeMap();
                loadUserInfo(); 
            }


            if (viewName === 'lefta') {
                loadItinerary();
            }

        })
        .catch(error => {
            console.error('Error al cargar la vista parcial:', error);
        });
}

function initializeMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        var map = L.map('map', {
            zoomControl: false 
        }).setView([51.505, -0.09], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                map.setView([lat, lng], 13);

                var marker = L.marker([lat, lng]).addTo(map)
                    .bindPopup("¡Estás aquí!")
                    .openPopup();
            }, function(error) {
                console.warn('ERROR(' + error.code + '): ' + error.message);
            });
        } else {
            console.error("El navegador no soporta la geolocalización.");
        }
    } else {
        console.error('El div del mapa no existe o no se ha cargado correctamente.');
    }
}


function gousers() {
    window.location.href = './views/users.html'; 
    }
    
function gotrav() {
    window.location.href = './views/travellers.html';
}

//VISTA DERECHA
async function loadUserInfo() {
    const userId = localStorage.getItem('userId'); // Obtener el ID del usuario del localStorage

    if (!userId) {
        console.error('No hay un usuario conectado');
        return; // Salir si no hay usuario conectado
    }

    try {
        const response = await fetch(`http://localhost:4000/users/user/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }

        const userData = await response.json();

        // Actualizar el contenido de los elementos HTML en right.html
        document.getElementById('user-name').textContent = `${userData.name} ${userData.last_name}`;
        document.getElementById('user-email').textContent = userData.email;

    } catch (error) {
        console.error('Error al cargar la información del usuario:', error);
    }
}



//VISTA IZQUIERDA
function formiti() {
    window.location.href = 'views/formiti.html';  
}


window.onload = function() {
    showSection('homea', document.querySelector('.navbar button:nth-child(2)'));
};

// async function loadItineraries() {
//     try {
//         const response = await fetch("http://localhost:4000/itineraries/itis");
//         if (!response.ok) throw new Error("Error al cargar los itinerarios.");
        
//         const itineraries = await response.json();
//         const itinerariesList = document.getElementById("itineraries-list");
        
//         itinerariesList.innerHTML = itineraries.map(itinerary => `
//             <div class="itinerary-item" onclick="showItineraryPreview('${itinerary.iti_name}', '${itinerary.description}', '${itinerary.start_date}', '${itinerary.end_date}')">
//                 <h4>${itinerary.iti_name}</h4>
//             </div>
//         `).join("");
//     } catch (error) {
//         console.error(error);
//         alert("Hubo un problema al cargar los itinerarios.");
//     }
// }

async function loadItinerary() {
    try {
        const response = await fetch('http://localhost:4000/itineraries/itis');
        if (!response.ok) {
            throw new Error('Error al cargar el itinerario');
        }

        const itineraries = await response.json();

        if (itineraries.length === 0) {
            document.getElementById('itineraryContainer').innerHTML = '<p>No hay itinerarios disponibles.</p>';
        } else {
            const itinerary = itineraries[0]; // Solo hay un itinerario
            document.getElementById('iti_name').textContent = itinerary.iti_name;
            document.getElementById('iti_id').textContent = itinerary.iti_id;
            document.getElementById('iti_description').textContent = itinerary.description;
            document.getElementById('iti_start_date').textContent =
                new Date(itinerary.start_date).toLocaleDateString();
            document.getElementById('iti_end_date').textContent =
                new Date(itinerary.end_date).toLocaleDateString();
        }
    } catch (error) {
        alert('Hubo un problema al cargar el itinerario. Inténtalo más tarde.');
    }
}

// Eliminar todos los registros de la colección
async function clearItinerary() {
    try {
        const response = await fetch('http://localhost:4000/itineraries/clear', {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el itinerario');
        }

        alert('Itinerario eliminado correctamente.');
        document.getElementById('itineraryContainer').innerHTML = '<p>No hay itinerarios disponibles.</p>';
    } catch (error) {
        alert('No se pudo eliminar el itinerario. Inténtalo más tarde.');
    }
}




