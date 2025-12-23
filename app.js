// API Configuration
const CONFIG = {
    // The Movie Database (TMDB) - Free API for movie/TV data
    TMDB_API_KEY: '34d6ad4c6e8b4ef4d94d2fd6d472ca38', // Get from https://www.themoviedb.org/settings/api
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
    
    // OMDb API - Free API for IMDb ratings
    OMDB_API_KEY: '575f5a93', // Get from http://www.omdbapi.com/apikey.aspx
    OMDB_BASE_URL: 'https://www.omdbapi.com',
    
    // Streaming Availability API - RapidAPI
    STREAMING_API_KEY: '8769a2a195msh22217bc0f1da53fp1b870ejsnd77ca55fb273', // Get from https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability
    STREAMING_BASE_URL: 'https://streaming-availability.p.rapidapi.com'
};

// Country code to name mapping
const COUNTRY_NAMES = {
    ca: 'Canada',
    us: 'United States',
    gb: 'United Kingdom',
    au: 'Australia',
    de: 'Germany',
    fr: 'France',
    jp: 'Japan',
    in: 'India',
    br: 'Brazil',
    mx: 'Mexico',
    es: 'Spain',
    it: 'Italy',
    nl: 'Netherlands',
    se: 'Sweden',
    no: 'Norway',
    fi: 'Finland',
    dk: 'Denmark',
    ie: 'Ireland',
    nz: 'New Zealand',
    ar: 'Argentina',
    cl: 'Chile',
    co: 'Colombia',
    kr: 'South Korea',
    tw: 'Taiwan',
    hk: 'Hong Kong',
    sg: 'Singapore',
    za: 'South Africa'
};

const COUNTRY_PRIORITY = ['ca', 'us', 'gb', 'au', 'de', 'fr', 'jp', 'in', 'br', 'mx'];

const getCountryLabel = (code = '') => {
    const cc = code.toLowerCase();
    return COUNTRY_NAMES[cc] || cc.toUpperCase();
};

const sortCountries = (arr = []) => {
    const clean = (c) => c.replace('*', '');
    const isCode = (c) => /^[A-Z]{2,3}$/.test(clean(c));
    const priorityIndex = (c) => {
        const cc = clean(c).toLowerCase();
        const idx = COUNTRY_PRIORITY.indexOf(cc);
        return idx === -1 ? COUNTRY_PRIORITY.length : idx;
    };
    return [...arr].sort((a, b) => {
        const pa = priorityIndex(a);
        const pb = priorityIndex(b);
        if (pa !== pb) return pa - pb;

        const aIsCode = isCode(a);
        const bIsCode = isCode(b);
        if (aIsCode !== bIsCode) return aIsCode ? 1 : -1; // names before codes

        return a.localeCompare(b);
    });
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const mediaTypeSelect = document.getElementById('mediaType');
const countryFilter = document.getElementById('countryFilter');
const resultsContainer = document.getElementById('results');
const trendingContainer = document.getElementById('trendingGrid');
const searchResultsSection = document.getElementById('searchResults');
const topListsSection = document.getElementById('topLists');
const topMoviesContainer = document.getElementById('topMovies');
const topShowsContainer = document.getElementById('topShows');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const detailModal = document.getElementById('detailModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const searchOverlay = document.getElementById('searchOverlay');
const searchIconBtn = document.getElementById('searchIconBtn');
const closeSearchBtn = document.getElementById('closeSearchBtn');
const homeLink = document.getElementById('homeLink');

// Globals
const streamingCache = {};

const SERVICE_PRIORITY = [
    'netflix',
    'crave', 'hbo', 'hbomax', 'starz',
    'amazon prime', 'amazonprime', 'primevideo', 'amazonprimevideo',
    'disney+', 'disneyplus',
    'appletv+', 'appletvplus', 'apple tv+',
    'paramount+', 'paramountplus',
    'britbox',
    'acorntv', 'acorn tv',
    'discovery+', 'discoveryplus',
    'criterionchannel', 'criterion channel'
];

const servicePriorityWeight = (name = '') => {
    const key = name.toLowerCase().replace(/[^a-z0-9+ ]/g, '').trim();
    const idx = SERVICE_PRIORITY.indexOf(key);
    return idx === -1 ? SERVICE_PRIORITY.length : idx;
};

const normalizeServiceName = (name = '', serviceNameMap = {}) => {
    const serviceId = name.toLowerCase().replace(/[^a-z0-9+]/g, '');
    return serviceNameMap[serviceId] || name;
};

// Event Listeners
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// Search overlay controls
searchIconBtn?.addEventListener('click', openSearchOverlay);
closeSearchBtn?.addEventListener('click', closeSearchOverlay);
searchOverlay?.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearchOverlay();
});

// Home navigation
homeLink?.addEventListener('click', (e) => {
    e.preventDefault();
    returnToHome();
});

// Load trending content on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTrending();
    loadTopLists();
});

// Modal controls
modalClose?.addEventListener('click', closeModal);
detailModal?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!detailModal.classList.contains('hidden')) {
            closeModal();
        } else if (!searchOverlay.classList.contains('hidden')) {
            closeSearchOverlay();
        }
    }
});

// Load trending movies and shows
async function loadTrending() {
    try {
        // Get trending movies and TV shows
        const trendingMovies = await fetchTMDB('/trending/movie/week');
        const trendingTV = await fetchTMDB('/trending/tv/week');
        
        // Combine and get top 10
        const allTrending = [
            ...trendingMovies.results.slice(0, 6).map(item => ({ ...item, media_type: 'movie' })),
            ...trendingTV.results.slice(0, 4).map(item => ({ ...item, media_type: 'tv' }))
        ].sort((a, b) => b.popularity - a.popularity).slice(0, 10);
        
        // Display trending content
        trendingContainer.innerHTML = '';
        for (const item of allTrending) {
            await displayMediaCard(item, { container: trendingContainer, contextId: 'trending', isTrending: true });
        }
    } catch (error) {
        console.error('Error loading trending:', error);
        trendingContainer.innerHTML = '<p class="no-streaming">Unable to load trending content. Please try searching for movies or shows.</p>';
    }
}

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
    searchResultsSection.classList.remove('hidden');
    
    // Hide trending section when showing search results
    document.getElementById('trending').classList.add('hidden');

    // Hide top lists when showing search results
    topListsSection?.classList.add('hidden');
    
    // Close search overlay
    closeSearchOverlay();
    
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
            await displayMediaCard(item, false);
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

// Get streaming availability using real API with fallback search
async function getStreamingAvailability(mediaItem, meta = {}) {
    try {
        const type = mediaItem.media_type === 'tv' ? 'series' : 'movie';
        const tmdbId = mediaItem.id;
        const title = meta.title || mediaItem.title || mediaItem.name || '';
        const year = meta.year || '';
        const countryForSearch = (meta.selectedCountry || '').toLowerCase() || 'us';

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': CONFIG.STREAMING_API_KEY,
                'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
            }
        };

        // Primary attempt: direct show lookup with tmdb source hint
        const directUrl = `${CONFIG.STREAMING_BASE_URL}/shows/${type}/${tmdbId}?source=tmdb`;
        console.log(`Fetching streaming data direct for ${type} TMDB ID: ${tmdbId}`);
        let response = await fetch(directUrl, options);

        // Fallback: try without source hint if direct fails
        if (!response.ok) {
            console.warn(`Direct fetch failed (${response.status}), trying without source hint`);
            response = await fetch(`${CONFIG.STREAMING_BASE_URL}/shows/${type}/${tmdbId}`, options);
        }

        if (response.ok) {
            const data = await response.json();
            if (data?.streamingOptions || data?.result?.streamingOptions) {
                console.log('Full streaming data (direct):', JSON.stringify(data, null, 2));
                return data;
            }
        }

        // Secondary fallback: title search to disambiguate (best-effort)
        if (title) {
            const searchUrl = `${CONFIG.STREAMING_BASE_URL}/search/title/${encodeURIComponent(title)}?country=${countryForSearch}&show_type=${type}${year ? `&year=${year}` : ''}`;
            console.log(`Fallback search by title: ${searchUrl}`);
            const searchResp = await fetch(searchUrl, options);
            if (searchResp.ok) {
                const searchData = await searchResp.json();
                const candidates = searchData?.result || searchData?.results || [];
                const match = candidates.find(r => r.tmdbId === tmdbId) || candidates[0];
                if (match) {
                    console.log('Using fallback search match:', JSON.stringify(match, null, 2));
                    return match;
                }
            }
        }

        console.log(`Streaming data not found for ${title || tmdbId}`);
        return null;
    } catch (error) {
        console.error('Streaming availability error:', error);
        return null;
    }
}

// Get streaming availability using TMDB watch/providers (more reliable)
async function getTMDBProviders(mediaItem, selectedCountry = '') {
    try {
        const type = mediaItem.media_type === 'tv' ? 'tv' : 'movie';
        const url = `${CONFIG.TMDB_BASE_URL}/${type}/${mediaItem.id}/watch/providers?api_key=${CONFIG.TMDB_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const results = data?.results || {};

        const countries = selectedCountry ? [selectedCountry.toLowerCase()] : Object.keys(results).map(c => c.toLowerCase());
        const platformsByService = {};

        for (const cc of countries) {
            const entry = results[cc] || results[cc.toUpperCase()];
            if (!entry) continue;
            const flatrate = entry.flatrate || [];
            for (const p of flatrate) {
                const name = p.provider_name;
                if (!platformsByService[name]) {
                    platformsByService[name] = {
                        type: 'subscription',
                        countries: new Set()
                    };
                }
                platformsByService[name].countries.add(cc.toUpperCase());
            }
        }

        return Object.keys(platformsByService).length ? platformsByService : null;
    } catch (e) {
        console.error('TMDB providers error:', e);
        return null;
    }
}

// Display media card
async function displayMediaCard(item, options = {}) {
    const { isTrending = false, container, contextId } = options;
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? releaseDate.split('-')[0] : '';
    const today = new Date();
    const release = releaseDate ? new Date(releaseDate) : null;
    const daysSinceRelease = release ? Math.floor((today - release) / (1000 * 60 * 60 * 24)) : null;
    const isFuture = release ? release > today : false;
    const isNew = daysSinceRelease !== null && daysSinceRelease >= 0 && daysSinceRelease <= 60;
    const isTheatrical = isFuture || (daysSinceRelease !== null && daysSinceRelease <= 21);
    const posterPath = item.poster_path 
        ? `${CONFIG.TMDB_IMAGE_BASE}${item.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';
    
    // Get IMDb rating
    const imdbRating = await getIMDbRating(title, year, item.media_type);
    
    // Create basic card HTML
    const streamContext = contextId || (isTrending ? 'trending' : 'search');

    card.innerHTML = `
        <img src="${posterPath}" alt="${title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/500x750?text=No+Poster'">
        <div class="movie-info">
            <h3 class="movie-title" data-poster="${posterPath}">${title}</h3>
            <div class="movie-meta">
                <span class="meta-item">📅 ${year || 'N/A'}</span>
                <span class="meta-item">🎬 ${item.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                ${imdbRating ? `<span class="imdb-rating">⭐ ${imdbRating}</span>` : ''}
            </div>
            <div class="badge-row">
                ${isNew ? '<span class="pill pill-new">New</span>' : ''}
                ${isTheatrical ? '<span class="pill pill-theater">In Theaters</span>' : ''}
            </div>
            <p class="movie-overview">${item.overview || 'No description available.'}</p>
            <div class="streaming-section" id="streaming-${item.id}-${streamContext}">
                <div class="streaming-title">🌍 Available to Stream:</div>
                <div class="loading-streaming">Checking availability...</div>
            </div>
            <div class="detail-actions">
                <button class="view-btn" data-id="${item.id}" data-trending="${isTrending}">View details</button>
            </div>
        </div>
    `;
    
    const targetContainer = container || (isTrending ? trendingContainer : resultsContainer);
    targetContainer.appendChild(card);
    card.querySelector('.view-btn').addEventListener('click', () => openDetailModal(item, { isTrending, isNew, isTheatrical, year, title, selectedCountry: countryFilter.value }));
    
    // Extract dominant color from poster and apply to card background
    extractColorFromImage(posterPath, card);
    
    // Load streaming data asynchronously with real API
    loadStreamingData(item, streamContext, { isNew, isTheatrical, year, title, selectedCountry: countryFilter.value, renderLimit: 2 });
}

// Extract dominant color from image
function extractColorFromImage(imageUrl, cardElement) {
    if (!imageUrl || imageUrl.includes('placeholder')) return;
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    
    img.onload = function() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Sample colors from the top portion of the image
            const imageData = ctx.getImageData(0, 0, canvas.width, Math.min(100, canvas.height));
            const data = imageData.data;
            
            let r = 0, g = 0, b = 0, count = 0;
            
            // Average the colors, skipping very dark or very light pixels
            for (let i = 0; i < data.length; i += 4 * 10) { // Sample every 10th pixel
                const red = data[i];
                const green = data[i + 1];
                const blue = data[i + 2];
                const brightness = (red + green + blue) / 3;
                
                // Skip very dark or very bright pixels
                if (brightness > 30 && brightness < 225) {
                    r += red;
                    g += green;
                    b += blue;
                    count++;
                }
            }
            
            if (count > 0) {
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                
                // Apply gradient to the entire card
                const color1 = `rgba(${r}, ${g}, ${b}, 0.2)`;
                const color2 = `rgba(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)}, 0.4)`;
                const darkColor = `rgba(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)}, 0.6)`;
                
                cardElement.style.background = `linear-gradient(135deg, ${darkColor} 0%, ${color2} 50%, ${color1} 100%)`;
            }
        } catch (e) {
            console.log('Could not extract color from image:', e);
        }
    };
    
    img.onerror = function() {
        console.log('Failed to load image for color extraction');
    };
}

function renderPlatforms(container, platformsArray, selectedCountryLabel, options = {}) {
    const { limit } = options;
    const visiblePlatforms = limit ? platformsArray.slice(0, limit) : platformsArray;
    const hiddenCount = limit ? Math.max(platformsArray.length - limit, 0) : 0;

    const streamingContainerEl = document.createElement('div');
    streamingContainerEl.classList.add('streaming-availability');

    visiblePlatforms.forEach(platform => {
        const platformRow = document.createElement('div');
        platformRow.classList.add('platform-row');

        const platformName = document.createElement('span');
        platformName.classList.add('platform-name');
        platformName.textContent = platform.serviceName;

        const availabilityWrap = document.createElement('div');
        availabilityWrap.classList.add('platform-countries-wrap');

        const countries = platform.countries || [];
        let inlineCountries = countries.slice(0, 4);
        const remainingCountries = countries.slice(4);

        const countriesSpan = document.createElement('span');
        countriesSpan.classList.add('platform-countries');
        if (countries.length === 0) {
            countriesSpan.textContent = 'Not available in selected country';
        } else if (selectedCountryLabel && countries.some(c => c.toLowerCase() === selectedCountryLabel.toLowerCase())) {
            countriesSpan.textContent = `Available in ${selectedCountryLabel}`;
        } else {
            countriesSpan.textContent = `Available in ${inlineCountries.join(', ')}`;
        }
        availabilityWrap.appendChild(countriesSpan);

        if (remainingCountries.length > 0) {
            const details = document.createElement('details');
            details.classList.add('platform-more');
            const summary = document.createElement('summary');
            summary.textContent = `+${remainingCountries.length} more countries`;
            const extra = document.createElement('span');
            extra.classList.add('platform-countries', 'extra');
            extra.textContent = remainingCountries.join(', ');
            details.appendChild(summary);
            details.appendChild(extra);
            availabilityWrap.appendChild(details);
        }

        if (platform.link) {
            const link = document.createElement('a');
            link.href = platform.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.classList.add('btn-outline');
            link.textContent = 'Open platform';
            availabilityWrap.appendChild(link);
        }

        platformRow.appendChild(platformName);
        platformRow.appendChild(availabilityWrap);
        streamingContainerEl.appendChild(platformRow);
    });

    if (hiddenCount > 0) {
        const moreNote = document.createElement('div');
        moreNote.classList.add('platform-more-note');
        moreNote.textContent = `+${hiddenCount} more. View details for the full list.`;
        streamingContainerEl.appendChild(moreNote);
    }

    container.innerHTML = '';
    container.appendChild(streamingContainerEl);
}

async function buildPlatformArray(item, meta = {}) {
    const selectedCountry = (meta.selectedCountry || countryFilter.value || '').toLowerCase();
    const selectedCountryLabel = selectedCountry ? getCountryLabel(selectedCountry) : '';

    let platformsByService = await getTMDBProviders(item, selectedCountry);

    const serviceNameMap = {
        'netflix': 'Netflix',
        'netflixbasic': 'Netflix',
        'netflixwithads': 'Netflix',
        'netflixads': 'Netflix',
        'netflixstandardwithads': 'Netflix',
        'prime': 'Amazon Prime',
        'amazon': 'Amazon Prime',
        'amazonprimevideo': 'Amazon Prime',
        'disney': 'Disney+',
        'disneyplus': 'Disney+',
        'hulu': 'Hulu',
        'hbo': 'HBO Max',
        'hbomax': 'HBO Max',
        'max': 'Max',
        'paramount': 'Paramount+',
        'paramountplus': 'Paramount+',
        'peacock': 'Peacock',
        'apple': 'Apple TV+',
        'appletv': 'Apple TV+',
        'appletvplus': 'Apple TV+',
        'appletv+': 'Apple TV+',
        'britbox': 'BritBox',
        'acorn': 'Acorn TV',
        'acorntv': 'Acorn TV',
        'discoveryplus': 'Discovery+',
        'discovery+': 'Discovery+',
        'criterion': 'Criterion Channel',
        'criterionchannel': 'Criterion Channel',
        'showtime': 'Showtime',
        'starz': 'Starz',
        'crave': 'Crave',
        'canalplus': 'Canal+',
        'canal+': 'Canal+',
        'nowtv': 'NOW TV',
        'now': 'NOW',
        'nowmax': 'NOW',
        'viaplay': 'Viaplay',
        'wow': 'WOW',
        'skygo': 'Sky Go',
        'stan': 'Stan',
        'hotstar': 'Disney+ Hotstar',
        'hotstarpremium': 'Disney+ Hotstar',
        'zee5': 'ZEE5',
        'sonyliv': 'Sony LIV',
        'voot': 'Voot',
        'globoplay': 'Globoplay',
        'showmax': 'Showmax',
        'mubi': 'MUBI',
        'crunchyroll': 'Crunchyroll',
        'funimation': 'Funimation'
    };

        const buildFromStreamingOptions = (streamingOptions) => {
            const map = {};
            for (const [countryCode, services] of Object.entries(streamingOptions || {})) {
                const countryLabel = getCountryLabel(countryCode);
                for (const service of services || []) {
                    const streamingType = service.type?.toLowerCase();
                    if (streamingType === 'free' || streamingType === 'ads' || streamingType === 'rent' || streamingType === 'buy') continue;

                    const serviceId = (service.service?.id || '').toLowerCase();
                    let rawName = service.service?.name || service.service?.id || 'Unknown';
                    let serviceName = normalizeServiceName(rawName, serviceNameMap);
                    const serviceNameLower = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (serviceNameMap[serviceId]) serviceName = serviceNameMap[serviceId];
                    else if (serviceNameMap[serviceNameLower]) serviceName = serviceNameMap[serviceNameLower];

                    if (selectedCountry && countryCode.toLowerCase() !== selectedCountry) continue;

                    if (!map[serviceName]) {
                        map[serviceName] = {
                            type: 'subscription',
                            countries: new Set(),
                            link: service.link || ''
                        };
                    }
                    const isVariant = serviceName !== rawName;
                    const label = isVariant ? `${countryLabel}*` : countryLabel;
                    map[serviceName].countries.add(label);
                }
            }
            return map;
        };

    const hasSelectedCountry = (map) => {
        if (!selectedCountry) return false;
        return Object.values(map || {}).some(entry => {
            return Array.from(entry.countries || []).some(cc => cc.toLowerCase().includes(selectedCountry));
        });
    };

    if (platformsByService) {
        for (const serviceName of Object.keys(platformsByService)) {
            const entry = platformsByService[serviceName];
            const normalized = new Set();
            (entry.countries || []).forEach(cc => {
                normalized.add(getCountryLabel(cc));
            });
            entry.countries = normalized;
        }
    }

    if (!platformsByService || (selectedCountry && !hasSelectedCountry(platformsByService))) {
        const streamingData = await getStreamingAvailability(item, meta);
        const streamingOptions = streamingData?.streamingOptions
            || streamingData?.result?.streamingOptions
            || streamingData?.streamingInfo
            || streamingData?.result?.streamingInfo;

        if (streamingOptions) {
            console.log('Processing streaming options from RapidAPI:', JSON.stringify(streamingOptions, null, 2));
            const rapidMap = buildFromStreamingOptions(streamingOptions);
            platformsByService = platformsByService || {};
            for (const [serviceName, data] of Object.entries(rapidMap)) {
                if (!platformsByService[serviceName]) {
                    platformsByService[serviceName] = data;
                } else {
                    data.countries.forEach(c => platformsByService[serviceName].countries.add(c));
                    if (!platformsByService[serviceName].link && data.link) {
                        platformsByService[serviceName].link = data.link;
                    }
                }
            }
        }
    }

    if (!platformsByService || Object.keys(platformsByService).length === 0) {
        return { platformsArray: [], selectedCountryLabel };
    }

    const platformsArray = Object.entries(platformsByService)
        .map(([serviceName, data]) => ({
            serviceName,
            type: data.type,
            countries: sortCountries(Array.from(data.countries)),
            link: data.link
        }))
        .sort((a, b) => {
            const pa = servicePriorityWeight(a.serviceName);
            const pb = servicePriorityWeight(b.serviceName);
            if (pa !== pb) return pa - pb;
            return a.serviceName.localeCompare(b.serviceName);
        });

    return { platformsArray, selectedCountryLabel };
}

// Load streaming data using real API
async function loadStreamingData(item, contextId = 'search', meta = {}) {
    const streamingContainer = document.getElementById(`streaming-${item.id}-${contextId}`);
    const loadingText = streamingContainer?.querySelector('.loading-streaming');
    if (!loadingText) return;

    try {
        const { platformsArray, selectedCountryLabel } = await buildPlatformArray(item, meta);

        if (!platformsArray || platformsArray.length === 0) {
            const message = selectedCountryLabel
                ? `Not available in ${selectedCountryLabel}.`
                : (meta.isTheatrical ? 'In theaters now. Streaming not yet available.' : 'Not currently available on subscription platforms.');
            loadingText.outerHTML = `<div class="no-streaming">${message}</div>`;
            return;
        }

        streamingCache[item.id] = platformsArray;
        renderPlatforms(streamingContainer, platformsArray, selectedCountryLabel, { limit: meta.renderLimit });
    } catch (error) {
        console.error('Error loading streaming data:', error);
        loadingText.outerHTML = '<div class="no-streaming">Unable to load streaming data.</div>';
    }
}

function closeModal() {
    detailModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    modalBody.innerHTML = '';
}

function openSearchOverlay() {
    searchOverlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    // Focus search input after animation
    setTimeout(() => searchInput?.focus(), 100);
}

function closeSearchOverlay() {
    searchOverlay.classList.add('hidden');
    document.body.classList.remove('modal-open');
    searchInput.value = '';
}

async function loadTopLists() {
    try {
        if (topMoviesContainer) {
            topMoviesContainer.innerHTML = '';
            const topMovies = await fetchTMDB('/movie/top_rated', { page: 1 });
            for (const item of topMovies.results.slice(0, 10).map(m => ({ ...m, media_type: 'movie' }))) {
                await displayMediaCard(item, { container: topMoviesContainer, contextId: 'top-movies', isTrending: false });
            }
        }

        if (topShowsContainer) {
            topShowsContainer.innerHTML = '';
            const topShows = await fetchTMDB('/tv/top_rated', { page: 1 });
            for (const item of topShows.results.slice(0, 10).map(t => ({ ...t, media_type: 'tv' }))) {
                await displayMediaCard(item, { container: topShowsContainer, contextId: 'top-shows', isTrending: false });
            }
        }

    } catch (e) {
        console.error('Error loading top lists:', e);
    }
}

function returnToHome() {
    // Hide search results
    searchResultsSection.classList.add('hidden');
    resultsContainer.innerHTML = '';
    
    // Show trending section
    document.getElementById('trending').classList.remove('hidden');

    // Show top lists
    topListsSection?.classList.remove('hidden');
    
    // Clear search input
    searchInput.value = '';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function openDetailModal(item, meta = {}) {
    if (!detailModal || !modalBody) return;
    const title = meta.title || item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? releaseDate.split('-')[0] : '';
    const posterPath = item.poster_path
        ? `${CONFIG.TMDB_IMAGE_BASE}${item.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

    modalBody.innerHTML = `
        <div class="detail-layout">
            <div class="detail-poster">
                <img src="${posterPath}" alt="${title}">
            </div>
            <div class="detail-meta">
                <h2>${title}</h2>
                <div class="meta-row">
                    <span>📅 ${year || 'N/A'}</span>
                    <span>🎬 ${item.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                    ${meta.isNew ? '<span class="pill pill-new">New</span>' : ''}
                    ${meta.isTheatrical ? '<span class="pill pill-theater">In Theaters</span>' : ''}
                </div>
                <div class="detail-overview">${item.overview || 'No description available.'}</div>
                <div class="detail-actions">
                    <a class="btn-outline" href="https://www.themoviedb.org/${item.media_type}/${item.id}" target="_blank" rel="noopener noreferrer">View on TMDB</a>
                </div>
                <div class="detail-streaming" id="detail-streaming-${item.id}">
                    <div class="streaming-title">🌍 Streaming availability</div>
                    <div class="loading-streaming">Loading availability...</div>
                </div>
            </div>
        </div>
    `;

    detailModal.classList.remove('hidden');
    document.body.classList.add('modal-open');

    const target = document.getElementById(`detail-streaming-${item.id}`);
    const cached = streamingCache[item.id];
    if (cached && cached.length) {
        renderPlatforms(target, cached, COUNTRY_NAMES[(meta.selectedCountry || countryFilter.value || '').toLowerCase()] || '');
    } else {
        const { platformsArray, selectedCountryLabel } = await buildPlatformArray(item, meta);
        streamingCache[item.id] = platformsArray;
        if (platformsArray && platformsArray.length) {
            renderPlatforms(target, platformsArray, selectedCountryLabel);
        } else {
            target.innerHTML = `<div class="no-streaming">Not currently available on subscription platforms.</div>`;
        }
    }
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
console.log('All API keys configured');
console.log('Ready to search for movies and shows!');
