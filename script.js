const pokemonData = {
    "Pikachu": { "type": "Electrico", "color": "#FFFF00" },
    "Jolteon": { "type": "Electrico", "color": "#FFD700" },
    "Zapdos": { "type": "Electrico", "color": "#F4C542" },
    "Charmander": { "type": "Fuego", "color": "#FFA500" },
    "Flareon": { "type": "Fuego", "color": "#FF4500" },
    "Moltres": { "type": "Fuego", "color": "#FF6347" },
    "Squirtle": { "type": "Agua", "color": "#00BFFF" },
    "Vaporeon": { "type": "Agua", "color": "#1E90FF" },
    "Gyarados": { "type": "Agua", "color": "#4169E1" },
    "Bulbasaur": { "type": "Planta", "color": "#7CFC00" },
    "Leafeon": { "type": "Planta", "color": "#32CD32" },
    "Venusaur": { "type": "Planta", "color": "#228B22" }
};

const pokemonNames = Object.keys(pokemonData);

function updateColorPreview(input) {
    const previewElement = document.getElementById(`${input.name}-preview`);
    if (previewElement) {
        previewElement.style.backgroundColor = input.value;
    }
}

function generateRandomPokemon(player, pokemonNum) {
    let randomName;
    do {
        randomName = pokemonNames[Math.floor(Math.random() * pokemonNames.length)];
    } while (isNameInUse(randomName, player));

    const nameInput = document.querySelector(`[name="${player}-pokemon${pokemonNum}-name"]`);
    nameInput.value = randomName;

    const { type, color } = pokemonData[randomName];
    setTypeAndColor(player, pokemonNum, type, color);

    const randomLife = Math.floor(Math.random() * 401) + 100;
    const lifeInput = document.querySelector(`[name="${player}-pokemon${pokemonNum}-life"]`);
    lifeInput.value = randomLife;
    document.getElementById(`${player}-pokemon${pokemonNum}-life-value`).textContent = randomLife;
}

function setTypeAndColor(player, pokemonNum, type, color) {
    const typeSelect = document.querySelector(`[name="${player}-pokemon${pokemonNum}-type"]`);
    setSelectValue(typeSelect, type);

    const colorInput = document.querySelector(`[name="${player}-pokemon${pokemonNum}-color"]`);
    colorInput.value = color;
    updateColorPreview(colorInput);
}

function setSelectValue(selectElement, value) {
    let optionFound = false;
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value.toLowerCase() === value.toLowerCase()) {
            selectElement.selectedIndex = i;
            optionFound = true;
            break;
        }
    }
    if (!optionFound) {
        const newOption = document.createElement("option");
        newOption.value = value;
        newOption.text = value.charAt(0).toUpperCase() + value.slice(1);
        selectElement.add(newOption);
        selectElement.selectedIndex = selectElement.options.length - 1;
    }
}

function isNameInUse(name, player) {
    const name1 = document.querySelector(`[name="${player}-pokemon1-name"]`).value;
    const name2 = document.querySelector(`[name="${player}-pokemon2-name"]`).value;
    return name === name1 || name === name2;
}

function generateAllRandomPokemon() {
    ['player1', 'player2'].forEach(player => {
        [1, 2].forEach(pokemonNum => generateRandomPokemon(player, pokemonNum));
    });
    generateQRCode();
}

function copyToClipboard() {
    if (!document.getElementById('pokemon-form').checkValidity()) {
        alert('Por favor, completa todos los campos antes de copiar el texto.');
        return;
    }
    const formData = new FormData(document.getElementById('pokemon-form'));
    let resultString = '';

    ['player1', 'player2'].forEach(player => {
        resultString += `Pokemon ${player}[2] = {\n`;
        for (let i = 1; i <= 2; i++) {
            const name = formData.get(`${player}-pokemon${i}-name`);
            const type = formData.get(`${player}-pokemon${i}-type`);
            const color = formData.get(`${player}-pokemon${i}-color`);
            const life = formData.get(`${player}-pokemon${i}-life`);
            const rgb = hexToRgb(color);
            const trueValue = i === 1 ? 'true' : 'false';

            resultString += `    {"${name}", "${type}", ${rgb.r}, ${rgb.g}, ${rgb.b}, ${life}, false, ${trueValue}},  // ${i === 1 ? 'Primer' : 'Segundo'} Pokémon del ${player === 'player1' ? 'jugador 1' : 'jugador 2'} \n`;
        }
        resultString += `};\n\n`;
    });

    navigator.clipboard.writeText(resultString).then(() => {
        alert('El texto se ha copiado al portapapeles');
    }, () => {
        alert('No se pudo copiar el texto al portapapeles');
    });
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function validateNames(player) {
    const name1 = document.querySelector(`[name="${player}-pokemon1-name"]`).value;
    const name2 = document.querySelector(`[name="${player}-pokemon2-name"]`).value;

    if (name1 && name2 && name1 === name2) {
        alert('Los nombres de los Pokémon no pueden ser iguales para el mismo jugador.');
        document.querySelector(`[name="${player}-pokemon2-name"]`).value = '';
        return;
    }

    [1, 2].forEach(pokemonNum => {
        const name = document.querySelector(`[name="${player}-pokemon${pokemonNum}-name"]`).value;
        if (pokemonData[name]) {
            const { type, color } = pokemonData[name];
            setTypeAndColor(player, pokemonNum, type, color);
        }
    });
}

function generateShareableId() {
    if (!document.getElementById('pokemon-form').checkValidity()) {
        alert('Por favor, completa todos los campos antes de copiar el texto.');
        return;
    }
    const data = extractFormData();
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    navigator.clipboard.writeText(compressed).then(() => {
        alert('El texto se ha copiado al portapapeles');
    }, () => {
        alert('No se pudo copiar el texto al portapapeles');
    });
    return compressed;
}

function extractFormData() {
    const data = {};
    ['player1', 'player2'].forEach(player => {
        data[player] = [];
        for (let i = 1; i <= 2; i++) {
            const name = document.querySelector(`[name="${player}-pokemon${i}-name"]`).value;
            const type = document.querySelector(`[name="${player}-pokemon${i}-type"]`).value;
            const color = document.querySelector(`[name="${player}-pokemon${i}-color"]`).value;
            const life = document.querySelector(`[name="${player}-pokemon${i}-life"]`).value;
            data[player].push({ name, type, color, life });
        }
    });
    return data;
}

function importFromId(sharedId) {
    try {
        const jsonString = LZString.decompressFromEncodedURIComponent(sharedId);
        const data = JSON.parse(jsonString);
        Object.keys(data).forEach(player => {
            data[player].forEach((pokemon, index) => {
                const pokemonNum = index + 1;
                document.querySelector(`[name="${player}-pokemon${pokemonNum}-name"]`).value = pokemon.name;
                document.querySelector(`[name="${player}-pokemon${pokemonNum}-type"]`).value = pokemon.type;
                document.querySelector(`[name="${player}-pokemon${pokemonNum}-color"]`).value = pokemon.color;
                document.querySelector(`[name="${player}-pokemon${pokemonNum}-life"]`).value = pokemon.life;
                document.getElementById(`${player}-pokemon${pokemonNum}-life-value`).textContent = pokemon.life;
                updateColorPreview(document.querySelector(`[name="${player}-pokemon${pokemonNum}-color"]`));
            });
        });
        alert("Configuración importada exitosamente.");
    } catch (error) {
        console.error(error);
        alert("ID inválido. Por favor verifica e intenta nuevamente.");
    }
}

function generateQRCode() {
    const form = document.getElementById('pokemon-form');
    const qrCodeContainer = document.getElementById('qrcode');

    if (!form.checkValidity()) {
        qrCodeContainer.innerHTML = "";
        return;
    }

    const data = extractFormData();
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);

    if (compressed.length > 1056) {
        alert("Los datos son demasiado grandes para generar un QR.");
        qrCodeContainer.innerHTML = "";
        return;
    }

    qrCodeContainer.innerHTML = "";
    new QRCode(qrCodeContainer, {
        text: compressed,
        width: 200,
        height: 200,
        correctLevel: QRCode.CorrectLevel.L,
    });
}

document.addEventListener('input', generateQRCode);
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pokemon-form');
    form.addEventListener('input', () => {
        if (areFieldsValid() && hasFormChanged()) {
            generateQRCode();
        }
    });
    if (areFieldsValid()) {
        generateQRCode();
    }
});

function openPopup() {
    document.getElementById('import-popup').style.display = 'flex';
}

function closePopup() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    document.getElementById('import-popup').style.display = 'none';
}

let cameraStream = null;

function activateCamera() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
            cameraStream = stream;
            video.srcObject = stream;
            video.play();
            requestAnimationFrame(scanQRCode);
        })
        .catch((err) => {
            console.error('Error al activar la cámara:', err);
            alert('No se pudo activar la cámara. Por favor verifica los permisos.');
        });

    function scanQRCode() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" });

            if (code) {
                importFromId(code.data);
                closePopup();
                alert(`QR escaneado con éxito: ${code.data}`);
                return;
            }
        }
        requestAnimationFrame(scanQRCode);
    }
}

function importFromQRCode() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const imageDataUrl = await readFileAsDataURL(file);
            const image = new Image();
            image.src = imageDataUrl;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(image, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code) {
                    importFromId(code.data);
                    closePopup();
                    alert('QR importado con éxito: ' + code.data);
                } else {
                    alert('No se pudo leer el código QR. Por favor intenta nuevamente.');
                }
            };
        } catch (error) {
            console.error(error);
            alert('No se pudo leer el código QR. Por favor intenta nuevamente.');
        }
    };

    input.click();
}

function importFromCamera(callbacks = {}) {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let stream;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
            stream = mediaStream;
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.play();
            requestAnimationFrame(tick);
        })
        .catch((err) => {
            console.error(err);
            if (callbacks.onError) callbacks.onError(err);
        });

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                importFromId(code.data);
                if (callbacks.onSuccess) callbacks.onSuccess(code.data);
                stream.getTracks().forEach(track => track.stop());
                return;
            }
        }
        requestAnimationFrame(tick);
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

function areFieldsValid() {
    return ['player1', 'player2'].every(player => {
        return [1, 2].every(pokemonNum => {
            const name = document.querySelector(`[name="${player}-pokemon${pokemonNum}-name"]`).value;
            const type = document.querySelector(`[name="${player}-pokemon${pokemonNum}-type"]`).value;
            const color = document.querySelector(`[name="${player}-pokemon${pokemonNum}-color"]`).value;
            const life = document.querySelector(`[name="${player}-pokemon${pokemonNum}-life"]`).value;
            return name && type && color && life;
        });
    });
}

let previousFormState = {};

function hasFormChanged() {
    const currentFormState = extractFormData();
    const isChanged = JSON.stringify(currentFormState) !== JSON.stringify(previousFormState);
    previousFormState = currentFormState;
    return isChanged;
}