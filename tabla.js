// tabla.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Referencias a secciones y botones ---
  const seccionRegistro = document.getElementById("seccionRegistro");
  const seccionListado = document.getElementById("seccionListado");
  const btnRegistroNav = document.getElementById("btnRegistroNav");
  const btnListadoNav = document.getElementById("btnListadoNav");

  // Verificar que los elementos existen antes de agregar eventos
  if (btnRegistroNav && btnListadoNav && seccionRegistro && seccionListado) {
    // Navegación entre secciones
    btnRegistroNav.addEventListener("click", () => {
      seccionRegistro.classList.remove("hidden");
      seccionListado.classList.add("hidden");
    });

    btnListadoNav.addEventListener("click", () => {
      seccionRegistro.classList.add("hidden");
      seccionListado.classList.remove("hidden");
      cargarApuestas(); // Cargar datos al abrir la tabla
    });
  }

  // --- Variables de paginación ---
  let apuestas = [];
  let paginaActual = 1;
  const porPagina = 10;

  // --- Referencias DOM ---
  const tablaCuerpo = document.getElementById("tablaCuerpo");
  const buscador = document.getElementById("buscador");
  const paginacion = document.getElementById("paginacion");

  if (!tablaCuerpo || !buscador || !paginacion) {
    console.warn("⚠️ Algunos elementos de la tabla no existen en el HTML.");
    return;
  }

  // Detectar automáticamente la URL del servidor (funciona en desarrollo y producción)
  const API_URL = window.location.origin;

  // --- Cargar apuestas desde el servidor ---
  async function cargarApuestas() {
    try {
      const res = await fetch(`${API_URL}/api/apuestas`);
      if (!res.ok) throw new Error("Error al obtener apuestas");
      const data = await res.json();

      // Verificar formato de datos
      if (!Array.isArray(data)) {
        console.error("⚠️ Los datos recibidos no son un arreglo:", data);
        return;
      }

      // Ordenar por número principal ascendente
      data.sort((a, b) => {
        const n1 = parseInt(a.numeros?.primer || 0);
        const n2 = parseInt(b.numeros?.primer || 0);
        return n1 - n2;
      });

      apuestas = data;
      paginaActual = 1; // Resetear a la primera página
      renderizarTabla();
    } catch (err) {
      console.error("❌ Error al cargar apuestas:", err);
      tablaCuerpo.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-red-600">
            Error al cargar las apuestas. Verifica que el servidor esté corriendo.
          </td>
        </tr>
      `;
    }
  }

  // --- Renderizar tabla con paginación y filtro ---
  function renderizarTabla() {
    const query = buscador.value.toLowerCase().trim();
    
    // Filtrar apuestas
    const filtradas = apuestas.filter(a => {
      const usuario = (a.usuario?.toLowerCase() || "").includes(query);
      const telefono = (a.telefono?.toString() || "").includes(query);
      const estado = (a.estado_cuenta?.toLowerCase() || "").includes(query);
      const primer = (a.numeros?.primer?.toString() || "").includes(query);
      const segunda = (a.numeros?.segunda?.toString() || "").includes(query);
      const tercera = (a.numeros?.tercera?.toString() || "").includes(query);
      
      return usuario || telefono || estado || primer || segunda || tercera;
    });

    const totalPaginas = Math.ceil(filtradas.length / porPagina) || 1;
    paginaActual = Math.max(1, Math.min(paginaActual, totalPaginas));

    const inicio = (paginaActual - 1) * porPagina;
    const fin = inicio + porPagina;
    const visibles = filtradas.slice(inicio, fin);

    // Renderizar filas de la tabla
    if (visibles.length === 0) {
      tablaCuerpo.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-gray-600">
            No se encontraron apuestas${query ? ` para "${buscador.value}"` : ""}
          </td>
        </tr>
      `;
    } else {
      tablaCuerpo.innerHTML = visibles.map((a, index) => {
        const numeroFila = inicio + index + 1;
        const estadoColor = a.estado_cuenta?.toLowerCase() === "pago" 
          ? "text-green-600" 
          : "text-red-600";
        
        return `
          <tr class="border-b border-gray-200 hover:bg-gray-50 transition">
            <td class="py-3 px-4 text-gray-700">${numeroFila}</td>
            <td class="py-3 px-4 text-gray-800">${a.usuario || "-"}</td>
            <td class="py-3 px-4 text-gray-700">${a.telefono || "-"}</td>
            <td class="py-3 px-4 font-semibold text-blue-700">${a.numeros?.primer || "-"}</td>
            <td class="py-3 px-4 font-semibold text-indigo-700">${a.numeros?.segunda || "-"}</td>
            <td class="py-3 px-4 font-semibold text-purple-700">${a.numeros?.tercera || "-"}</td>
            <td class="py-3 px-4 ${estadoColor} font-semibold">${a.estado_cuenta || "-"}</td>
          </tr>
        `;
      }).join("");
    }

    // Renderizar paginación
    renderizarPaginacion(totalPaginas, filtradas.length);
  }

  // --- Renderizar controles de paginación ---
  function renderizarPaginacion(totalPaginas, totalItems) {
    if (totalPaginas <= 1) {
      paginacion.innerHTML = '';
      return;
    }

    paginacion.innerHTML = `
      <button 
        id="prevPage" 
        ${paginaActual === 1 ? 'disabled' : ''}
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-lg transition shadow-md"
      >
        ← Anterior
      </button>
      <div class="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 border border-gray-200">
        Página ${paginaActual} de ${totalPaginas} (${totalItems} ${totalItems === 1 ? 'apuesta' : 'apuestas'})
      </div>
      <button 
        id="nextPage" 
        ${paginaActual === totalPaginas ? 'disabled' : ''}
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-lg transition shadow-md"
      >
        Siguiente →
      </button>
    `;

    // Agregar event listeners a los botones de paginación
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (paginaActual > 1) {
          paginaActual--;
          renderizarTabla();
          // Scroll al inicio de la tabla
          tablaCuerpo.parentElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const query = buscador.value.toLowerCase().trim();
        const filtradas = apuestas.filter(a => {
          const usuario = (a.usuario?.toLowerCase() || "").includes(query);
          const telefono = (a.telefono?.toString() || "").includes(query);
          const estado = (a.estado_cuenta?.toLowerCase() || "").includes(query);
          const primer = (a.numeros?.primer?.toString() || "").includes(query);
          const segunda = (a.numeros?.segunda?.toString() || "").includes(query);
          const tercera = (a.numeros?.tercera?.toString() || "").includes(query);
          return usuario || telefono || estado || primer || segunda || tercera;
        });
        const totalPaginas = Math.ceil(filtradas.length / porPagina) || 1;
        
        if (paginaActual < totalPaginas) {
          paginaActual++;
          renderizarTabla();
          // Scroll al inicio de la tabla
          tablaCuerpo.parentElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }

  // --- Event listeners ---
  buscador.addEventListener("input", () => {
    paginaActual = 1; // Resetear a la primera página al buscar
    renderizarTabla();
  });

  // Exponer función cargarApuestas globalmente para que pueda ser llamada desde app.js
  window.cargarApuestas = cargarApuestas;

  console.log("✅ Tabla inicializada correctamente");
});
