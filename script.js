// Configuración del tablero y piezas
const board = document.getElementById('board');
board.style.display = 'grid';
board.style.gridTemplate = 'repeat(8, 1fr) / repeat(8, 1fr)';

const statusDisplay = document.getElementById('status');

// Mapeo de letras a números de columna
const letterToColumn = {
    'a': 0, 'b': 1, 'c': 2, 'd': 3, 
    'e': 4, 'f': 5, 'g': 6, 'h': 7
};

const columnToLetter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Función para mostrar errores
function displayError(message, details = '') {
    statusDisplay.textContent = `Error: ${message}${details ? ` - ${details}` : ''}`;
    statusDisplay.style.backgroundColor = '#ffebee';
    console.error(`Chess Error: ${message}`, details);
}

// Función para mostrar éxito
function displaySuccess(message) {
    statusDisplay.textContent = message;
    statusDisplay.style.backgroundColor = '#e8f5e9';
}

// Función para mostrar información
function displayInfo(message) {
    statusDisplay.textContent = message;
    statusDisplay.style.backgroundColor = '#e3f2fd';
}

// Creamos las casillas
try {
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.style.border = '1px solid black';
        square.style.backgroundColor = (Math.floor(i / 8) + i % 8) % 2 === 0 ? 'white' : '#b0b0b0';
        square.dataset.position = `${Math.floor(i / 8)},${i % 8}`;
        board.appendChild(square);
    }
} catch (error) {
    displayError('Error al crear el tablero', error.message);
}

class ChessPiece {
    constructor(type, position, color) {
        try {
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
        } catch (error) {
            displayError(`Error al crear pieza ${type}`, error.message);
        }
    }

    updatePosition() {
        try {
            const [row, col] = this.position;
            const square = document.querySelector(`[data-position="${row},${col}"]`);
            if (!square) {
                throw new Error(`Casilla no encontrada en posición ${row},${col}`);
            }
            square.innerHTML = '';
            square.appendChild(this.element);
        } catch (error) {
            displayError('Error al actualizar posición', error.message);
        }
    }

    getPositionNotation() {
        try {
            const [row, col] = this.position;
            return `${columnToLetter[col]}${8 - row}`;
        } catch (error) {
            displayError('Error al obtener notación de posición', error.message);
            return '??';
        }
    }

    isValidMove(newRow, newCol) {
        return false;
    }

    isInBoard(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
}

class Pawn extends ChessPiece {
    constructor(position) {
        super('pawn', position, 'white');
        this.element.textContent = '♟';
        this.hasMoved = false;
    }

    isValidMove(newRow, newCol) {
        try {
            const [currentRow, currentCol] = this.position;
            const moveDistance = currentRow - newRow;
            
            if (currentCol !== newCol) {
                throw new Error('El peón solo puede moverse en vertical');
            }
            
            if (!this.hasMoved) {
                if (![1, 2].includes(moveDistance)) {
                    throw new Error('El peón puede moverse 1 o 2 casillas en su primer movimiento');
                }
                return true;
            }
            
            if (moveDistance !== 1) {
                throw new Error('El peón solo puede moverse 1 casilla después del primer movimiento');
            }
            return true;
        } catch (error) {
            displayError('Movimiento inválido del peón', error.message);
            return false;
        }
    }
}

class Queen extends ChessPiece {
    constructor(position) {
        super('queen', position, 'white');
        this.element.textContent = '♕';
    }

    isValidMove(newRow, newCol) {
        try {
            const [currentRow, currentCol] = this.position;
            const isHorizontal = currentRow === newRow && currentCol !== newCol;
            const isVertical = currentCol === newCol && currentRow !== newRow;
            const isDiagonal = Math.abs(currentRow - newRow) === Math.abs(currentCol - newCol);
            
            if (!isHorizontal && !isVertical && !isDiagonal) {
                throw new Error('La reina solo puede moverse en horizontal, vertical o diagonal');
            }
            return true;
        } catch (error) {
            displayError('Movimiento inválido de la reina', error.message);
            return false;
        }
    }
}

class Bishop extends ChessPiece {
    constructor(position) {
        super('bishop', position, 'white');
        this.element.textContent = '♗';
    }

    isValidMove(newRow, newCol) {
        try {
            const [currentRow, currentCol] = this.position;
            if (Math.abs(currentRow - newRow) !== Math.abs(currentCol - newCol)) {
                throw new Error('El alfil solo puede moverse en diagonal');
            }
            return true;
        } catch (error) {
            displayError('Movimiento inválido del alfil', error.message);
            return false;
        }
    }
}

// Crear instancias de las piezas
const pieces = {};
try {
    pieces.pawn = new Pawn([6, 3]);    // Empieza en d2
    pieces.queen = new Queen([7, 3]);   // Empieza en d1
    pieces.bishop = new Bishop([7, 2]); // Empieza en c1
} catch (error) {
    displayError('Error al inicializar las piezas', error.message);
}

// Configuración del reconocimiento de voz
let recognition;
try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        throw new Error('El reconocimiento de voz no está soportado en este navegador');
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
} catch (error) {
    displayError('Error al inicializar el reconocimiento de voz', error.message);
}

recognition.onstart = () => {
    displayInfo('Estado: Escuchando comandos de voz');
};

recognition.onend = () => {
    displayInfo('Estado: Control de voz desactivado');
};

recognition.onerror = (event) => {
    switch (event.error) {
        case 'no-speech':
            displayError('No se detectó ningún comando de voz');
            break;
        case 'audio-capture':
            displayError('No se detectó ningún micrófono');
            break;
        case 'not-allowed':
            displayError('El acceso al micrófono fue denegado');
            break;
        case 'network':
            displayError('Error de red en el reconocimiento de voz');
            break;
        default:
            displayError('Error en el reconocimiento de voz', event.error);
    }
};

recognition.onresult = (event) => {
    try {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        processCommand(command);
    } catch (error) {
        displayError('Error al procesar el resultado de voz', error.message);
    }
};

function processCommand(command) {
    try {
        displayInfo(`Comando recibido: ${command}`);
        
        let piece;
        if (command.includes('peón') || command.includes('peon')) {
            piece = pieces.pawn;
        } else if (command.includes('reina')) {
            piece = pieces.queen;
        } else if (command.includes('alfil')) {
            piece = pieces.bishop;
        }

        if (!piece) {
            throw new Error('No se reconoció ninguna pieza válida en el comando');
        }

        const match = command.match(/([a-h])\s*([1-8])/);
        if (!match) {
            throw new Error('No se detectó una posición válida (ejemplo: "peón a d4")');
        }

        const column = letterToColumn[match[1]];
        const row = 8 - parseInt(match[2]);
        
        if (!piece.isInBoard(row, column)) {
            throw new Error('La posición está fuera del tablero');
        }
        
        if (piece.isValidMove(row, column)) {
            const oldPosition = piece.getPositionNotation();
            piece.position = [row, column];
            if (piece instanceof Pawn) {
                piece.hasMoved = true;
            }
            piece.updatePosition();
            displaySuccess(`Movimiento realizado: ${piece.type} de ${oldPosition} a ${match[1]}${match[2]}`);
        }
    } catch (error) {
        displayError('Error al procesar el comando', error.message);
    }
}

// Control del botón de voz
const toggleButton = document.getElementById('toggleVoice');
let isListening = false;

toggleButton.onclick = () => {
    try {
        if (!recognition) {
            throw new Error('El reconocimiento de voz no está disponible');
        }

        if (!isListening) {
            recognition.start();
            isListening = true;
            toggleButton.style.backgroundColor = '#f44336';
            displayInfo('Reconocimiento de voz activado');
        } else {
            recognition.stop();
            isListening = false;
            toggleButton.style.backgroundColor = '#4CAF50';
            displayInfo('Reconocimiento de voz desactivado');
        }
    } catch (error) {
        displayError('Error al cambiar el estado del reconocimiento de voz', error.message);
        toggleButton.style.backgroundColor = '#9e9e9e';
    }
};