//
// --- CONFIGURAÇÃO ---
//
// ❗️❗️ COLOQUE SUA CHAVE DE API (v3) DO TMDB AQUI ❗️❗️
const API_KEY = 'SUA_CHAVE_DE_API_VAI_AQUI'; 
// ❗️❗️ COLOQUE SUA CHAVE DE API (v3) DO TMDB AQUI ❗️❗️
//

const BASE_URL = 'https://api.themoviedb.org/3';

//
// --- ELEMENTOS DO HTML (DOM) ---
//
const mediaChoiceSection = document.getElementById('media-choice-section');
const genreChoiceSection = document.getElementById('genre-choice-section');
const movieCardSection = document.getElementById('movie-card-section');

const btnFilmes = document.getElementById('btn-filmes');
const btnSeries = document.getElementById('btn-series');
const genreTitle = document.getElementById('genre-title');
const genreGrid = document.getElementById('genre-grid');
const btnConfirmar = document.getElementById('btn-confirmar');

const moviePoster = document.getElementById('movie-poster');
const movieTitle = document.getElementById('movie-title');
const movieOverview = document.getElementById('movie-overview');
const swipeButtons = document.querySelector('.swipe-buttons');

//
// --- VARIÁVEIS DE ESTADO ---
//
let mediaType = 'movie'; // 'movie' (filme) ou 'tv' (série)
let selectedGenres = []; // Array para guardar os IDs dos gêneros

//
// --- ETAPA 1: LÓGICA DE ESCOLHA DE MÍDIA ---
//
btnFilmes.addEventListener('click', () => {
    mediaType = 'movie';
    genreTitle.textContent = "Qual gênero de filme você quer?";
    showGenreSelector();
});

btnSeries.addEventListener('click', () => {
    mediaType = 'tv';
    genreTitle.textContent = "Qual gênero de série você quer?";
    showGenreSelector();
});

function showGenreSelector() {
    mediaChoiceSection.classList.add('hidden'); // Esconde "Filme ou Série?"
    genreChoiceSection.classList.remove('hidden'); // Mostra "Gêneros"
    fetchGenres();
}

//
// --- ETAPA 2: BUSCAR E MOSTRAR GÊNEROS ---
//
async function fetchGenres() {
    // Limpa gêneros antigos
    genreGrid.innerHTML = 'Carregando gêneros...';
    
    // Constrói a URL da API para buscar a LISTA DE GÊNEROS
    const url = `${BASE_URL}/genre/${mediaType}/list?api_key=${API_KEY}&language=pt-BR`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Limpa o 'Carregando...'
        genreGrid.innerHTML = '';
        
        // Cria os botões de gênero
        data.genres.forEach(genre => {
            const tag = document.createElement('div');
            tag.classList.add('genre-tag');
            tag.textContent = genre.name;
            tag.dataset.id = genre.id; // Guarda o ID do gênero no botão
            
            // Lógica para selecionar/desselecionar
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected'); // Adiciona/remove a classe 'selected'
                
                const genreId = parseInt(tag.dataset.id);
                if (tag.classList.contains('selected')) {
                    selectedGenres.push(genreId); // Adiciona na lista
                } else {
                    // Remove da lista
                    selectedGenres = selectedGenres.filter(id => id !== genreId);
                }
            });
            
            genreGrid.appendChild(tag);
        });

    } catch (error) {
        console.error("Erro ao buscar gêneros:", error);
        genreGrid.innerHTML = 'Erro ao carregar gêneros. Tente novamente.';
    }
}

//
// --- ETAPA 3: BUSCAR RECOMENDAÇÃO (O FILME/SÉRIE) ---
//
btnConfirmar.addEventListener('click', () => {
    if (selectedGenres.length === 0) {
        alert("Por favor, selecione pelo menos um gênero.");
        return;
    }
    
    fetchRecommendation();
});

async function fetchRecommendation() {
    genreChoiceSection.classList.add('hidden'); // Esconde "Gêneros"
    movieCardSection.classList.remove('hidden'); // Mostra o "Card do Filme"
    
    // Prepara os gêneros para a URL (ex: "28,12,16")
    const genresString = selectedGenres.join(',');

    // Constrói a URL da API para DESCOBRIR filmes/séries
    const url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=pt-BR&sort_by=vote_average.desc&vote_count.gte=500&with_genres=${genresString}`;
    // sort_by=vote_average.desc -> Pega os mais bem avaliados (como vc pediu)
    // vote_count.gte=500 -> Que tenham pelo menos 500 votos (para não pegar filme obscuro)
    // with_genres=... -> Com os gêneros que você escolheu

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Pega um filme aleatório da lista de resultados
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const recommendation = data.results[randomIndex];

        displayMovie(recommendation);

    } catch (error) {
        console.error("Erro ao buscar recomendação:", error);
    }
}

//
// --- ETAPA 4: MOSTRAR O FILME/SÉRIE NO CARD ---
//
function displayMovie(item) {
    // TMDB usa 'title' para filmes e 'name' para séries
    movieTitle.textContent = item.title || item.name; 
    movieOverview.textContent = item.overview;
    
    // Monta a URL completa do poster
    moviePoster.src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    // Limpa e adiciona os botões de ação novamente (para o próximo filme)
    swipeButtons.innerHTML = `
        <button class="btn-option" data-action="never_seen">❌ Nunca vi</button>
        <button class="btn-option" data-action="recommend">👍 Já vi e recomendo</button>
        <button class="btn-option" data-action="not_recommend">👎 Já vi e não recomendo</button>
    `;
    
    // Adiciona lógica aos botões (que por enquanto só buscam outro filme)
    document.querySelectorAll('.btn-option').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            console.log(`Ação do usuário: ${action}`); // No futuro, vc salva isso no DB
            
            // Busca a próxima recomendação
            fetchRecommendation();
        });
    });
}