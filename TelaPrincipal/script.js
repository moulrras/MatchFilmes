//
// --- CONFIGURAÇÃO ---
//
const API_KEY = '7cd535c04b5dcf44909c426dde912ece'; 
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
let mediaType = 'movie'; 
let selectedGenres = []; 

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
    mediaChoiceSection.classList.add('hidden'); 
    genreChoiceSection.classList.remove('hidden'); 
    fetchGenres();
}

//
// --- ETAPA 2: BUSCAR E MOSTRAR GÊNEROS ---
//
async function fetchGenres() {
    genreGrid.innerHTML = 'Carregando gêneros...';
    const url = `${BASE_URL}/genre/${mediaType}/list?api_key=${API_KEY}&language=pt-BR`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
             throw new Error(`Falha na API: ${response.statusText}`);
        }
        const data = await response.json();
        
        genreGrid.innerHTML = '';
        
        data.genres.forEach(genre => {
            const tag = document.createElement('div');
            tag.classList.add('genre-tag');
            tag.textContent = genre.name;
            tag.dataset.id = genre.id; 
            
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected'); 
                
                const genreId = parseInt(tag.dataset.id);
                if (tag.classList.contains('selected')) {
                    selectedGenres.push(genreId); 
                } else {
                    selectedGenres = selectedGenres.filter(id => id !== genreId);
                }
            });
            
            genreGrid.appendChild(tag);
        });

    } catch (error) {
        console.error("Erro ao buscar gêneros:", error);
        genreGrid.innerHTML = 'Erro ao carregar gêneros. Verifique sua chave de API (API_KEY) e a conexão.';
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
    genreChoiceSection.classList.add('hidden'); 
    movieCardSection.classList.remove('hidden'); 
    
    const genresString = selectedGenres.join('|'); // Busca por "OU"

    //
    // --- CORREÇÃO 1: FIM DA REPETIÇÃO ---
    // Pedimos uma página aleatória entre 1 e 50 (total de 1000 filmes)
    //
    const randomPage = Math.floor(Math.random() * 50) + 1;

    const url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&vote_count.gte=500&with_genres=${genresString}&page=${randomPage}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
             throw new Error(`Falha na API: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            const recommendation = data.results[randomIndex];

            displayMovie(recommendation);
        } else {
            // Se a página aleatória vier vazia, busca outra
            fetchRecommendation();
        }

    } catch (error) {
        console.error("Erro ao buscar recomendação:", error);
        movieTitle.textContent = "Erro ao buscar filme.";
        movieOverview.textContent = "Tente novamente.";
    }
}


//
// --- ETAPA 4: MOSTRAR O FILME/SÉRIE NO CARD ---
//
function displayMovie(item) {
    movieTitle.textContent = item.title || item.name; 
    movieOverview.textContent = item.overview;
    moviePoster.src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    swipeButtons.innerHTML = `
        <button class="btn-option" data-action="never_seen">❌ Nunca vi</button>
        <button class="btn-option" data-action="recommend">👍 Já vi e recomendo</button>
        <button class="btn-option" data-action="not_recommend">👎 Já vi e não recomendo</button>
    `;
    
    document.querySelectorAll('.btn-option').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            
            //
            // --- NOVO RECURSO 2: SALVAR NA "MINHA LISTA" ---
            //
            // Apenas salvamos se o usuário recomendou ou não
            if(action === 'recommend' || action === 'not_recommend') {
                saveToMyList(item, action);
            }
            
            // Carrega o próximo filme (Swipe Contínuo)
            fetchRecommendation();
        });
    });
}

//
// --- NOVO RECURSO 3: FUNÇÃO PARA SALVAR NO LOCALSTORAGE ---
//
function saveToMyList(item, action) {
    // 1. Pega a lista atual do 'banco de dados' do navegador
    let myList = JSON.parse(localStorage.getItem('myMovieList')) || [];

    // 2. Verifica se o filme já está na lista
    const existingMovieIndex = myList.findIndex(m => m.id === item.id);

    if (existingMovieIndex > -1) {
        // Se já existe, apenas atualiza o status (ex: de 'não recomendo' para 'recomendo')
        myList[existingMovieIndex].status = action;
    } else {
        // Se não existe, cria um novo objeto de filme para salvar
        const movieData = {
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            status: action,
            rating: null, // O usuário vai avaliar depois
            comment: ""   // O usuário vai avaliar depois
        };
        myList.push(movieData);
    }

    // 3. Salva a lista atualizada de volta no 'banco de dados'
    localStorage.setItem('myMovieList', JSON.stringify(myList));
    console.log(`Filme salvo: ${item.title || item.name}, Status: ${action}`);
}