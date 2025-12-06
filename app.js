// Variables globales
let names = [];
let currentIndex = 0;
let shuffleCount = 10;

// Elementos del DOM
const inputSection = document.getElementById('inputSection');
const resultsSection = document.getElementById('resultsSection');
const namesInput = document.getElementById('namesInput');
const shuffleCountInput = document.getElementById('shuffleCount');
const startButton = document.getElementById('startButton');
const namesList = document.getElementById('namesList');
const nextButton = document.getElementById('nextButton');
const shuffleAgainButton = document.getElementById('shuffleAgainButton');
const resetButton = document.getElementById('resetButton');
const shareButton = document.getElementById('shareButton');
const fabContainer = document.getElementById('fabContainer');

// Event Listeners
startButton.addEventListener('click', startDraw);
nextButton.addEventListener('click', highlightNext);
shuffleAgainButton.addEventListener('click', reshuffleNames);
resetButton.addEventListener('click', resetApp);
shareButton.addEventListener('click', shareURL);

// Cargar estado desde URL al iniciar
window.addEventListener('load', loadStateFromURL);

// Función para iniciar el sorteo
function startDraw() {
    const input = namesInput.value.trim();
    
    if (!input) {
        alert('⚠️ Por favor ingresa al menos un nombre');
        return;
    }
    
    // Obtener nombres (filtrar líneas vacías)
    names = input.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    if (names.length === 0) {
        alert('⚠️ Por favor ingresa nombres válidos');
        return;
    }
    
    if (names.length < 2) {
        alert('⚠️ Necesitas al menos 2 nombres para hacer un sorteo');
        return;
    }
    
    // Obtener número de mezclas
    shuffleCount = parseInt(shuffleCountInput.value) || 10;
    
    // Mezclar los nombres
    shuffleNames(shuffleCount);
    
    // Mostrar la sección de resultados
    inputSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    fabContainer.classList.remove('hidden');
    
    // Renderizar la lista
    renderNamesList();
    
    // Resetear el índice
    currentIndex = 0;
    
    // Deshabilitar botón de siguiente
    nextButton.disabled = false;
    
    // Guardar estado en URL
    saveStateToURL();
}

// Función para mezclar nombres N veces
function shuffleNames(times) {
    for (let i = 0; i < times; i++) {
        // Algoritmo de Fisher-Yates
        for (let j = names.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [names[j], names[k]] = [names[k], names[j]];
        }
    }
}

// Función para renderizar la lista de nombres
function renderNamesList() {
    namesList.innerHTML = '';
    
    names.forEach((name, index) => {
        const nameItem = document.createElement('div');
        nameItem.className = 'name-item';
        nameItem.dataset.index = index;
        nameItem.style.animationDelay = `${index * 0.1}s`;
        
        nameItem.innerHTML = `
            <div class="number">${index + 1}</div>
            <div class="name">${name}</div>
        `;
        
        namesList.appendChild(nameItem);
    });
}

// Función para iluminar el siguiente nombre
function highlightNext() {
    if (currentIndex >= names.length) {
        return;
    }
    
    // Deshabilitar botón durante la animación
    nextButton.disabled = true;
    
    const items = document.querySelectorAll('.name-item');
    
    // Validar que el elemento existe
    if (!items[currentIndex]) {
        console.error('Elemento no encontrado en el índice:', currentIndex);
        nextButton.disabled = false;
        return;
    }
    
    const currentItem = items[currentIndex];
    
    // Remover clase highlight de todos
    items.forEach(item => {
        item.classList.remove('highlight');
    });
    
    // Agregar clase highlight al actual
    currentItem.classList.add('highlight');
    currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Después de 2 segundos, marcar como seleccionado y pasar al siguiente
    setTimeout(() => {
        currentItem.classList.remove('highlight');
        currentItem.classList.add('selected');
        
        currentIndex++;
        
        // Si llegamos al final, deshabilitar botón
        if (currentIndex >= names.length) {
            nextButton.disabled = true;
            nextButton.style.background = 'linear-gradient(135deg, #6c757d 0%, #868e96 100%)';
        } else {
            // Habilitar botón para el siguiente
            nextButton.disabled = false;
        }
        
        // Guardar estado en URL
        saveStateToURL();
    }, 2000);
}

// Función para revolver de nuevo
function reshuffleNames() {
    // Confirmar acción
    if (currentIndex > 0 && currentIndex < names.length) {
        if (!confirm('¿Estás seguro de que quieres revolver de nuevo? Se perderá el progreso actual.')) {
            return;
        }
    }
    
    // Mezclar de nuevo
    shuffleNames(shuffleCount);
    
    // Resetear índice
    currentIndex = 0;
    
    // Re-renderizar
    namesList.innerHTML = '';
    renderNamesList();
    
    // Habilitar botón de siguiente
    nextButton.disabled = false;
    nextButton.textContent = '▶️';
    
    // Guardar estado en URL
    saveStateToURL();
}

// Función para resetear la aplicación
function resetApp() {
    // Confirmar si hay progreso
    if (currentIndex > 0) {
        if (!confirm('¿Estás seguro de que quieres volver al inicio? Se perderá todo el progreso.')) {
            return;
        }
    }
    
    // Limpiar variables
    names = [];
    currentIndex = 0;
    
    // Mostrar sección de input
    resultsSection.classList.add('hidden');
    fabContainer.classList.add('hidden');
    inputSection.classList.remove('hidden');
    
    // Limpiar lista
    namesList.innerHTML = '';
    
    // Resetear botón de siguiente
    nextButton.disabled = false;
    nextButton.textContent = '▶️ Siguiente';
    
    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Función para guardar el estado en la URL
function saveStateToURL() {
    const state = {
        names: names,
        currentIndex: currentIndex,
        shuffleCount: shuffleCount
    };
    
    // Convertir a JSON y codificar en Base64
    const stateString = btoa(encodeURIComponent(JSON.stringify(state)));
    
    // Actualizar URL sin recargar la página
    const newURL = `${window.location.pathname}?state=${stateString}`;
    window.history.replaceState({}, document.title, newURL);
}

// Función para cargar el estado desde la URL
function loadStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const stateString = urlParams.get('state');
    
    if (!stateString) {
        return; // No hay estado guardado
    }
    
    try {
        // Decodificar Base64 y parsear JSON
        const state = JSON.parse(decodeURIComponent(atob(stateString)));
        
        // Validar que el estado tenga los datos necesarios
        if (!state.names || !Array.isArray(state.names) || state.names.length === 0) {
            return;
        }
        
        // Restaurar variables
        names = state.names;
        currentIndex = state.currentIndex || 0;
        shuffleCount = state.shuffleCount || 10;
        
        // Mostrar sección de resultados
        inputSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        fabContainer.classList.remove('hidden');
        
        // Renderizar la lista
        renderNamesList();
        
        // Marcar los nombres ya seleccionados
        const items = document.querySelectorAll('.name-item');
        items.forEach((item, index) => {
            if (index < currentIndex) {
                item.classList.add('selected');
            }
        });
        
        // Actualizar estado del botón
        if (currentIndex >= names.length) {
            nextButton.disabled = true;
            nextButton.style.background = 'linear-gradient(135deg, #6c757d 0%, #868e96 100%)';
        } else {
            nextButton.disabled = false;
        }
        
    } catch (error) {
        console.error('Error al cargar el estado desde la URL:', error);
        // Si hay un error, limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Agregar efecto de teclado para textarea
namesInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        startDraw();
    }
});

// Agregar listener para cambios en el historial
window.addEventListener('popstate', loadStateFromURL);

// Función para compartir/copiar la URL
async function shareURL() {
    const currentURL = window.location.href;
    
    try {
        // Copiar al portapapeles
        await navigator.clipboard.writeText(currentURL);
        
        // Feedback visual
        const originalEmoji = shareButton.textContent;
        shareButton.textContent = '✅';
        shareButton.classList.add('copied');
        
        // Mostrar mensaje temporal
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = '¡URL copiada al portapapeles!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            shareButton.textContent = originalEmoji;
            shareButton.classList.remove('copied');
            toast.remove();
        }, 2000);
        
    } catch (error) {
        console.error('Error al copiar:', error);
        
        // Fallback: mostrar la URL para copiar manualmente
        const fallbackToast = document.createElement('div');
        fallbackToast.className = 'toast';
        fallbackToast.innerHTML = `<input type="text" value="${currentURL}" readonly style="width: 100%; padding: 5px; border: none; border-radius: 5px;">`;
        fallbackToast.style.width = '300px';
        document.body.appendChild(fallbackToast);
        
        fallbackToast.querySelector('input').select();
        
        setTimeout(() => {
            fallbackToast.remove();
        }, 4000);
    }
}
