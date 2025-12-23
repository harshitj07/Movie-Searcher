// API Configuration
const CONFIG = {
    // The Movie Database (TMDB) - Free API for movie/TV data
    TMDB_API_KEY: 'YOUR_TMDB_API_KEY', // Get from https://www.themoviedb.org/settings/api
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
    
    // OMDb API - Free API for IMDb ratings
    OMDB_API_KEY: 'YOUR_OMDB_API_KEY', // Get from http://www.omdbapi.com/apikey.aspx
    OMDB_BASE_URL: 'https://www.omdbapi.com',
    
    // Streaming Availability API - RapidAPI
    STREAMING_API_KEY: 'YOUR_RAPIDAPI_KEY', // Get from https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability
    STREAMING_BASE_URL: 'https://streaming-availability.p.rapidapi.com'
};

// Country code to name mapping
const COUNTRY_NAMES = {
    'us': '🇺🇸 United States',
    'ca': '🇨🇦 Canada',
    'gb': '🇬🇧 United Kingdom',
    'au': '🇦🇺 Australia',
    'de': '🇩🇪 Germany',
    'fr': '🇫🇷 France',
    'jp': '🇯🇵 Japan',
    'in': '🇮🇳 India',
    'br': '🇧🇷 Brazil',
    'mx': '🇲🇽 Mexico'
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const mediaTypeSelect = document.getElementById('mediaType');
const countryFilter = document.getElementById('countryFilter');
const resultsContainer = document.getElementById('results');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');

// Event Listeners
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// Main search function
async function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter a movie or TV show name');
        return;
    }
    
    // Check if API keys are configured
    if (CONFIG.TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
        showError('Please configure your API keys in app.js. See README.md for instructions.');
        return;
    }
    
    showLoading(true);
    hideError();
    resultsContainer.innerHTML = '';
    
    try {
        const mediaType = mediaTypeSelect.value;
        const results = await searchMedia(query, mediaType);
        
        if (results.length === 0) {
            showError('No results found. Try a different search term.');
            showLoading(false);
            return;
        }
        
        // Get detailed info for each result
        for (const item of results.slice(0, 12)) { // Limit to 12 results
            await displayMediaCard(item);
        }
        
        showLoading(false);
    } catch (error) {
        console.error('Search error:', error);
        showError('An error occurred while searching. Please try again.');
        showLoading(false);
    }
}

// Search for media using TMDB
async function searchMedia(query, mediaType) {
    let allResults = [];
    
    if (mediaType === 'all' || mediaType === 'movie') {
        const movieResults = await fetchTMDB('/search/movie', { query });
        allResults = allResults.concat(movieResults.results.map(item => ({ ...item, media_type: 'movie' })));
    }
    
    if (mediaType === 'all' || mediaType === 'tv') {
        const tvResults = await fetchTMDB('/search/tv', { query });
        allResults = allResults.concat(tvResults.results.map(item => ({ ...item, media_type: 'tv' })));
    }
    
    // Sort by popularity
    allResults.sort((a, b) => b.popularity - a.popularity);
    
    return allResults;
}

// Fetch from TMDB API
async function fetchTMDB(endpoint, params = {}) {
    const url = new URL(`${CONFIG.TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', CONFIG.TMDB_API_KEY);
    
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('TMDB API request failed');
    
    return await response.json();
}

// Get IMDb rating from OMDb
async function getIMDbRating(title, year, type) {
    try {
        const url = new URL(CONFIG.OMDB_BASE_URL);
        url.searchParams.append('apikey', CONFIG.OMDB_API_KEY);
        url.searchParams.append('t', title);
        if (year) url.searchParams.append('y', year);
        if (type) url.searchParams.append('type', type === 'tv' ? 'series' : 'movie');
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True' && data.imdbRating !== 'N/A') {
            return data.imdbRating;
        }
    } catch (error) {
        console.error('OMDb error:', error);
    }
    
    return null;
}

// Get streaming availability
async function getStreamingAvailability(title, type, year) {
    try {
        // Note: This is a placeholder for the Streaming Availability API
        // The actual API requires a RapidAPI key and has usage limits
        // You can also use alternative services like JustWatch API or WatchMode API
        
        const url = new URL(`${CONFIG.STREAMING_BASE_URL}/get/basic`);
        
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': CONFIG.STREAMING_API_KEY,
                'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
            }
        };
        
        // This is a simplified version - actual implementation depends on the API
        const response = await fetch(url, options);
        
        if (!response.ok) throw new Error('Streaming API request failed');
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Streaming availability error:', error);
        return null;
    }
}

// Display media card
async function displayMediaCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? releaseDate.split('-')[0] : '';
    const posterPath = item.poster_path 
        ? `${CONFIG.TMDB_IMAGE_BASE}${item.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';
    
    // Get IMDb rating
    const imdbRating = await getIMDbRating(title, year, item.media_type);
    
    // Create basic card HTML
    card.innerHTML = `
        <img src="${posterPath}" alt="${title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/500x750?text=No+Poster'">
        <div class="movie-info">
            <h3 class="movie-title">${title}</h3>
            <div class="movie-meta">
                <span class="meta-item">📅 ${year || 'N/A'}</span>
                <span class="meta-item">🎬 ${item.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                ${imdbRating ? `<span class="imdb-rating">⭐ ${imdbRating}</span>` : ''}
            </div>
            <p class="movie-overview">${item.overview || 'No description available.'}</p>
            <div class="streaming-section" id="streaming-${item.id}">
                <div class="streaming-title">🌍 Streaming Availability:</div>
                <div class="loading-streaming">Loading streaming data...</div>
            </div>
        </div>
    `;
    
    resultsContainer.appendChild(card);
    
    // Load streaming data asynchronously
    loadStreamingData(item, year);
}

// Load streaming data (mock implementation)
async function loadStreamingData(item, year) {
    const streamingContainer = document.getElementById(`streaming-${item.id}`);
    const loadingText = streamingContainer.querySelector('.loading-streaming');
    
    // Simulate streaming data (replace with actual API call)
    setTimeout(() => {
        const selectedCountry = countryFilter.value;
        
        // Mock streaming data - replace this with actual API integration
        const mockStreamingData = generateMockStreamingData(selectedCountry);
        
        if (mockStreamingData.length > 0) {
            let html = '<div class="streaming-countries">';
            
            for (const countryData of mockStreamingData) {
                html += `
                    <div class="country-streaming">
                        <div class="country-name">${countryData.country}</div>
                        <div class="streaming-platforms">
                            ${countryData.platforms.map(platform => 
                                `<span class="platform-badge ${platform.type}">${platform.name}</span>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
            loadingText.outerHTML = html;
        } else {
            loadingText.outerHTML = '<div class="no-streaming">Streaming info not available. Try using a VPN to access content in different regions!</div>';
        }
    }, 1000);
}

// Generate mock streaming data (replace with actual API)
function generateMockStreamingData(selectedCountry) {
    const platforms = {
        'us': [
            { name: 'Netflix', type: 'subscription' },
            { name: 'Amazon Prime', type: 'subscription' },
            { name: 'Hulu', type: 'subscription' },
            { name: 'Disney+', type: 'subscription' }
        ],
        'ca': [
            { name: 'Netflix', type: 'subscription' },
            { name: 'Amazon Prime', type: 'subscription' },
            { name: 'Crave', type: 'subscription' }
        ],
        'gb': [
            { name: 'Netflix', type: 'subscription' },
            { name: 'Amazon Prime', type: 'subscription' },
            { name: 'BBC iPlayer', type: 'free' }
        ]
    };
    
    if (selectedCountry && platforms[selectedCountry]) {
        return [{
            country: COUNTRY_NAMES[selectedCountry],
            platforms: platforms[selectedCountry]
        }];
    }
    
    // Show multiple countries if no filter
    return Object.keys(platforms).slice(0, 3).map(code => ({
        country: COUNTRY_NAMES[code],
        platforms: platforms[code]
    }));
}

// Utility functions
function showLoading(show) {
    loadingElement.classList.toggle('hidden', !show);
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function hideError() {
    errorElement.classList.add('hidden');
}

// Initialize
console.log('Movie Streaming Finder initialized');
console.log('Please configure your API keys in app.js');
console.log('TMDB API: https://www.themoviedb.org/settings/api');
console.log('OMDb API: http://www.omdbapi.com/apikey.aspx');
console.log('Streaming API: https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability');
