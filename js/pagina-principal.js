const API_URL = 'http://127.0.0.1:8000';

const welcomeDiv = document.getElementById('welcome');
const logoutBtn = document.getElementById('logout-btn');
const errorDiv = document.getElementById('error');
const galeria = document.getElementById('galeria');
const btnNuevaObra = document.getElementById('btn-nueva-obra');
const ofertasBtn = document.getElementById('ofertas-btn');
const modalImagen = document.getElementById('modal-imagen');
const imagenAmpliada = document.getElementById('imagen-ampliada');
const cerrarImagen = document.getElementById('cerrar-imagen');

function redirectToLogin() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    window.location.href = '/index.html';
}

let currentUser = null; 

async function fetchUser() {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';

    if (!token) {
        redirectToLogin();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/me`, {
            headers: {
                'Authorization': `${tokenType} ${token}`
            }
        });

        if (!res.ok) throw new Error('Token inválido o expirado');

        const user = await res.json();
        currentUser = user;
        welcomeDiv.textContent = `Bienvenid@, ${user.nombre}`;
        errorDiv.textContent = '';

        // obtenemos los botones (deberían estar definidos también arriba si no lo están aún)
        const perfilBtn = document.getElementById('perfil-btn');
        const ofertasBtn = document.getElementById('ofertas-btn');
        const explorarBtn = document.getElementById('explorar-btn');

        if (user.rol === 'artista') {
            btnNuevaObra.style.display = 'block';
            perfilBtn.style.display = 'inline-block';
            ofertasBtn.style.display = 'none';
            explorarBtn.style.display = 'none';

            perfilBtn.addEventListener('click', () => {
                window.location.href = '/mi-perfil.html';
            });

        } else if (user.rol === 'observador') {
            btnNuevaObra.style.display = 'none';
            perfilBtn.style.display = 'none';
            ofertasBtn.style.display = 'inline-block';
            explorarBtn.style.display = 'inline-block';

            ofertasBtn.addEventListener('click', () => {
                window.location.href = '/mis-ofertas.html';
            });

            explorarBtn.addEventListener('click', () => {
                window.location.href = '/explorar-subastas.html';
            });
        }

    } catch (err) {
        errorDiv.textContent = err.message;
        setTimeout(redirectToLogin, 2000);
    }
}


async function cargarObras() {
    try {
        const res = await fetch(`${API_URL}/obras`);
        if (!res.ok) throw new Error('No se pudieron cargar las obras');

        const obras = await res.json();
        galeria.innerHTML = '';

        obras.forEach(obra => {
            const card = document.createElement('div');
            card.className = 'obra';

            card.innerHTML = `
                <img src="${API_URL}${obra.imagen_url}" alt="${obra.titulo}">
                <div class="obra-content">
                    <h3>${obra.titulo}</h3>
                    <p><strong>Por:</strong> ${obra.artista_nombre}</p>
                    <p>${obra.descripcion || ''}</p>
                    <p style="font-size: 0.8em; color: #999;">${new Date(obra.fecha_subida).toLocaleString()}</p>
                    ${obra.en_subasta ? `<span class="subasta">¡En subasta!</span>` : ''}
                </div>
            `;
            const img = card.querySelector('img');
            img.addEventListener('click', () => {
                abrirModalImagen(img.src, img.alt);
            });

            galeria.appendChild(card);
        });

    } catch (err) {
        errorDiv.textContent = err.message;
    }
}

fetchUser().then(cargarObras);

// modal
const modal = document.getElementById('modal-nueva-obra');
const cerrarModal = document.querySelector('.cerrar-modal');
const formObra = document.getElementById('form-obra');
const modalError = document.getElementById('modal-error');

// abrir modal
btnNuevaObra.addEventListener('click', () => {
    modal.style.display = 'block';
});

// cerrar modal
cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
    formObra.reset();
    modalError.textContent = '';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        formObra.reset();
        modalError.textContent = '';
    }
});

// enviar nueva obra
formObra.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const imagen = document.getElementById('imagen').files[0];
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';

    if (!imagen) {
        modalError.textContent = 'Selecciona una imagen válida';
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('imagen', imagen); // importante: el nombre debe ser exactamente 'imagen'

    try {
        const res = await fetch(`${API_URL}/obras/subir`, {
            method: 'POST',
            headers: {
                'Authorization': `${tokenType} ${token}`
                // ¡no pongas Content-Type! fetch con FormData ya lo define bien con boundaries
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Error al subir obra');
        }

        modal.style.display = 'none';
        formObra.reset();
        modalError.textContent = '';
        cargarObras(); // refrescar el feed de obras

    } catch (err) {
        modalError.textContent = err.message;
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.clear(); // limpia todo lo que haya, por si agregas más cosas después
    redirectToLogin();
});

ofertasBtn.addEventListener('click', () => {
    window.location.href = '/mis-ofertas.html';
});

const perfilBtn = document.getElementById('perfil-btn');

function crearBotonPerfil() {
    perfilBtn.style.display = 'inline-block';
    perfilBtn.addEventListener('click', () => {
        window.location.href = '/mi-perfil.html';
    });
}

function abrirModalImagen(src, alt = '') {
    imagenAmpliada.src = src;
    imagenAmpliada.alt = alt;
    modalImagen.style.display = 'flex';
}

cerrarImagen.addEventListener('click', () => {
    modalImagen.style.display = 'none';
    imagenAmpliada.src = '';
});

window.addEventListener('click', (e) => {
    if (e.target === modalImagen) {
        modalImagen.style.display = 'none';
        imagenAmpliada.src = '';
    }
});
