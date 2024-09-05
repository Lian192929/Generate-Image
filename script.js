const apiKey = "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";
const maxImages = 4; // Número de imágenes a generar para cada prompt
const maxRetries = 3; // Número de reintentos en caso de fallar la solicitud
let selectedImageNumber = null;

// Función para deshabilitar el botón de generar durante el procesamiento
function disableGenerateButton() {
    document.getElementById("generate").disabled = true;
}

// Función para habilitar el botón de generar después del procesamiento
function enableGenerateButton() {
    document.getElementById("generate").disabled = false;
}

// Función para limpiar la cuadrícula de imágenes
function clearImageGrid() {
    const imageGrid = document.getElementById("image-grid");
    imageGrid.innerHTML = "";
}

// Función para generar y mostrar la imagen
async function generateAndDisplayImage(prompt) {
    try {
        const loadingMessage = document.getElementById("loading");
        loadingMessage.style.display = "block";

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/prompthero/openjourney',
            { inputs: prompt },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'blob', // Cambiado para recibir como Blob
            }
        );

        const imgUrl = URL.createObjectURL(response.data); // Crear una URL para el blob recibido
        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = `Generated Image`;
        img.onclick = () => downloadImage(imgUrl); // Descargar la imagen al hacer clic
        document.getElementById("image-grid").appendChild(img);

    } catch (error) {
        console.error('Error generando la imagen:', error);
        alert('Lo siento, ocurrió un error generando la imagen.');
    } finally {
        const loadingMessage = document.getElementById("loading");
        loadingMessage.style.display = "none";
        enableGenerateButton();
    }
}

// Evento para el botón de generar imágenes
document.getElementById("generate").addEventListener('click', () => {
    const input = document.getElementById("user-prompt").value;
    if (input.trim() === "") {
        alert("Por favor, introduce un prompt válido.");
    } else {
        disableGenerateButton();
        clearImageGrid();
        generateAndDisplayImage(input);
    }
});

// Función para descargar la imagen
function downloadImage(imgUrl) {
    const link = document.createElement("a");
    link.href = imgUrl;
    link.download = `generated_image.png`;
    link.click();
}
