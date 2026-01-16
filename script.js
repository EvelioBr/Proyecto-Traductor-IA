// Variables globales
let idiomaSeleccionado = 'en';

// Seleccionar elementos del dropdown
const selectHeader = document.querySelector('.select-header');
const selectOptions = document.querySelector('.select-options');
const options = document.querySelectorAll('.select-options .option');
const selectedText = document.querySelector('.selected-text');

// Evento click en el header para abrir/cerrar dropdown
selectHeader.addEventListener('click', () => {
    selectOptions.classList.toggle('active');
});

// Eventos click en cada opción
options.forEach(option => {
    option.addEventListener('click', () => {
        // Actualizar el texto mostrado
        selectedText.textContent = option.textContent;
        
        // Guardar el idioma seleccionado
        idiomaSeleccionado = option.getAttribute('data-value');
        
        // Cerrar el dropdown
        selectOptions.classList.remove('active');
        
        console.log('Idioma seleccionado:', idiomaSeleccionado);
    });
});

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select')) {
        selectOptions.classList.remove('active');
    }
});

// ===== PASO 2: Capturar el texto del textarea =====
// Seleccionar elementos
const botonTraducir = document.querySelector('.controle button:first-of-type');
const textareaInput = document.querySelector('.input-texto');
const resultadoParrafo = document.querySelector('.resultado p');

// Evento click en el botón de traducir
botonTraducir.addEventListener('click', () => {
    traduzir();
});

// ===== PASO 4: Manejar errores y agregar mejoras visuales =====
async function traduzir() {
    // Obtener el texto del textarea
    const textoATraducir = textareaInput.value;
    
    // Validar que no esté vacío
    if (textoATraducir.trim() === '') {
        resultadoParrafo.textContent = '⚠️ Por favor, ingresa un texto para traducir.';
        resultadoParrafo.style.color = '#ff6b6b';
        return;
    }
    
    // Deshabilitar botón mientras se traduce
    botonTraducir.disabled = true;
    botonTraducir.style.opacity = '0.5';
    
    // Mostrar estado de carga con spinner
    resultadoParrafo.textContent = '⏳ Traduciendo...';
    resultadoParrafo.style.color = '#ffffff99';
    
    try {
        // Mapeo de idiomas a códigos ISO
        const idiomas = {
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it'
        };
        
        // Obtener el código del idioma seleccionado
        const codigoIdioma = idiomas[idiomaSeleccionado];
        
        // Hacer llamada a la API de MyMemory
        const respuesta = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoATraducir)}&langpair=pt|${codigoIdioma}`
        );
        
        // Validar que la respuesta sea exitosa
        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        
        // Validar que la traducción fue exitosa
        if (datos.responseStatus === 200) {
            const textoTraducido = datos.responseData.translatedText;
            resultadoParrafo.textContent = textoTraducido;
            resultadoParrafo.style.color = '#ffffff';
            console.log('✅ Traducción exitosa:', textoTraducido);
        } else {
            throw new Error('La API no pudo procesar la solicitud');
        }
        
    } catch (error) {
        // Mostrar error específico
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('Failed to fetch')) {
            resultadoParrafo.textContent = '❌ Error de conexión. Verifica tu internet.';
        } else if (error.message.includes('servidor')) {
            resultadoParrafo.textContent = '❌ Error del servidor. Intenta de nuevo más tarde.';
        } else {
            resultadoParrafo.textContent = '❌ Error al traducir. Intenta de nuevo.';
        }
        resultadoParrafo.style.color = '#ff6b6b';
        
    } finally {
        // Reabilitar botón al terminar
        botonTraducir.disabled = false;
        botonTraducir.style.opacity = '1';
    }
}

// ===== PASO 5: Funcionalidad del botón de micrófono =====
const botonMicrófono = document.querySelector('.controle button:last-of-type');

// Verificar soporte de Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    botonMicrófono.disabled = true;
    botonMicrófono.title = 'Web Speech API no soportada en este navegador';
} else {
    const recognition = new SpeechRecognition();
    let isListening = false;
    
    // Configurar el reconocimiento de voz
    recognition.lang = 'pt-BR'; // Idioma portugués de Brasil
    recognition.continuous = false; // Una sola phrase por vez
    recognition.interimResults = false; // Solo resultados finales
    
    // Evento cuando detecta voz
    recognition.onstart = () => {
        isListening = true;
        botonMicrófono.style.backgroundColor = '#ff6b6b';
        botonMicrófono.title = 'Escuchando...';
        console.log('🎤 Micrófono activado');
    };
    
    // Evento cuando termina
    recognition.onend = () => {
        isListening = false;
        botonMicrófono.style.backgroundColor = '';
        botonMicrófono.title = 'Presiona para grabar';
    };
    
    // Evento cuando recibe el resultado
    recognition.onresult = (event) => {
        let textoCapturado = '';
        
        // Obtener el texto de todos los resultados
        for (let i = event.resultIndex; i < event.results.length; i++) {
            textoCapturado += event.results[i][0].transcript + ' ';
        }
        
        // Agregar el texto al textarea (sin reemplazar lo que ya hay)
        textareaInput.value += textoCapturado.trim();
        console.log('✅ Texto capturado:', textoCapturado);
    };
    
    // Evento de error
    recognition.onerror = (event) => {
        console.error('❌ Error del micrófono:', event.error);
        
        let mensajeError = '';
        switch (event.error) {
            case 'network':
                mensajeError = 'Error de conexión de red';
                break;
            case 'no-speech':
                mensajeError = 'No se detectó audio, intenta de nuevo';
                break;
            case 'audio-capture':
                mensajeError = 'No hay micrófono disponible';
                break;
            case 'not-allowed':
                mensajeError = 'Permiso de micrófono denegado';
                break;
            default:
                mensajeError = 'Error del micrófono: ' + event.error;
        }
        alert(mensajeError);
    };
    
    // Click en el botón del micrófono
    botonMicrófono.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            textareaInput.focus();
            recognition.start();
        }
    });
}