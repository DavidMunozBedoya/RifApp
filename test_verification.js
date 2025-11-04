// Script de prueba para verificar la validación de números
// Ejecutar con: node test-verification.js

const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'sistema_apuestas';

async function probarVerificacion() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB\n');
        
        const db = client.db(DB_NAME);
        const apuestasCollection = db.collection('apuestas');
        
        // Número a probar
        const numeroProbar = 114;
        const numeroFormateado = numeroProbar.toString().padStart(3, '0');
        
        console.log(`🔍 Buscando número: ${numeroFormateado}\n`);
        
        // Buscar en todos los campos
        const resultado = await apuestasCollection.findOne({
            $or: [
                { "numeros.primer": numeroFormateado },
                { "numeros.segunda": numeroFormateado },
                { "numeros.tercera": numeroFormateado }
            ]
        });
        
        if (resultado) {
            console.log('❌ NÚMERO ENCONTRADO EN LA BASE DE DATOS');
            console.log('📋 Detalles del registro:\n');
            console.log('Usuario:', resultado.usuario);
            console.log('Teléfono:', resultado.telefono);
            console.log('Números:', resultado.numeros);
            console.log('Estado:', resultado.estado_cuenta);
            console.log('Fecha:', resultado.fechaRegistro);
            console.log('\n⚠️  Este número NO debe estar disponible para selección\n');
        } else {
            console.log('✅ Número disponible, no está registrado\n');
        }
        
        // Mostrar todos los números en uso
        console.log('📊 Listando todos los números en uso:\n');
        const todasApuestas = await apuestasCollection.find({}).toArray();
        
        const numerosEnUso = new Set();
        todasApuestas.forEach((apuesta, index) => {
            console.log(`Apuesta ${index + 1}:`);
            console.log(`  Usuario: ${apuesta.usuario}`);
            console.log(`  Números: ${apuesta.numeros.primer}, ${apuesta.numeros.segunda}, ${apuesta.numeros.tercera}`);
            
            numerosEnUso.add(apuesta.numeros.primer);
            numerosEnUso.add(apuesta.numeros.segunda);
            numerosEnUso.add(apuesta.numeros.tercera);
        });
        
        console.log(`\n📈 Total de números únicos en uso: ${numerosEnUso.size}`);
        console.log(`📈 Números disponibles: ${1000 - numerosEnUso.size}\n`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔌 Conexión cerrada');
    }
}

probarVerificacion();