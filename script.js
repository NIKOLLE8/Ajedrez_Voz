// Referencia al tablero
const board = document.getElementById('board');
board.style.display = 'grid';
board.style.gridTemplate = 'repeat(8, 1fr) / repeat(8, 1fr)';

// Estado del juego
const statusDisplay = document.getElementById('status');

// Creamos las casillas
for (let i = 0; i < 64; i++) {
    const square = document.createElement('div');
    square.style.border = '1px solid black';
    square.style.backgroundColor = (Math.floor(i / 8) + i % 8) % 2 === 0 ? 'white' : '#b0b0b0';
    square.dataset.position = `${Math.floor(i / 8)},${i % 8}`;
    board.appendChild(square);
}

// Clase para las piezas
class ChessPiece {
    constructor(type, position, color) {
        this.type = type;
        this.position = position;
        this.color = color;
        this.element = document.createElement('div');
        this.element.className = 'piece';
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.element.style.display = 'flex';
        this.element.style.justifyContent = 'center';
        this.element.style.alignItems = 'center';
        this.element.style.fontSize = '2.5em';
        this.element.style.cursor = 'pointer';
        this.element.style.userSelect = 'none';
        this.updatePosition();
    }

    updatePosition() {
        const [row, col] = this.position;
        const square = document.querySelector(`[data-position="${row},${col}"]`);
        if (square) {
            square.innerHTML = '';
            square.appendChild(this.element);
        }
    }
}

// Crear piezas específicas
class Pawn extends ChessPiece {
    constructor(position) {
        super('pawn', position, 'white');
        this.element.textContent = '♟';
    }
}

class Queen extends ChessPiece {
    constructor(position) {
        super('queen', position, 'white');
        this.element.textContent = '♕';
    }
}

class Bishop extends ChessPiece {
    constructor(position) {
        super('bishop', position, 'white');
        this.element.textContent = '♗';
    }
}

// Crear instancias de las piezas
const pieces = {
    pawn: new Pawn([6, 3]),
    queen: new Queen([7, 3]),
    bishop: new Bishop([7, 2])
};

// Configurar reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'es-ES';
recognition.continuous = true;

recognition.onstart = () => {
    statusDisplay.textContent = 'Estado: Escuchando comandos de voz';
    statusDisplay.style.backgroundColor = '#e8f5e9';
};

recognition.onend = () => {
    statusDisplay.textContent = 'Estado: Control de voz desactivado';
    statusDisplay.style.backgroundColor = '#ffebee';
};

recognition.onerror = (event) => {
    statusDisplay.textContent = `Estado: Error - ${event.error}`;
    statusDisplay.style.backgroundColor = '#ffebee';
};

recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
    processCommand(command);
};

// Procesar comandos de voz
function processCommand(command) {
    statusDisplay.textContent = `Comando recibido: ${command}`;
    
    let piece;
    if (command.includes('peón') || command.includes('peon')) {
        piece = pieces.pawn;
    } else if (command.includes('reina')) {
        piece = pieces.queen;
    } else if (command.includes('alfil')) {
        piece = pieces.bishop;
    }

    const numbers = command.match(/\d+/g);
    if (numbers && numbers.length >= 2 && piece) {
        const newRow = 8 - parseInt(numbers[0]);
        const newCol = parseInt(numbers[1]) - 1;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            piece.position = [newRow, newCol];
            piece.updatePosition();
            statusDisplay.textContent = `Movimiento realizado: ${piece.type} a posición ${numbers[0]},${numbers[1]}`;
            statusDisplay.style.backgroundColor = '#e8f5e9';
        } else {
            statusDisplay.textContent = 'Error: Posición fuera del tablero';
            statusDisplay.style.backgroundColor = '#ffebee';
        }
    }
}

// Control del botón de voz
const toggleButton = document.getElementById('toggleVoice');
let isListening = false;

toggleButton.onclick = () => {
    if (!isListening) {
        recognition.start();
        isListening = true;
        toggleButton.style.backgroundColor = '#f44336';
    } else {
        recognition.stop();
        isListening = false;
        toggleButton.style.backgroundColor = '#4CAF50';
    }
};