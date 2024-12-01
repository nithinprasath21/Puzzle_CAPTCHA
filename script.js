document.addEventListener('DOMContentLoaded', () => {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const verifyBtn = document.getElementById('verify-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const message = document.getElementById('message');
    
    let attempts = 0;
    let maxAttempts = 5;

    // Function to load and shuffle puzzle
    function loadPuzzle() {
        message.textContent = '';
        let selectedImageIndex = Math.floor(Math.random() * 62) + 1;
        let imageUrl = `images/puzz_${selectedImageIndex}.jpg`;
        let positions = [1, 2, 3, 4];
        let shuffledPositions = shuffleArray([...positions]);

        pieces.forEach((piece, index) => {
            let bgPosition = shuffledPositions[index];
            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundSize = '300px 300px';
            piece.style.backgroundPosition = getBackgroundPosition(bgPosition);
            piece.dataset.position = bgPosition;

            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragover', handleDragOver);
            piece.addEventListener('drop', handleDrop);
        });
    }

    // Load the initial puzzle
    loadPuzzle();

    // Event listeners for buttons
    refreshBtn.addEventListener('click', loadPuzzle);
    verifyBtn.addEventListener('click', handleVerify);

    function handleDragStart(e) {
        e.dataTransfer.setData('text', e.target.id);
        e.target.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        const draggedPieceId = e.dataTransfer.getData('text');
        const draggedPiece = document.getElementById(draggedPieceId);

        let targetPiece = e.target;
        if (targetPiece.classList.contains('puzzle-piece')) {
            swapPieces(draggedPiece, targetPiece);
        }
        
        draggedPiece.classList.remove('dragging');
    }

    function swapPieces(piece1, piece2) {
        let tempBg = piece1.style.backgroundPosition;
        let tempPos = piece1.dataset.position;

        piece1.style.backgroundPosition = piece2.style.backgroundPosition;
        piece1.dataset.position = piece2.dataset.position;

        piece2.style.backgroundPosition = tempBg;
        piece2.dataset.position = tempPos;
    }

    function handleVerify() {
        let correct = true;

        pieces.forEach(piece => {
            if (parseInt(piece.dataset.position) !== parseInt(piece.id.split('-')[1])) {
                correct = false;
            }
        });

        if (correct) {
            message.textContent = "Verified";
            message.classList.add('verified');
            message.classList.remove('error');

            // Collect and send browser behavior data
            collectAndSendData();
            
        } else {
            attempts++;
            message.textContent = "Try again";
            message.classList.add('error');
            message.classList.remove('verified');

            if (attempts >= maxAttempts) {
                window.location.href = 'suspicious.html';
            }
        }
    }

    function getBackgroundPosition(position) {
        switch (position) {
            case 1: return '0px 0px';
            case 2: return '-150px 0px';
            case 3: return '0px -150px';
            case 4: return '-150px -150px';
            default: return '0px 0px';
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        
       return array;
   }
});