const apiKey = "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";
const maxImages = 4; // Número de imágenes a generar para cada prompt
const maxRetries = 3; // Número de reintentos en caso de fallar la solicitud
let selectedImageNumber = null;

// Función para generar un número aleatorio entre min y max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

// Función para generar imágenes
async function generateImages(input) {
    disableGenerateButton();
    clearImageGrid();

    const loading = document.getElementById("loading");
    loading.style.display = "block";

    const imageUrls = [];

    for (let i = 0; i < maxImages; i++) {
        const randomNumber = getRandomNumber(1, 10000);
        const prompt = `${input} ${randomNumber}`;

        let success = false;
        let retries = 0;

        while (!success && retries < maxRetries) {
            try {
                const response = await fetch(
                    "https://api-inference.huggingface.co/models/prompthero/openjourney",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({ inputs: prompt }),
                    }
                );

                if (!response.ok) {
                    throw new Error(`Error HTTP! Estado: ${response.status}`);
                }

                const blob = await response.blob();
                const imgUrl = URL.createObjectURL(blob);
                imageUrls.push(imgUrl);

                const img = document.createElement("img");
                img.src = imgUrl;
                img.alt = `art-${i + 1}`;
                img.onclick = () => downloadImage(imgUrl, i);
                document.getElementById("image-grid").appendChild(img);

                success = true; // Si tiene éxito, salir del bucle
            } catch (error) {
                retries++;
                if (retries >= maxRetries) {
                    alert(`¡Falló la generación de la imagen! Error: ${error.message}`);
                    console.error("Error generando la imagen:", error);
                } else {
                    console.log(`Reintentando... (${retries}/${maxRetries})`);
                }
            }
        }
    }

    loading.style.display = "none";
    enableGenerateButton();
    selectedImageNumber = null; // Reiniciar el número de imagen seleccionada
}

// Evento para el botón de generar imágenes
document.getElementById("generate").addEventListener('click', () => {
    const input = document.getElementById("user-prompt").value;
    if (input.trim() === "") {
        alert("Por favor, introduce un prompt válido.");
    } else {
        generateImages(input);
    }
});

// Función para descargar la imagen
function downloadImage(imgUrl, imageNumber) {
    const link = document.createElement("a");
    link.href = imgUrl;
    link.download = `image-${imageNumber + 1}.jpg`;
    link.click();
}
