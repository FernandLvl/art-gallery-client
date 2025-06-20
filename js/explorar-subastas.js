const API_URL = 'http://127.0.0.1:8000';

const galeria = document.getElementById('galeria-subastas');
const errorDiv = document.getElementById('error-explorar');
const volverBtn = document.getElementById('volver-btn');

// modal
const modal = document.getElementById('modal-subasta');
const cerrarModal = document.getElementById('cerrar-subasta');
const detalleDiv = document.getElementById('detalle-subasta');
const formOferta = document.getElementById('form-oferta');
const ofertaInput = document.getElementById('oferta-cantidad');
const ofertaError = document.getElementById('oferta-error');

let subastaActualId = null;

volverBtn.addEventListener('click', () => {
    window.location.href = '/pagina-principal.html';
});

cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
    detalleDiv.innerHTML = '';
    formOferta.reset();
    ofertaError.textContent = '';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        detalleDiv.innerHTML = '';
        formOferta.reset();
        ofertaError.textContent = '';
    }
});

formOferta.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cantidad = parseFloat(ofertaInput.value);
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';

    try {
        const res = await fetch(`${API_URL}/ofertas/hacer`, {
            method: 'POST',
            headers: {
                'Authorization': `${tokenType} ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subasta_id: subastaActualId,
                cantidad
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'No se pudo hacer la oferta');
        }

        alert('Oferta realizada con éxito');
        modal.style.display = 'none';
        formOferta.reset();
        cargarSubastas();

    } catch (err) {
        ofertaError.textContent = err.message;
    }
});

async function cargarSubastas() {
    galeria.innerHTML = '';
    errorDiv.textContent = '';

    try {
        const res = await fetch(`${API_URL}/explorar-subastas`);
        if (!res.ok) throw new Error('No se pudieron cargar las subastas');

        const subastas = await res.json();

        if (subastas.length === 0) {
            galeria.innerHTML = '<p style="color: #ccc;">No hay subastas activas por ahora.</p>';
            return;
        }

        subastas.forEach(subasta => {
            const card = document.createElement('div');
            card.className = 'obra';
            card.innerHTML = `
                <img src="${API_URL}${subasta.imagen_url}" alt="${subasta.titulo}">
                <div class="obra-content">
                    <h3>${subasta.titulo}</h3>
                    <p><strong>Artista:</strong> ${subasta.artista_nombre}</p>
                    <p><strong>Precio actual:</strong> $${subasta.precio_actual.toFixed(2)}</p>
                    <p style="font-size: 0.8em;">Termina: ${new Date(subasta.fecha_fin).toLocaleString()}</p>
                    <button class="btn-ver-subasta" data-id="${subasta.id}">Ver más</button>
                </div>
            `;
            galeria.appendChild(card);
        });

    } catch (err) {
        errorDiv.textContent = err.message;
    }
}

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-ver-subasta')) {
        const subastaId = e.target.dataset.id;
        subastaActualId = parseInt(subastaId);

        try {
            const res = await fetch(`${API_URL}/subasta/${subastaId}`);
            if (!res.ok) throw new Error('No se pudo obtener la subasta');

            const data = await res.json();

            let historial = '';
            if (data.ofertas.length > 0) {
                historial = '<h4>Historial de ofertas:</h4><ul>';
                data.ofertas.forEach(oferta => {
                    historial += `<li>$${oferta.cantidad.toFixed(2)} - ${new Date(oferta.fecha).toLocaleString()}</li>`;
                });
                historial += '</ul>';
            } else {
                historial = '<p>No hay ofertas aún.</p>';
            }

            detalleDiv.innerHTML = `
                <img src="${API_URL}${data.imagen_url}" style="width: 100%; border-radius: 8px;" />
                <h3>${data.titulo}</h3>
                <p>${data.descripcion || ''}</p>
                <p><strong>Artista:</strong> ${data.artista_nombre}</p>
                <p><strong>Precio actual:</strong> $${data.precio_actual.toFixed(2)}</p>
                <p><strong>Finaliza:</strong> ${new Date(data.fecha_fin).toLocaleString()}</p>
                ${historial}
            `;

            modal.style.display = 'block';

        } catch (err) {
            alert('Error: ' + err.message);
        }
    }
});

cargarSubastas();
