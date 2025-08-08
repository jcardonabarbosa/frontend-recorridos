document.addEventListener('DOMContentLoaded', function() {

    // --- BASE DE DATOS SIMULADA (Esto vendría del servidor en una app real) ---

    const conductores = ["Mario García", "Fredy Grajales", "Julian Cardona"];
    const placas = ["NLW378", "NLX592"];
    
    const municipios = ["Barbosa", "Bello", "Caldas", "Copacabana", "Envigado", "Girardota", "Itagüí", "La Estrella", "Medellín", "Sabaneta"];
    const estacionesMetro = {
        "Línea A": ["Niquía", "Bello", "Madera", "Acevedo", "Tricentenario", "Caribe", "Universidad", "Hospital", "Prado", "Parque Berrío", "San Antonio", "Alpujarra", "Exposiciones", "Industriales", "Poblado", "Aguacatala", "Ayurá", "Envigado", "Itagüí", "Sabaneta", "La Estrella"],
        "Línea B": ["San Antonio", "Cisneros", "Suramericana", "Estadio", "Floresta", "Santa Lucía", "San Javier"],
	"Linea H": ["Las Torres", "Villa Sierra"],
	"Línea J": ["Juan XXIII", "Vallejuelos", "La Aurora"],
	"Línea K": ["Andalucía", "Popular", "Santo Domingo Savio"],
	"Línea M": ["El Pinal", "Trece de Noviembre"],
	"Línea P": ["SENA Pedregal", "Doce de Octubre", "El Progreso"],
        "Tranvía T": ["San Antonio", "San José", "Pabellón del Agua", "Bicentenario", "Buenos Aires", "Miraflores", "Loyola", "Alejandro Echavarría", "Oriente"],
        // ... aquí se agregarían las demás líneas (J, K, L, H, M, P)
    };

    // Datos de ejemplo sobre el último KM de un vehículo
    const ultimoKmPorPlaca = {
        "NLW378": 40000,
        "NLX592": 15000,
    };

    // Datos de ejemplo de últimos 5 recorridos
    const recorridosAnteriores = {
        "NLW378": [
            { fecha: "2025-08-02", pasajero: "Empresa X", origen: "Itagüí", destino: "Medellín", km: 15 },
            { fecha: "2025-08-02", pasajero: "Juan Pérez", origen: "Envigado", destino: "Sabaneta", km: 8 },
        ],
        "NLX592": [
             { fecha: "2025-08-01", pasajero: "Sofía Gómez", origen: "Bello", destino: "Poblado", km: 25 },
        ]
    };
    

    // --- CARGAR DATOS EN LOS FORMULARIOS (SELECTS) ---

    const conductorSelect = document.getElementById('conductor');
    const placaSelect = document.getElementById('placa');
    const origenSelect = document.getElementById('origen');
    const destinoSelect = document.getElementById('destino');
    const fechaInput = document.getElementById('fecha');

    // Cargar conductores
    conductores.forEach(nombre => {
        conductorSelect.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    });

    // Cargar placas
    placas.forEach(placa => {
        placaSelect.innerHTML += `<option value="${placa}">${placa}</option>`;
    });
    
    // Cargar Origen y Destino
    function cargarUbicaciones(selectElement) {
        selectElement.innerHTML = '<option value="" disabled selected>Seleccione una ubicación...</option>';
        selectElement.innerHTML += '<optgroup label="Municipios">';
        municipios.forEach(m => {
            selectElement.innerHTML += `<option value="${m}">${m}</option>`;
        });
        selectElement.innerHTML += '</optgroup>';

        for (const linea in estacionesMetro) {
            selectElement.innerHTML += `<optgroup label="${linea}">`;
            estacionesMetro[linea].forEach(e => {
                 selectElement.innerHTML += `<option value="${e} (Metro)">${e}</option>`;
            });
            selectElement.innerHTML += '</optgroup>';
        }
    }

    cargarUbicaciones(origenSelect);
    cargarUbicaciones(destinoSelect);
    
    // Establecer la fecha actual
    const hoy = new Date();
    fechaInput.value = hoy.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });


    // --- LÓGICA DE INTERACTIVIDAD ---
    
    const kmInicialInput = document.getElementById('km_inicial');
    const tablaRecorridos = document.getElementById('ultimosRecorridos');

    // Al seleccionar una placa, rellenar KM inicial y mostrar últimos recorridos
    placaSelect.addEventListener('change', function() {
        const placaSeleccionada = this.value;
        
        // Rellenar KM inicial
        const ultimoKm = ultimoKmPorPlaca[placaSeleccionada] || 0;
        kmInicialInput.value = ultimoKm;
        
        // Mostrar últimos recorridos
        tablaRecorridos.innerHTML = ''; // Limpiar tabla
        const recorridos = recorridosAnteriores[placaSeleccionada];
        
        if (recorridos && recorridos.length > 0) {
            recorridos.forEach(r => {
                tablaRecorridos.innerHTML += `
                    <tr>
                        <td>${r.fecha}</td>
                        <td>${r.pasajero}</td>
                        <td>${r.origen}</td>
                        <td>${r.destino}</td>
                        <td>${r.km}</td>
                    </tr>
                `;
            });
        } else {
            tablaRecorridos.innerHTML = `<tr><td colspan="5" class="text-center">No hay recorridos registrados para este vehículo.</td></tr>`;
        }
    });


    // --- VALIDACIÓN Y ENVÍO DEL FORMULARIO ---

    const form = document.getElementById('recorridoForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita que la página se recargue

        // Recopilar datos
        const kmInicial = parseFloat(document.getElementById('km_inicial').value);
        const kmFinal = parseFloat(document.getElementById('km_final').value);
        const ultimoKmRegistrado = ultimoKmPorPlaca[placaSelect.value] || 0;

        // 1. Validar que el KM Final sea mayor que el Inicial
        if (kmFinal <= kmInicial) {
            alert('Error: El kilometraje final debe ser mayor que el inicial.');
            return; // Detiene el envío
        }
        
        // 2. Validar que el KM inicial no sea menor al último registrado
        if (kmInicial < ultimoKmRegistrado) {
            alert(`Error: El kilometraje inicial (${kmInicial}) no puede ser menor al último registrado para esta placa (${ultimoKmRegistrado}).`);
            return;
        }

        // Si todas las validaciones pasan
        const datos = {
            conductor: conductorSelect.value,
            placa: placaSelect.value,
            pasajero: document.getElementById('pasajero').value,
            fecha: fechaInput.value,
            hora: new Date().toLocaleTimeString('es-CO'),
            origen: origenSelect.value,
            destino: destinoSelect.value,
            km_inicial: kmInicial,
            km_final: kmFinal
        };
        
        // --- ESTE ES EL NUEVO BLOQUE PARA PEGAR ---
// Le decimos al navegador que "llame por teléfono" a nuestro motor.

// La dirección del motor: http://localhost:3000 y la puerta que queremos tocar: /guardar-recorrido
fetch('https://recorridos-api.onrender.com/guardar-recorrido', {
    method: 'POST', // Le decimos que estamos ENVIANDO datos (un POST).
    headers: {
        'Content-Type': 'application/json', // Le avisamos que el paquete de datos está en formato JSON.
    },
    body: JSON.stringify(datos), // Convertimos nuestros datos en un "paquete" de texto y lo enviamos.
})
.then(response => {
    // Una vez que el motor contesta, revisamos si la respuesta fue "OK".
    if (!response.ok) {
        // Si el motor respondió con un error, creamos un error personalizado para verlo en la alerta.
        throw new Error('Respuesta del servidor no fue OK. Revisa la terminal del backend.');
    }
    return response.json(); // Si todo fue OK, leemos la respuesta.
})
.then(data => {
    // Si llegamos aquí, ¡todo salió bien!
    console.log(data.message); // Muestra el mensaje de éxito del servidor en la consola del navegador.
    alert('¡Recorrido guardado con éxito en Google Drive!');

    // Limpiamos el formulario para el siguiente registro.
    form.reset();
    tablaRecorridos.innerHTML = `<tr><td colspan="5" class="text-center">Seleccione un vehículo para ver sus recorridos.</td></tr>`;
    kmInicialInput.value = '';
})
.catch(error => {
    // Si ocurre cualquier error en la comunicación (ej: el motor está apagado), lo mostramos.
    console.error('Error al enviar los datos:', error);
    alert(`Error al guardar: ${error.message}. ¿Está el motor (backend) encendido?`);
});
        
        // Aquí iría la llamada al backend (fetch) para guardar los datos
        // fetch('/api/guardar-recorrido', { method: 'POST', body: JSON.stringify(datos), ... });
        
        form.reset(); // Limpiar el formulario
        tablaRecorridos.innerHTML = `<tr><td colspan="5" class="text-center">Seleccione un vehículo para ver sus recorridos.</td></tr>`;
        kmInicialInput.value = '';
    });
});