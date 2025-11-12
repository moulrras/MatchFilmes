// Espera a página carregar para executar o código
document.addEventListener('DOMContentLoaded', () => {

    // Elementos da Página
    const shelfRecommend = document.getElementById('shelf-recommend');
    const shelfNotRecommend = document.getElementById('shelf-not-recommend');

    // Elementos do Modal
    const modalContainer = document.getElementById('modal-container');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalPosterImg = document.getElementById('modal-poster-img');
    const modalTitle = document.getElementById('modal-title');
    const modalStarsContainer = document.getElementById('modal-stars');
    const modalStars = modalStarsContainer.querySelectorAll('.star');
    const modalCommentText = document.getElementById('modal-comment-text');
    const modalSaveBtn = document.getElementById('modal-save-btn');

    let currentMovieId = null; // Guarda o ID do filme que está no modal

    // --- 1. FUNÇÃO PRINCIPAL: CARREGAR A LISTA ---
    function loadMyList() {
        // Limpa as prateleiras
        shelfRecommend.innerHTML = '';
        shelfNotRecommend.innerHTML = '';
        
        const myList = JSON.parse(localStorage.getItem('myMovieList')) || [];

        if (myList.length === 0) {
            shelfRecommend.innerHTML = "<p>Você ainda não recomendou nenhum filme.</p>";
            shelfNotRecommend.innerHTML = "<p>Você ainda não marcou nenhum filme como 'não recomendado'.</p>";
            return;
        }

        myList.forEach(movie => {
            const moviePosterUrl = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
            const shelfItem = document.createElement('div');
            shelfItem.classList.add('shelf-item');
            
            const img = document.createElement('img');
            img.src = moviePosterUrl;
            img.alt = movie.title;
            
            // Adiciona o clique para abrir o modal de avaliação
            img.addEventListener('click', () => openReviewModal(movie));
            
            shelfItem.appendChild(img);

            // Coloca na prateleira correta
            if (movie.status === 'recommend') {
                shelfRecommend.appendChild(shelfItem);
            } else if (movie.status === 'not_recommend') {
                shelfNotRecommend.appendChild(shelfItem);
            }
        });
    }

    // --- 2. FUNÇÕES DO MODAL DE AVALIAÇÃO ---

    function openReviewModal(movie) {
        currentMovieId = movie.id; // Salva o ID do filme que estamos editando

        // Preenche o modal com os dados do filme
        modalTitle.textContent = movie.title;
        modalPosterImg.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
        
        // Preenche a avaliação (se já existir)
        modalCommentText.value = movie.comment || "";
        updateStars(movie.rating || 0);

        // Mostra o modal
        modalContainer.classList.add('visible');
    }

    function closeReviewModal() {
        modalContainer.classList.remove('visible');
        currentMovieId = null;
    }

    // --- 3. LÓGICA DAS ESTRELAS ---

    modalStars.forEach(star => {
        star.addEventListener('click', () => {
            const ratingValue = parseInt(star.dataset.value);
            updateStars(ratingValue);
        });
    });

    function updateStars(rating) {
        // Salva a nota atual no container (para o botão 'Salvar' pegar)
        modalStarsContainer.dataset.currentRating = rating; 
        
        modalStars.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    // --- 4. SALVAR A AVALIAÇÃO ---

    modalSaveBtn.addEventListener('click', () => {
        if (!currentMovieId) return; // Segurança

        // Pega os novos dados do modal
        const newRating = parseInt(modalStarsContainer.dataset.currentRating || 0);
        const newComment = modalCommentText.value;

        // Pega a lista, acha o filme, e atualiza
        let myList = JSON.parse(localStorage.getItem('myMovieList')) || [];
        const movieIndex = myList.findIndex(m => m.id === currentMovieId);

        if (movieIndex > -1) {
            myList[movieIndex].rating = newRating;
            myList[movieIndex].comment = newComment;
            
            // Salva a lista atualizada de volta no localStorage
            localStorage.setItem('myMovieList', JSON.stringify(myList));
            
            console.log(`Avaliação salva para: ${myList[movieIndex].title}`);
            closeReviewModal();
        }
    });

    // --- Event Listeners Globais ---
    modalCloseBtn.addEventListener('click', closeReviewModal);

    // Fecha o modal se clicar fora da caixa
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeReviewModal();
        }
    });

    // --- Inicia o app ---
    loadMyList();
});