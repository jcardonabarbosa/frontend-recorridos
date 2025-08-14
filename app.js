document.addEventListener('DOMContentLoaded', function() {

    // --- BASE DE DATOS SIMULADA (SOLO PARA EL PRIMER ARRANQUE) ---
    const conductores = ["Mario García", "Fredy Grajales", "Julian Cardona"]; // Añade más nombres si es necesario
    const placas = ["NLW378", "NLX592"]; // Añade más placas si es necesario

    // --- ELEMENTOS DEL DOM ---
    const conductorSelect = document.getElementById('conductor');
    const placaSelect = document.getElementById('placa');
    const origenSelect = document.getElementById('origen');
    const destinoSelect = document.getElementById('destino');
    const fechaInput = document.getElementById('fecha');
    const form = document.getElementById('recorridoForm');
    const kmInicialInput = document.getElementById('km_inicial');
    const tablaRecorridos = document.getElementById('ultimosRecorridos');
    const URL_BACKEND = 'https://recorridos-api.onrender.com'; // <--- ¡Pega tu URL de Render aquí!

    // --- CARGAR DATOS INICIALES EN LOS FORMULARIOS (SELECTS) ---
    // (El código para cargar conductores, placas y ubicaciones se mantiene igual...)
    // ...
    // ... (Lo omito por brevedad, pero debe estar aquí) ...
    
    // Establecer la fecha actual
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Enero es 0
    const anio = hoy.getFullYear();
    fechaInput.value = `${dia}/${mes}/${anio}`;

    // --- LÓGICA DE INTERACTIVIDAD ---
    
    // Al seleccionar una placa, buscar y mostrar los últimos recorridos
    placaSelect.addEventListener('change', async function() {
        const placaSeleccionada = this.value;
        if (!placaSeleccionada) return;

        tablaRecorridos.innerHTML = `<tr><td colspan="5" class="text-center">Buscando recorridos...</td></tr>`;

        try {
            const response = await fetch(`${URL_BACKEND}/recorridos/${placaSeleccionada}`);
            if (!response.ok) throw new Error('No se pudo conectar con el servidor.');
            
            const data = await response.json();
            
            // Limpiar KM inicial (Corrección #3)
            kmInicialInput.value = '';

            // Mostrar últimos 5 recorridos (Corrección #2)
            if (data.ultimos5Recorridos && data.ultimos5Recorridos.length > 0) {
                tablaRecorridos.innerHTML = ''; // Limpiar tabla
                data.ultimos5Recorridos.forEach(r => {
                    tablaRecorridos.innerHTML += `
                        <tr>
                            <td>${r.fecha}</td>
                            <td>${r.pasajero}</td>
                            <td>${r.origen}</td>
                            <td>${r.destino}</td>
                            <td>${r.kmRecorridos.toFixed(0)}</td>
                        </tr>
                    `;
                });
            } else {
                tablaRecorridos.innerHTML = `<tr><td colspan="5" class="text-center">No hay recorridos previos para esta placa.</td></tr>`;
            }

        } catch (error) {
            console.error('Error al buscar recorridos:', error);
            tablaRecorridos.innerHTML = `<tr><td colspan="5" class="text-center text-danger">No se pudieron cargar los recorridos.</td></tr>`;
        }
    });

    // --- VALIDACIÓN Y ENVÍO DEL FORMULARIO ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const datos = {
            conductor: conductorSelect.value,
            placa: placaSelect.value,
            pasajero: document.getElementById('pasajero').value,
            fecha: fechaInput.value,
            hora: new Date().toLocaleTimeString('es-CO'),
            origen: origenSelect.value,
            destino: destinoSelect.value,
            km_inicial: parseFloat(kmInicialInput.value),
            km_final: parseFloat(document.getElementById('km_final').value)
        };

        // Validación simple en el frontend
        if (datos.km_final <= datos.km_inicial) {
            alert('Error: El kilometraje final debe ser mayor que el inicial.');
            return;
        }

        // Llamada al Backend para guardar los datos
        fetch(`${URL_BACKEND}/guardar-recorrido`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Error del servidor.') });
            }
            return response.json();
        })
        .then(data => {
            alert('¡Recorrido guardado con éxito!');
            location.reload(); // Recargar la página (Corrección #1)
        })
        .catch(error => {
            console.error('Error al guardar datos:', error);
            alert(`Error al guardar: ${error.message}`);
        });
    });
     // Cargar conductores y placas (código que ya tenías)
    conductores.forEach(nombre => {
        conductorSelect.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    });
    placas.forEach(placa => {
        placaSelect.innerHTML += `<option value="${placa}">${placa}</option>`;
    });
    // Cargar ubicaciones (código que ya tenías, aquí está de nuevo por si acaso)
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
    };
    function cargarUbicaciones(selectElement) {
        selectElement.innerHTML = '<option value="" disabled selected>Seleccione una ubicación...</option>';
        selectElement.innerHTML += '<optgroup label="Municipios">';
        municipios.forEach(m => selectElement.innerHTML += `<option value="${m}">${m}</option>`);
        selectElement.innerHTML += '</optgroup>';
        for (const linea in estacionesMetro) {
            selectElement.innerHTML += `<optgroup label="${linea}">`;
            estacionesMetro[linea].forEach(e => selectElement.innerHTML += `<option value="${e} (Metro)">${e}</option>`);
            selectElement.innerHTML += '</optgroup>';
        }
    }
    cargarUbicaciones(origenSelect);
    cargarUbicaciones(destinoSelect);
});