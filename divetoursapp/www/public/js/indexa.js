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
                loadUserInfo();
            }

            if (viewName === 'homea') {
                initializeMap(); 
            }


            if (viewName === 'lefta') {
                loadItineraries();
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
async function loadAvisos() {
    try {
        console.log("Cargando avisos...");
        const response = await fetch('http://localhost:4000/avi/avisos');
        if (response.ok) {
            const avisos = await response.json();
            console.log("Avisos cargados:", avisos);

            // Obtén la vista actual que se está mostrando
            const mainContent = document.querySelector('.main-content');

            // Verifica si hay un elemento con la clase 'avisos' en la vista cargada
            const avisosDiv = mainContent.querySelector('.avisos');
            if (avisosDiv) {
                // Limpia el contenido existente
                avisosDiv.innerHTML = ''; 
                
                // Cargar los avisos en el div
                avisos.forEach(aviso => {
                    // Crea un div para cada aviso
                    const avisoElement = document.createElement('div');
                    avisoElement.classList.add('aviso'); // Agrega una clase para estilizar si es necesario

                    // Crea un encabezado para el nombre del aviso
                    const avisoName = document.createElement('h3');
                    avisoName.textContent = aviso.avi_name; // Asigna el nombre del aviso

                    // Crea un párrafo para la descripción del aviso
                    const avisoDescription = document.createElement('p');
                    avisoDescription.textContent = aviso.avi_description; // Asigna la descripción del aviso

                    // Agrega el nombre y la descripción al elemento del aviso
                    avisoElement.appendChild(avisoName);
                    avisoElement.appendChild(avisoDescription);
                    
                    // Añade el elemento del aviso al contenedor de avisos
                    avisosDiv.appendChild(avisoElement);
                });
                console.log("Avisos mostrados en el div.");
            } else {
                console.error('El div .avisos no se encontró en la vista cargada.');
            }
        } else {
            console.error('Error en la respuesta del servidor:', response.status);
        }
    } catch (error) {
        console.error('Error al cargar avisos:', error);
    }
}

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

async function loadItineraries() {
    try {
        const response = await fetch("http://localhost:4000/itineraries/itis");
        if (!response.ok) throw new Error("Error al cargar los itinerarios.");
        
        const itineraries = await response.json();
        const itinerariesList = document.getElementById("itineraries-list");
        
        itinerariesList.innerHTML = itineraries.map(itinerary => `
            <div class="itinerary-item" onclick="showItineraryPreview('${itinerary.iti_name}', '${itinerary.description}', '${itinerary.start_date}', '${itinerary.end_date}')">
                <h4>${itinerary.iti_name}</h4>
            </div>
        `).join("");
    } catch (error) {
        console.error(error);
        alert("Hubo un problema al cargar los itinerarios.");
    }
}

// Variable para almacenar el itinerario seleccionado
let currentItinerary = null;

function showItineraryPreview(itinerary) {
    console.log("Abriendo el modal para el itinerario:", itinerary); // Verificar que la información es correcta
    currentItinerary = itinerary; // Guardamos el itinerario actual

    // Mostrar la información del itinerario en el modal
    document.getElementById('itineraryName').textContent = itinerary.iti_name || 'No disponible';
    document.getElementById('itineraryDescription').textContent = itinerary.description || 'No disponible';
    document.getElementById('itineraryStartDate').textContent = new Date(itinerary.start_date).toLocaleDateString() || 'Fecha no disponible';
    document.getElementById('itineraryEndDate').textContent = new Date(itinerary.end_date).toLocaleDateString() || 'Fecha no disponible';

    // Asegúrate de que el modal se está mostrando
    document.getElementById('itineraryPreviewOverlay').classList.add('show');
    console.log("Modal debería estar abierto.");
}

// Función para cerrar el modal
function closeItineraryPreview() {
    currentItinerary = null; // Limpiar el itinerario actual
    document.getElementById('itineraryPreviewOverlay').classList.remove('show'); // Ocultar el modal
}

// Eliminar el itinerario actual
async function deleteItinerary() {
    if (!currentItinerary) return;
    try {
        const response = await fetch(`http://localhost:4000/itineraries/${currentItinerary._id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar el itinerario');
        
        loadItineraries(); // Recargar la lista de itinerarios
        closeItineraryPreview(); // Cerrar la vista previa
    } catch (error) {
        console.error(error);
        alert('Error al eliminar el itinerario');
    }
}




