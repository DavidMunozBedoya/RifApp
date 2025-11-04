const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Para servir archivos estáticos de public (app.js, CSS, etc)
app.use(express.static(".")); // Para servir archivos estáticos de la raíz (index.html, tabla.js)

// Configuración de MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "MICONEXION";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "Rifa";

let db;
let apuestasCollection;

// Conectar a MongoDB
async function conectarDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("✅ Conectado a MongoDB");

    db = client.db(DB_NAME);
    apuestasCollection = db.collection(COLLECTION_NAME);

    // Índices
    await apuestasCollection.createIndex({ "numeros.primer": 1 }, { unique: true, sparse: true });
    await apuestasCollection.createIndex({ "numeros.segunda": 1 });
    await apuestasCollection.createIndex({ "numeros.tercera": 1 });

    console.log("✅ Índices creados correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    process.exit(1);
  }
}

// --- Utilidades ---
const utils = {
  formatearNumero: (num) => num.toString().padStart(3, "0"),
  validarNumero: (num) => {
    const n = parseInt(num);
    return !isNaN(n) && n >= 0 && n <= 999;
  },
  generarNumeroAleatorio: (excluidos = []) => {
    const disponibles = [];
    for (let i = 0; i <= 999; i++) {
      if (!excluidos.includes(i)) disponibles.push(i);
    }
    if (disponibles.length === 0) return null;
    return disponibles[Math.floor(Math.random() * disponibles.length)];
  },
};

// --- Servicios ---
const services = {
  verificarDisponibilidad: async (numero) => {
    const numeroFormateado = utils.formatearNumero(numero);
    const existente = await apuestasCollection.findOne({
      $or: [
        { "numeros.primer": numeroFormateado },
        { "numeros.segunda": numeroFormateado },
        { "numeros.tercera": numeroFormateado },
      ],
    });
    return existente === null;
  },

  obtenerNumerosEnUso: async () => {
    const apuestas = await apuestasCollection.find({}).toArray();
    const usados = new Set();
    apuestas.forEach((a) => {
      if (a.numeros) {
        usados.add(parseInt(a.numeros.primer));
        usados.add(parseInt(a.numeros.segunda));
        usados.add(parseInt(a.numeros.tercera));
      }
    });
    return Array.from(usados);
  },

  generarNumerosAleatorios: async (numeroPrincipal) => {
    const usados = await services.obtenerNumerosEnUso();
    const principal = parseInt(numeroPrincipal);
    usados.push(principal);

    const segundo = utils.generarNumeroAleatorio(usados);
    if (segundo === null) return { success: false, mensaje: "No hay números disponibles" };
    usados.push(segundo);

    const tercero = utils.generarNumeroAleatorio(usados);
    if (tercero === null) return { success: false, mensaje: "No hay suficientes números disponibles" };

    return {
      success: true,
      numeros: { segundo, tercero },
    };
  },

  registrarApuesta: async (data) => {
    try {
      // Validar disponibilidad de los tres números
      for (const n of [data.numeros.primer, data.numeros.segunda, data.numeros.tercera]) {
        const disponible = await services.verificarDisponibilidad(n);
        if (!disponible) {
          return { success: false, mensaje: `El número ${n} ya está en uso` };
        }
      }

      // ✅ CORREGIDO: mantener el valor exacto del radio button
      const apuesta = {
        ...data,
        estado_cuenta:
          data.estado_cuenta?.toLowerCase() === "pago"
            ? "Pago"
            : data.estado_cuenta?.toLowerCase() === "pagó"
            ? "Pago"
            : "Debe",
        fechaRegistro: new Date(),
        activa: true,
      };

      const result = await apuestasCollection.insertOne(apuesta);
      return { success: true, mensaje: "Apuesta registrada exitosamente", id: result.insertedId };
    } catch (err) {
      console.error("❌ Error al registrar apuesta:", err);
      if (err.code === 11000)
        return { success: false, mensaje: "Uno de los números ya está en uso" };
      throw err;
    }
  },

  obtenerApuestas: async () => {
    const apuestas = await apuestasCollection.find({ activa: true }).sort({ fechaRegistro: -1 }).toArray();
    return apuestas;
  },

  buscarPorUsuario: async (usuario) => {
    const apuestas = await apuestasCollection
      .find({ usuario: new RegExp(usuario, "i"), activa: true })
      .toArray();
    return apuestas;
  },
};

// --- Rutas API ---
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", message: "API funcionando correctamente", timestamp: new Date() });
});

app.post("/api/verificar-numero", async (req, res) => {
  const { numero } = req.body;
  if (!utils.validarNumero(numero))
    return res.status(400).json({ success: false, mensaje: "Número inválido" });

  const disponible = await services.verificarDisponibilidad(numero);
  res.json({
    success: true,
    disponible,
    mensaje: disponible
      ? `Número ${utils.formatearNumero(numero)} disponible`
      : `El número ${utils.formatearNumero(numero)} ya está en juego`,
  });
});

app.post("/api/generar-numeros", async (req, res) => {
  const { numeroPrincipal } = req.body;
  if (!utils.validarNumero(numeroPrincipal))
    return res.status(400).json({ success: false, mensaje: "Número principal inválido" });
  const resultado = await services.generarNumerosAleatorios(numeroPrincipal);
  res.json(resultado);
});

app.post("/api/registrar-apuesta", async (req, res) => {
  try {
    const { usuario, telefono, numeros, estado_cuenta } = req.body;

    if (!usuario || !telefono || !numeros)
      return res.status(400).json({ success: false, mensaje: "Datos incompletos" });

    if (!numeros.primer || !numeros.segunda || !numeros.tercera)
      return res.status(400).json({ success: false, mensaje: "Debe proporcionar los tres números" });

    for (const num of [numeros.primer, numeros.segunda, numeros.tercera]) {
      if (!utils.validarNumero(num))
        return res.status(400).json({ success: false, mensaje: `Número ${num} inválido` });
    }

    const apuestaData = {
      usuario: usuario.trim(),
      telefono: parseInt(telefono),
      estado_cuenta: estado_cuenta?.toLowerCase() || "debe",
      numeros: {
        primer: utils.formatearNumero(numeros.primer),
        segunda: utils.formatearNumero(numeros.segunda),
        tercera: utils.formatearNumero(numeros.tercera),
      },
    };

    const resultado = await services.registrarApuesta(apuestaData);
    res.status(resultado.success ? 201 : 400).json(resultado);
  } catch (err) {
    console.error("Error en /api/registrar-apuesta:", err);
    res.status(500).json({ success: false, mensaje: "Error al registrar la apuesta" });
  }
});

app.get("/api/apuestas", async (req, res) => {
  try {
    const apuestas = await services.obtenerApuestas();
    res.json(apuestas);
  } catch (err) {
    console.error("Error en /api/apuestas:", err);
    res.status(500).json({ success: false, mensaje: "Error al obtener apuestas" });
  }
});

app.get("/api/apuestas/usuario/:usuario", async (req, res) => {
  const { usuario } = req.params;
  const apuestas = await services.buscarPorUsuario(usuario);
  res.json({ success: true, cantidad: apuestas.length, apuestas });
});

app.get("/api/numeros-en-uso", async (_, res) => {
  const usados = await services.obtenerNumerosEnUso();
  res.json({ success: true, cantidad: usados.length, numeros: usados.sort((a, b) => a - b) });
});

// Ruta para servir el index.html desde la raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- Errores ---
app.use((req, res) => res.status(404).json({ success: false, mensaje: "Ruta no encontrada" }));

app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ success: false, mensaje: "Error interno del servidor" });
});

// --- Iniciar servidor ---
async function iniciarServidor() {
  await conectarDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
  });
}

process.on("SIGINT", () => {
  console.log("\n⏳ Cerrando servidor...");
  process.exit(0);
});

iniciarServidor().catch((err) => {
  console.error("❌ Error al iniciar servidor:", err);
  process.exit(1);
});
