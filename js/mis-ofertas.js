const API_URL = 'http://127.0.0.1:8000';

const listaOfertas = document.getElementById('lista-ofertas');
const errorDiv = document.getElementById('error-ofertas');
const volverBtn = document.getElementById('volver-btn');

volverBtn.addEventListener('click', () => {
    window.location.href = '/pagina-principal.html';
});

async function cargarOfertas() {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';

    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/mis-ofertas`, {
            headers: {
                'Authorization': `${tokenType} ${token}`
            }
        });

        if (!res.ok) throw new Error('No se pudieron cargar las ofertas');

        const ofertas = await res.json();
        listaOfertas.innerHTML = '';

        if (ofertas.length === 0) {
            listaOfertas.innerHTML = '<p style="color: #ccc;">No has hecho ninguna oferta todavía.</p>';
            return;
        }

        ofertas.forEach(oferta => {
            const card = document.createElement('div');
            card.className = 'obra';

            card.innerHTML = `
                <img src="${API_URL}${oferta.imagen_url}" alt="${oferta.titulo}">
                <div class="obra-content">
                    <h3>${oferta.titulo}</h3>
                    <p><strong>Artista:</strong> ${oferta.artista_nombre}</p>
                    <p><strong>Tu oferta:</strong> $${oferta.cantidad.toFixed(2)}</p>
                    <p><strong>Precio actual:</strong> $${oferta.precio_actual.toFixed(2)}</p>
                    <p style="font-size: 0.8em; color: #999;">${new Date(oferta.fecha).toLocaleString()}</p>
                </div>
            `;
            listaOfertas.appendChild(card);
        });

    } catch (err) {
        errorDiv.textContent = err.message;
    }
}

cargarOfertas();
