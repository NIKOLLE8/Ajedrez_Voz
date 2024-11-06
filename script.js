const board = document.getElementById("board");

// Variables para las imágenes de las piezas
const pieces = {
  kingWhite: 'king_white.png',  // Ruta de imagen del rey blanco
  kingBlack: 'king_black.png'    // Ruta de imagen del rey negro
};

// Tablero inicial y celdas seleccionables
const initialBoard = [
  ['K', 'K', 'K', 'K'],
  ['.', '.', '.', '.'],
  ['.', '.', '.', '.'],
  ['k', 'k', 'k', 'k']
];

// Letras para columnas y números para filas
const columns = ['A', 'B', 'C', 'D'];
const rows = [1, 2, 3, 4];

// Renderiza el tablero y coloca las piezas
function renderBoard() {
  board.innerHTML = '';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.dataset.coordinate = `${columns[col]}${rows[row]}`; // Coordenadas de la celda en formato A1, B1, etc.
      cell.dataset.color = (row + col) % 2 === 0 ? 'white' : 'black';

      // Colocar piezas en el tablero
      const piece = initialBoard[row][col];
      if (piece === 'K') cell.innerHTML = `<img src="${pieces.kingWhite}" alt="Rey Blanco">`;
      if (piece === 'k') cell.innerHTML = `<img src="${pieces.kingBlack}" alt="Rey Negro">`;

      cell.addEventListener('click', () => selectCell(cell));
      board.appendChild(cell);
    }
  }
}

let selectedCell = null;

// Seleccionar celdas y mostrar opciones de movimiento
function selectCell(cell) {
  clearSelection();
  cell.classList.add('selected');
  selectedCell = cell;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  // Definir movimientos posibles
  const moves = [
    [row - 1, col], [row + 1, col],
    [row, col - 1], [row, col + 1]
  ];

  moves.forEach(([r, c]) => {
    if (r >= 0 && r < 4 && c >= 0 && c < 4) {
      const targetCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      targetCell.classList.add('move-option');
    }
  });
}

// Limpiar selección y movimientos
function clearSelection() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('selected', 'move-option');
  });
}

// Selección de una casilla mediante comando de voz
function selectByVoice(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      selectCell(cell);
      giveFeedback(cell);  // Da retroalimentación sobre la selección
    } else {
      const utterance = new SpeechSynthesisUtterance("Casilla no encontrada.");
      window.speechSynthesis.speak(utterance);
    }
  }

// Mover pieza
function movePiece(targetRow, targetCol) {
  if (selectedCell) {
    const targetCell = document.querySelector(`.cell[data-row="${targetRow}"][data-col="${targetCol}"]`);
    if (targetCell && targetCell.classList.contains('move-option')) {
        targetCell.innerHTML = selectedCell.innerHTML;
        selectedCell.innerHTML = '';
        giveFeedback(targetCell);  // Confirma el movimiento
        clearSelection();
      } else {
        const utterance = new SpeechSynthesisUtterance("Movimiento inválido.");
        window.speechSynthesis.speak(utterance);
      }
    } else {
      const utterance = new SpeechSynthesisUtterance("Por favor selecciona una pieza primero.");
      window.speechSynthesis.speak(utterance);
    }
  }
  

// Inicializar tablero y reconocimiento de voz
renderBoard();
startVoiceRecognition();
