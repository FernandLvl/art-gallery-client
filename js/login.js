const API_URL = 'http://127.0.0.1:8000';

    const form = document.getElementById('auth-form');
    const toggle = document.getElementById('toggle-form');
    const messageDiv = document.getElementById('message');
    const title = document.getElementById('form-title');

    let isLogin = true;

    function showMessage(text, isError = false) {
        messageDiv.textContent = text;
        messageDiv.className = isError ? 'error' : 'success';
    }

    function clearMessage() {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }

    function createInput(name, type = 'text', placeholder = '') {
        const input = document.createElement('input');
        input.name = name;
        input.type = type;
        input.placeholder = placeholder;
        input.required = true;
        return input;
    }

    function createSelect(name, options) {
        const select = document.createElement('select');
        select.name = name;
        select.required = true;
        for (const opt of options) {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            select.appendChild(option);
        }
        return select;
    }

    function renderForm() {
        clearMessage();
        form.innerHTML = '';
        if (isLogin) {
            title.textContent = 'Iniciar Sesión';

            form.appendChild(createInput('email', 'email', 'Correo electrónico'));
            form.appendChild(createInput('password', 'password', 'Contraseña'));
            const btn = document.createElement('button');
            btn.textContent = 'Entrar';
            form.appendChild(btn);

            toggle.textContent = '¿No tienes cuenta? Regístrate aquí';
        } else {
            title.textContent = 'Registro';

            form.appendChild(createInput('nombre', 'text', 'Nombre'));
            form.appendChild(createInput('email', 'email', 'Correo electrónico'));
            form.appendChild(createInput('password', 'password', 'Contraseña'));
            form.appendChild(createSelect('rol', [
                {value: 'artista', text: 'Artista'},
                {value: 'observador', text: 'Observador'}
            ]));

            const btn = document.createElement('button');
            btn.textContent = 'Registrar';
            form.appendChild(btn);

            toggle.textContent = '¿Ya tienes cuenta? Inicia sesión aquí';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        if (isLogin) {
            // login
            const email = form.email.value.trim();
            const password = form.password.value.trim();

            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: params.toString()
            });

            // guardar token en localstorage
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('token_type', data.token_type);
                // Redirigir a la página principal o dashboard
                showMessage('Inicio de sesión exitoso');
                window.location.href = '/pagina-principal.html';
            } else {
                const errData = await res.json();
                showMessage(errData.detail || 'Error en inicio de sesión', true);
            }

        } else {
            // registro
            const nombre = form.nombre.value.trim();
            const email = form.email.value.trim();
            const password = form.password.value.trim();
            const rol = form.rol.value;

            try {
                const res = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({nombre, email, password, rol})
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || 'Error en registro');
                }

                showMessage('Registro exitoso, ahora inicia sesión');
                isLogin = true;
                renderForm();

            } catch (err) {
                showMessage(err.message, true);
            }
        }
    });

    toggle.addEventListener('click', () => {
        isLogin = !isLogin;
        renderForm();
    });

    renderForm();