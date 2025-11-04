// Configuración de la API (detecta automáticamente la URL en producción o desarrollo)
const API_URL = `${window.location.origin}/api`;

// Estado de la aplicación
const state = {
    usuario: '',
    telefono: '',
    numeroPrincipal: '',
    numerosGenerados: {
        segundo: null,
        tercero: null
    },
    validacionPrincipal: null,
    loading: false,
    estadoPago: '' // valor por defecto
};

// Elementos del DOM
const elementos = {
    usuario: document.getElementById('usuario'),
    telefono: document.getElementById('telefono'),
    numeroPrincipal: document.getElementById('numeroPrincipal'),
    btnVerificar: document.getElementById('btnVerificar'),
    btnGenerar: document.getElementById('btnGenerar'),
    btnRegistrar: document.getElementById('btnRegistrar'),
    btnLimpiar: document.getElementById('btnLimpiar'),
    validacionMensaje: document.getElementById('validacionMensaje'),
    numerosGenerados: document.getElementById('numerosGenerados'),
    resumenApuesta: document.getElementById('resumenApuesta'),
    resumenPrincipal: document.getElementById('resumenPrincipal'),
    resumenSegundo: document.getElementById('resumenSegundo'),
    resumenTercero: document.getElementById('resumenTercero'),
    resumenUsuario: document.getElementById('resumenUsuario'),
    mensajeSistema: document.getElementById('mensajeSistema'),
    radioDebe: document.getElementById('radioDebe'),
    radioPago: document.getElementById('radioPago')
};

// Utilidades
const utils = {
    formatearNumero: (num) => num.toString().padStart(3, '0'),

    validarNumero: (num) => {
        const numero = parseInt(num);
        return !isNaN(numero) && numero >= 0 && numero <= 999;
    },

    mostrarMensaje: (elemento, texto, tipo) => {
        const iconos = {
            success: '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            error: '<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            info: '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        };
        const colores = {
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800'
        };
        elemento.className = `p-4 rounded-lg flex items-center gap-3 border fade-in ${colores[tipo]}`;
        elemento.innerHTML = `${iconos[tipo]}<span>${texto}</span>`;
        elemento.classList.remove('hidden');
    },

    ocultarMensaje: (elemento) => elemento.classList.add('hidden'),

    setLoading: (isLoading) => {
        state.loading = isLoading;
        elementos.btnVerificar.disabled = isLoading;
        elementos.btnGenerar.disabled = isLoading || !state.validacionPrincipal;
        elementos.btnRegistrar.disabled = isLoading || !state.validacionPrincipal || !state.numerosGenerados.segundo;
        if (isLoading) {
            elementos.btnVerificar.innerHTML = '<span class="pulse-loader">Verificando...</span>';
            elementos.btnGenerar.innerHTML = '<span class="pulse-loader">Generando...</span>';
        } else {
            elementos.btnVerificar.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Verificar
            `;
            elementos.btnGenerar.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                Generar Números Aleatorios
            `;
        }
    }
};

// Funciones API
const api = {
    verificarNumero: async (numero) => {
        const res = await fetch(`${API_URL}/verificar-numero`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numero: parseInt(numero) })
        });
        if (!res.ok) throw new Error('Error en verificación');
        return await res.json();
    },
    generarNumerosAleatorios: async (numeroPrincipal) => {
        const res = await fetch(`${API_URL}/generar-numeros`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numeroPrincipal: parseInt(numeroPrincipal) })
        });
        if (!res.ok) throw new Error('Error al generar números');
        return await res.json();
    },
    registrarApuesta: async (apuesta) => {
        const res = await fetch(`${API_URL}/registrar-apuesta`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apuesta)
        });
        if (!res.ok) throw new Error('Error al registrar');
        return await res.json();
    }
};

// Manejadores
const handlers = {
    verificarNumeroPrincipal: async () => {
        const numero = elementos.numeroPrincipal.value;
        if (!numero || numero.length !== 3) {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Ingrese un número de 3 dígitos (000-999)', 'error');
            return;
        }
        if (!utils.validarNumero(numero)) {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Número fuera de rango (000-999)', 'error');
            return;
        }
        utils.setLoading(true);
        utils.ocultarMensaje(elementos.mensajeSistema);
        utils.ocultarMensaje(elementos.validacionMensaje);
        try {
            const resultado = await api.verificarNumero(numero);
            if (resultado.disponible) {
                state.validacionPrincipal = true;
                state.numeroPrincipal = numero;
                elementos.validacionMensaje.className = 'mt-4 p-4 rounded-lg flex items-center gap-3 border bg-green-50 border-green-200 fade-in';
                elementos.validacionMensaje.innerHTML = `
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-green-800">Número ${utils.formatearNumero(numero)} disponible</span>`;
                elementos.validacionMensaje.classList.remove('hidden');
                elementos.btnGenerar.disabled = false;
            } else {
                state.validacionPrincipal = false;
                elementos.validacionMensaje.className = 'mt-4 p-4 rounded-lg flex items-center gap-3 border bg-red-50 border-red-200 fade-in';
                elementos.validacionMensaje.innerHTML = `
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-red-800">El número ${utils.formatearNumero(numero)} ya está en juego</span>`;
                elementos.validacionMensaje.classList.remove('hidden');
            }
        } catch {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Error al verificar el número.', 'error');
        } finally {
            utils.setLoading(false);
        }
    },

    generarNumerosAleatorios: async () => {
        if (!state.validacionPrincipal) {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Primero debe validar el número principal', 'error');
            return;
        }
        utils.setLoading(true);
        utils.ocultarMensaje(elementos.mensajeSistema);
        try {
            const resultado = await api.generarNumerosAleatorios(state.numeroPrincipal);
            if (resultado.success) {
                state.numerosGenerados = {
                    segundo: resultado.numeros.segundo,
                    tercero: resultado.numeros.tercero
                };
                elementos.numerosGenerados.innerHTML = `
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center fade-in">
                        <p class="text-gray-600 text-sm mb-2">Segundo Número</p>
                        <p class="text-4xl font-bold text-blue-700">${utils.formatearNumero(resultado.numeros.segundo)}</p>
                    </div>
                    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center fade-in">
                        <p class="text-gray-600 text-sm mb-2">Tercer Número</p>
                        <p class="text-4xl font-bold text-indigo-700">${utils.formatearNumero(resultado.numeros.tercero)}</p>
                    </div>`;
                elementos.numerosGenerados.classList.remove('hidden');
                handlers.actualizarResumen();
                utils.mostrarMensaje(elementos.mensajeSistema, 'Números generados exitosamente', 'success');
                elementos.btnRegistrar.disabled = false;
            } else utils.mostrarMensaje(elementos.mensajeSistema, resultado.mensaje, 'error');
        } catch {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Error al generar números.', 'error');
        } finally {
            utils.setLoading(false);
        }
    },

    registrarApuesta: async () => {
        const usuario = elementos.usuario.value.trim();
        const telefono = elementos.telefono.value.trim();

        if (!usuario || !telefono) {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Complete los datos del usuario', 'error');
            return;
        }
        if (!/^\d+$/.test(telefono)) {
            utils.mostrarMensaje(elementos.mensajeSistema, 'El teléfono debe contener solo números', 'error');
            return;
        }
        if (!state.validacionPrincipal || !state.numerosGenerados.segundo) {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Complete todos los pasos', 'error');
            return;
        }

        // ✅ Capturar correctamente el estado de pago justo antes de registrar
        const seleccionado = document.querySelector('input[name="estadoPago"]:checked');
        if (!seleccionado) {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Seleccione el estado de pago (Debe o Pagó)', 'error');
            return;
        }

        const estadoPago = seleccionado.value === 'pago' ? 'pago' : 'debe';

        state.estadoPago = estadoPago;

        const apuesta = {
            usuario: usuario,
            telefono: telefono,
            numeros: {
                primer: utils.formatearNumero(state.numeroPrincipal),
                segunda: utils.formatearNumero(state.numerosGenerados.segundo),
                tercera: utils.formatearNumero(state.numerosGenerados.tercero)
            },
            estado_cuenta: estadoPago
        };


        utils.setLoading(true);
        try {
            const resultado = await api.registrarApuesta(apuesta);
            if (resultado.success) {
                utils.mostrarMensaje(elementos.mensajeSistema, '✅ Apuesta registrada exitosamente', 'success');
                // Actualizar la tabla si está disponible
                if (window.cargarApuestas) {
                    window.cargarApuestas();
                }
                setTimeout(() => handlers.limpiarFormulario(), 2000);
            } else {
                utils.mostrarMensaje(elementos.mensajeSistema, resultado.mensaje, 'error');
            }
        } catch (error) {
            utils.mostrarMensaje(elementos.mensajeSistema, 'Error al registrar la apuesta.', 'error');
        } finally {
            utils.setLoading(false);
        }
    },


    limpiarFormulario: () => {
        elementos.usuario.value = '';
        elementos.telefono.value = '';
        elementos.numeroPrincipal.value = '';
        elementos.radioDebe.checked = false;
        elementos.radioPago.checked = false;
        state.usuario = '';
        state.telefono = '';
        state.numeroPrincipal = '';
        state.estadoPago = 'debe';
        state.numerosGenerados = { segundo: null, tercero: null };
        state.validacionPrincipal = null;
        utils.ocultarMensaje(elementos.validacionMensaje);
        utils.ocultarMensaje(elementos.mensajeSistema);
        elementos.numerosGenerados.classList.add('hidden');
        elementos.resumenApuesta.classList.add('hidden');
        elementos.btnGenerar.disabled = true;
        elementos.btnRegistrar.disabled = true;
    },

    actualizarResumen: () => {
        if (state.validacionPrincipal && state.numerosGenerados.segundo) {
            elementos.resumenPrincipal.textContent = utils.formatearNumero(state.numeroPrincipal);
            elementos.resumenSegundo.textContent = utils.formatearNumero(state.numerosGenerados.segundo);
            elementos.resumenTercero.textContent = utils.formatearNumero(state.numerosGenerados.tercero);
            const usuario = elementos.usuario.value.trim();
            const telefono = elementos.telefono.value.trim();
            const estado = elementos.radioPago.checked ? 'Pagó' : 'Debe';
            if (usuario && telefono) {
                elementos.resumenUsuario.innerHTML = `
                    Usuario: <span class="font-semibold text-gray-900">${usuario}</span> |
                    Tel: <span class="font-semibold text-gray-900">${telefono}</span> |
                    Estado: <span class="font-semibold ${estado === 'Pagó' ? 'text-green-600' : 'text-red-600'}">${estado}</span>`;
            }
            elementos.resumenApuesta.classList.remove('hidden');
        }
    }
};

// Event Listeners
elementos.numeroPrincipal.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    state.validacionPrincipal = null;
    state.numerosGenerados = { segundo: null, tercero: null };
    elementos.btnGenerar.disabled = true;
    elementos.btnRegistrar.disabled = true;
    utils.ocultarMensaje(elementos.validacionMensaje);
    elementos.numerosGenerados.classList.add('hidden');
    elementos.resumenApuesta.classList.add('hidden');
});
elementos.telefono.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '');
    handlers.actualizarResumen();
});
elementos.usuario.addEventListener('input', () => handlers.actualizarResumen());
[elementos.radioDebe, elementos.radioPago].forEach(radio => {
    radio.addEventListener('change', () => {
        state.estadoPago = radio.value;
        handlers.actualizarResumen();
    });
});
elementos.btnVerificar.addEventListener('click', handlers.verificarNumeroPrincipal);
elementos.btnGenerar.addEventListener('click', handlers.generarNumerosAleatorios);
elementos.btnRegistrar.addEventListener('click', handlers.registrarApuesta);
elementos.btnLimpiar.addEventListener('click', handlers.limpiarFormulario);
elementos.numeroPrincipal.addEventListener('keypress', e => {
    if (e.key === 'Enter' && elementos.numeroPrincipal.value.length === 3)
        handlers.verificarNumeroPrincipal();
});

// La navegación entre secciones está manejada en tabla.js

console.log('✅ Sistema de apuestas inicializado correctamente');
