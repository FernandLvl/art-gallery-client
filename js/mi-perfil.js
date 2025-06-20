const API_URL = 'http://127.0.0.1:8000';
const galeria = document.getElementById('galeria-mis-obras');
const errorDiv = document.getElementById('error-perfil');
const volverBtn = document.getElementById('volver-btn');

volverBtn.addEventListener('click', () => {
    window.location.href = '/pagina-principal.html';
});

let subastasDelUsuario = [];

async function obtenerSubastas() {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';

    const res = await fetch(`${API_URL}/subastas`, {
        headers: {
            'Authorization': `${tokenType} ${token}`
        }
    });

    if (!res.ok) throw new Error('No se pudieron cargar las subastas');

    subastasDelUsuario = await res.json();
}

async function cargarMisObras() {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';

    try {
        await obtenerSubastas(); // primero obtenemos subastas

        const res = await fetch(`${API_URL}/mis-obras`, {
            headers: {
                'Authorization': `${tokenType} ${token}`
            }
        });

        if (!res.ok) throw new Error('No se pudieron cargar tus obras');

        const obras = await res.json();
        galeria.innerHTML = '';

        obras.forEach(obra => {
            const card = document.createElement('div');
            card.className = 'obra';

            const subasta = subastasDelUsuario.find(s => s.obra_id === obra.id);

            let subastaHTML = '';
            let botonHTML = '';

            if (subasta) {
                subastaHTML = `
                    <div class="subasta">
                        <strong>Subasta:</strong> ${subasta.estado}<br>
                        <small>Inicio: ${new Date(subasta.fecha_inicio).toLocaleString()}</small><br>
                        <small>Fin: ${new Date(subasta.fecha_fin).toLocaleString()}</small><br>
                        <small>Precio actual: $${subasta.precio_actual.toFixed(2)}</small>
                    </div>
                `;
            } else {
                botonHTML = `<button class="btn-subasta" data-obra-id="${obra.id}">Iniciar subasta</button>`;
            }

            card.innerHTML = `
                <img src="${API_URL}${obra.imagen_url}" alt="${obra.titulo}">
                <div class="obra-content">
                    <h3>${obra.titulo}</h3>
                    <p>${obra.descripcion || ''}</p>
                    <p style="font-size: 0.8em; color: #999;">${new Date(obra.fecha_subida).toLocaleString()}</p>
                    ${subastaHTML}
                    ${botonHTML}
                </div>
            `;

            galeria.appendChild(card);
        });

    } catch (err) {
        errorDiv.textContent = err.message;
    }
}

cargarMisObras();

// referencias
const modalSubasta = document.getElementById('modal-subasta');
const cerrarSubastaBtn = document.getElementById('cerrar-subasta');
const formSubasta = document.getElementById('form-subasta');
const subastaError = document.getElementById('subasta-error');

// abrir modal
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-subasta')) {
        const obraId = e.target.dataset.obraId;
        document.getElementById('obra-id').value = obraId;
        modalSubasta.style.display = 'block';
        subastaError.textContent = '';
    }
});

// cerrar modal
cerrarSubastaBtn.addEventListener('click', () => {
    modalSubasta.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modalSubasta) {
        modalSubasta.style.display = 'none';
    }
});

// enviar subasta
formSubasta.addEventListener('submit', async (e) => {
    e.preventDefault();

    const obra_id = parseInt(document.getElementById('obra-id').value);
    const precio_inicio = parseFloat(document.getElementById('precio-inicio').value);
    const fecha_inicio = document.getElementById('fecha-inicio').value;
    const fecha_fin = document.getElementById('fecha-fin').value;

    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';

    const body = {
        obra_id,
        precio_inicio,
        fecha_inicio,
        fecha_fin
    };

    try {
        const res = await fetch(`${API_URL}/subastas/iniciar`, {
            method: 'POST',
            headers: {
                'Authorization': `${tokenType} ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Error al iniciar subasta');
        }

        modalSubasta.style.display = 'none';
        formSubasta.reset();
        await cargarMisObras();

    } catch (err) {
        subastaError.textContent = err.message;
    }
});
