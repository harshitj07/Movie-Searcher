/* ================================================================
   CineScout — app.js
   ================================================================ */

// ── Config ────────────────────────────────────────────────────
const CONFIG = {
    TMDB_API_KEY:      '34d6ad4c6e8b4ef4d94d2fd6d472ca38',
    OMDB_API_KEY:      '575f5a93',
    STREAMING_API_KEY: '8769a2a195msh22217bc0f1da53fp1b870ejsnd77ca55fb273',
    TMDB_BASE:   'https://api.themoviedb.org/3',
    TMDB_IMG:    'https://image.tmdb.org/t/p',
    OMDB_BASE:   'https://www.omdbapi.com',
    STREAM_BASE: 'https://streaming-availability.p.rapidapi.com'
};

// ── Country / Language data ───────────────────────────────────
const COUNTRY_NAMES = {
    // Americas
    us:'United States', ca:'Canada', mx:'Mexico', br:'Brazil', ar:'Argentina',
    cl:'Chile', co:'Colombia', pe:'Peru', ve:'Venezuela', ec:'Ecuador',
    bo:'Bolivia', py:'Paraguay', uy:'Uruguay', cr:'Costa Rica', pa:'Panama',
    gt:'Guatemala', sv:'El Salvador', hn:'Honduras', ni:'Nicaragua',
    do:'Dominican Republic', jm:'Jamaica', tt:'Trinidad and Tobago',
    // Europe
    gb:'United Kingdom', de:'Germany', fr:'France', it:'Italy', es:'Spain',
    nl:'Netherlands', se:'Sweden', no:'Norway', fi:'Finland', dk:'Denmark',
    ie:'Ireland', pt:'Portugal', ch:'Switzerland', at:'Austria', be:'Belgium',
    pl:'Poland', cz:'Czech Republic', hu:'Hungary', ro:'Romania', gr:'Greece',
    bg:'Bulgaria', hr:'Croatia', rs:'Serbia', sk:'Slovakia', si:'Slovenia',
    lt:'Lithuania', lv:'Latvia', ee:'Estonia', lu:'Luxembourg', mt:'Malta',
    cy:'Cyprus', is:'Iceland', mk:'North Macedonia', al:'Albania',
    ba:'Bosnia and Herzegovina', md:'Moldova', ua:'Ukraine', ru:'Russia',
    // Asia-Pacific
    jp:'Japan', kr:'South Korea', cn:'China', in:'India', au:'Australia',
    nz:'New Zealand', sg:'Singapore', hk:'Hong Kong', tw:'Taiwan',
    th:'Thailand', id:'Indonesia', my:'Malaysia', ph:'Philippines',
    vn:'Vietnam', pk:'Pakistan', bd:'Bangladesh',
    // Middle East & Africa
    ae:'United Arab Emirates', sa:'Saudi Arabia', il:'Israel', tr:'Turkey',
    eg:'Egypt', ma:'Morocco', ng:'Nigeria', ke:'Kenya', za:'South Africa',
    gh:'Ghana', et:'Ethiopia', tz:'Tanzania', qa:'Qatar', kw:'Kuwait'
};

const LANGUAGE_NAMES = {
    en:'English', ko:'Korean', ja:'Japanese', fr:'French', es:'Spanish',
    de:'German', it:'Italian', zh:'Chinese', hi:'Hindi', pt:'Portuguese',
    ru:'Russian', ar:'Arabic', th:'Thai', nl:'Dutch', sv:'Swedish',
    no:'Norwegian', da:'Danish', fi:'Finnish', pl:'Polish', tr:'Turkish'
};

const COUNTRY_PRIORITY = ['ca','us','gb','au','de','fr','jp','in','br','mx'];


const SERVICE_URLS = {
    'Netflix':'https://www.netflix.com',
    'Amazon Prime Video':'https://www.amazon.com/primevideo',
    'Disney Plus':'https://www.disneyplus.com',
    'Disney Plus Hotstar':'https://www.hotstar.com',
    'Hulu':'https://www.hulu.com',
    'HBO Max':'https://www.max.com',
    'Max':'https://www.max.com',
    'Apple TV Plus':'https://tv.apple.com',
    'Paramount Plus':'https://www.paramountplus.com',
    'Peacock':'https://www.peacocktv.com',
    'Showtime':'https://www.showtime.com',
    'Starz':'https://www.starz.com',
    'Crave':'https://www.crave.ca',
    'fuboTV':'https://www.fubo.tv',
    'Crunchyroll':'https://www.crunchyroll.com',
    'Discovery Plus':'https://www.discoveryplus.com',
    'BritBox':'https://www.britbox.com',
    'Acorn TV':'https://acorn.tv',
    'Criterion Channel':'https://www.criterionchannel.com',
    'MUBI':'https://mubi.com',
    'Canal+':'https://www.canalplus.com',
    'NOW TV':'https://www.nowtv.com',
    'NOW':'https://www.nowtv.com',
    'Viaplay':'https://viaplay.com',
    'WOW':'https://www.wowtv.co.uk',
    'Sky Go':'https://www.sky.com/watch',
    'Stan':'https://www.stan.com.au',
    'ZEE5':'https://www.zee5.com',
    'Sony LIV':'https://www.sonyliv.com',
    'Voot':'https://www.voot.com',
    'Globoplay':'https://globoplay.globo.com',
    'Showmax':'https://www.showmax.com',
    'Funimation':'https://www.funimation.com'
};

const SERVICE_NAME_MAP = {
    'netflix':'Netflix','netflixbasic':'Netflix','netflixwithads':'Netflix',
    'netflixads':'Netflix','netflixstandardwithads':'Netflix',
    'prime':'Amazon Prime Video','amazon':'Amazon Prime Video',
    'amazonprime':'Amazon Prime Video','amazonprimevideo':'Amazon Prime Video','primevideo':'Amazon Prime Video',
    'disney':'Disney Plus','disneyplus':'Disney Plus','disney+':'Disney Plus',
    'hulu':'Hulu','hbo':'HBO Max','hbomax':'HBO Max','max':'Max',
    'paramount':'Paramount Plus','paramountplus':'Paramount Plus','paramount+':'Paramount Plus',
    'peacock':'Peacock','apple':'Apple TV Plus','appletv':'Apple TV Plus',
    'appletvplus':'Apple TV Plus','appletv+':'Apple TV Plus',
    'britbox':'BritBox','acorn':'Acorn TV','acorntv':'Acorn TV',
    'discoveryplus':'Discovery Plus','discovery+':'Discovery Plus',
    'criterion':'Criterion Channel','criterionchannel':'Criterion Channel',
    'showtime':'Showtime','starz':'Starz','crave':'Crave',
    'canalplus':'Canal+','canal+':'Canal+',
    'nowtv':'NOW TV','now':'NOW','nowmax':'NOW','viaplay':'Viaplay',
    'wow':'WOW','skygo':'Sky Go','stan':'Stan',
    'hotstar':'Disney Plus Hotstar','hotstarpremium':'Disney Plus Hotstar',
    'disneyhotstar':'Disney Plus Hotstar','disney+hotstar':'Disney Plus Hotstar',
    'zee5':'ZEE5','sonyliv':'Sony LIV','voot':'Voot',
    'globoplay':'Globoplay','showmax':'Showmax','mubi':'MUBI',
    'crunchyroll':'Crunchyroll','funimation':'Funimation'
};

const SERVICE_PRIORITY = [
    'netflix','crave','hbo','hbomax','starz',
    'amazon prime','amazonprime','primevideo','amazonprimevideo',
    'disney+','disneyplus','appletv+','appletvplus','apple tv+',
    'paramount+','paramountplus','britbox','acorntv','acorn tv',
    'discovery+','discoveryplus','criterionchannel','criterion channel'
];

// ── State ─────────────────────────────────────────────────────
const state = {
    country:       localStorage.getItem('cs_country') ?? '',
    searchType:    'all',
    searchService: null,
    searchTimer:   null,
    streamCache:   new Map(),
    heroItems:     [],
    heroIdx:       0,
    heroTimer:     null,
    currentPage:   'home'
};

// ── Helpers ───────────────────────────────────────────────────
// Returns the full country name, or null if the code is unknown
const getCountryLabel = (code = '') => COUNTRY_NAMES[code.toLowerCase()] || null;
const getCountryLabelFallback = (code = '') => COUNTRY_NAMES[code.toLowerCase()] || code.toUpperCase();

const sortCountries = (arr = []) => {
    const clean = c => c.replace('*','');
    const pri   = c => { const i = COUNTRY_PRIORITY.indexOf(clean(c).toLowerCase()); return i === -1 ? 99 : i; };
    return [...arr].sort((a,b) => pri(a) - pri(b) || a.localeCompare(b));
};

const servicePriWeight = (name = '') => {
    const k = name.toLowerCase().replace(/[^a-z0-9+ ]/g,'').trim();
    const i = SERVICE_PRIORITY.indexOf(k);
    return i === -1 ? 99 : i;
};

const normalizeServiceName = (name = '') => {
    const toId = s => s.toLowerCase().replace(/[^a-z0-9+]/g, '');
    const direct = SERVICE_NAME_MAP[toId(name)];
    if (direct) return direct;
    // Strip qualifiers like "(No Ads)", "with Showtime", "basic", "Premium Plus", etc.
    const stripped = name
        .replace(/\s*\(.*?\)/g, '')
        .replace(/\s+with\s+\S+/gi, '')
        .replace(/\b(basic|standard|premium plus|premium|no ads?|with ads?|ads)\b/gi, '')
        .replace(/\s+/g, ' ').trim();
    if (stripped && stripped !== name) {
        const strippedMatch = SERVICE_NAME_MAP[toId(stripped)];
        if (strippedMatch) return strippedMatch;
        return stripped;
    }
    return name;
};

// ── TMDB fetch ────────────────────────────────────────────────
async function fetchTMDB(endpoint, params = {}) {
    const url = new URL(`${CONFIG.TMDB_BASE}${endpoint}`);
    url.searchParams.set('api_key', CONFIG.TMDB_API_KEY);
    for (const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
}

async function getMediaDetails(id, type) {
    try { return await fetchTMDB(`/${type === 'tv' ? 'tv' : 'movie'}/${id}`); }
    catch { return {}; }
}

async function getMediaCast(id, type) {
    try {
        const d = await fetchTMDB(`/${type === 'tv' ? 'tv' : 'movie'}/${id}/credits`);
        return d.cast || [];
    } catch { return []; }
}

async function getMediaSimilar(id, type) {
    try {
        // /recommendations uses TMDB's personalised algorithm — far better than /similar
        const d = await fetchTMDB(`/${type === 'tv' ? 'tv' : 'movie'}/${id}/recommendations`);
        return (d.results || []).slice(0, 20);
    } catch { return []; }
}

// ── Streaming data ────────────────────────────────────────────
async function getTMDBProviders(item, country = '') {
    try {
        const type = item.media_type === 'tv' ? 'tv' : 'movie';
        const res  = await fetch(`${CONFIG.TMDB_BASE}/${type}/${item.id}/watch/providers?api_key=${CONFIG.TMDB_API_KEY}`);
        if (!res.ok) return null;
        const data = await res.json();
        const results = data.results || {};
        const countries = country ? [country.toLowerCase()] : Object.keys(results).map(c => c.toLowerCase());
        const map = {};
        for (const cc of countries) {
            const entry = results[cc] || results[cc.toUpperCase()];
            if (!entry) continue;
            for (const p of (entry.flatrate || [])) {
                const norm = normalizeServiceName(p.provider_name);
                if (!map[norm]) map[norm] = { type:'subscription', countries: new Set(), logo: p.logo_path };
                else if (!map[norm].logo && p.logo_path) map[norm].logo = p.logo_path;
                map[norm].countries.add(cc.toUpperCase());
            }
        }
        return Object.keys(map).length ? map : null;
    } catch { return null; }
}

async function getStreamingAvailability(item, meta = {}) {
    try {
        const type = item.media_type === 'tv' ? 'series' : 'movie';
        const opts = { method:'GET', headers:{ 'X-RapidAPI-Key': CONFIG.STREAMING_API_KEY, 'X-RapidAPI-Host':'streaming-availability.p.rapidapi.com' } };
        let res = await fetch(`${CONFIG.STREAM_BASE}/shows/${type}/${item.id}?source=tmdb`, opts);
        if (!res.ok) res = await fetch(`${CONFIG.STREAM_BASE}/shows/${type}/${item.id}`, opts);
        if (res.ok) { const d = await res.json(); if (d?.streamingOptions) return d; }
        const title = meta.title || item.title || item.name || '';
        const cc    = (meta.country || state.country).toLowerCase();
        if (title) {
            const r2 = await fetch(`${CONFIG.STREAM_BASE}/search/title/${encodeURIComponent(title)}?country=${cc}&show_type=${type}`, opts);
            if (r2.ok) {
                const sd = await r2.json();
                const candidates = sd.result || sd.results || [];
                return candidates.find(x => x.tmdbId === item.id) || candidates[0] || null;
            }
        }
        return null;
    } catch { return null; }
}

async function buildPlatformArray(item, meta = {}) {
    const country      = (meta.country || state.country || '').toLowerCase();
    const countryLabel = country ? getCountryLabel(country) : '';

    // countries are always stored as uppercase codes (e.g. "US", "GB") throughout
    let byService = await getTMDBProviders(item, country);

    // hasCountry checks codes directly — no label conversion needed
    const hasCountry = (map) => country && Object.values(map || {}).some(e =>
        Array.from(e.countries).some(c => c.toLowerCase() === country.toLowerCase())
    );

    if (!byService || (country && !hasCountry(byService))) {
        const sd = await getStreamingAvailability(item, { ...meta, country });
        const opts = sd?.streamingOptions || sd?.result?.streamingOptions;
        if (opts) {
            const rapid = {};
            for (const [cc, services] of Object.entries(opts)) {
                for (const svc of services || []) {
                    const t = svc.type?.toLowerCase();
                    if (t === 'free' || t === 'ads' || t === 'rent' || t === 'buy') continue;
                    if (country && cc.toLowerCase() !== country) continue;
                    const id = (svc.service?.id || '').toLowerCase();
                    const sn = SERVICE_NAME_MAP[id] || normalizeServiceName(svc.service?.name || id);
                    if (!rapid[sn]) rapid[sn] = { type:'subscription', countries: new Set(), link: svc.link || '' };
                    rapid[sn].countries.add(cc.toUpperCase()); // store code, not label
                }
            }
            byService = byService || {};
            for (const [sn, d] of Object.entries(rapid)) {
                if (!byService[sn]) byService[sn] = d;
                else { d.countries.forEach(c => byService[sn].countries.add(c)); }
            }
        }
    }

    if (!byService || !Object.keys(byService).length) return { platforms: [], countryLabel };

    const merged = {};
    for (const [name, data] of Object.entries(byService)) {
        const key = name
            .replace(/Disney\s*Plus/i,'Disney Plus')
            .replace(/Paramount\s*Plus/i,'Paramount Plus')
            .replace(/Apple\s*TV\s*Plus/i,'Apple TV Plus')
            .replace(/Discovery\s*Plus/i,'Discovery Plus')
            .replace(/Amazon\s*Prime(\s*Video)?/i,'Amazon Prime Video');
        if (!merged[key]) merged[key] = { type:data.type, countries: new Set(data.countries), link:data.link, logo:data.logo };
        else { data.countries.forEach(c => merged[key].countries.add(c)); if (!merged[key].link && data.link) merged[key].link = data.link; }
    }

    const platforms = Object.entries(merged)
        .map(([name, d]) => ({ name, type:d.type, countries: sortCountries(Array.from(d.countries)), link:d.link, logo:d.logo }))
        .sort((a,b) => servicePriWeight(a.name) - servicePriWeight(b.name) || a.name.localeCompare(b.name))
        .filter(p => {
            if (!meta.service) return true;
            const n = p.name.toLowerCase(), s = meta.service.toLowerCase();
            return n.includes(s) || s.includes(n);
        });

    return { platforms, countryLabel };
}

// ── Data loaders ──────────────────────────────────────────────
const tag = (type) => (x) => ({ ...x, media_type: type });
const tagResults = (type) => (d) => (d.results || []).slice(0,20).map(tag(type));

// Home
const loadTrending = async () => {
    const today = new Date(), ts = d => d.toISOString().split('T')[0];
    const p90 = ts(new Date(today - 90*864e5)), f45 = ts(new Date(+today + 45*864e5)), p60 = ts(new Date(today - 60*864e5));
    const [mov, tv] = await Promise.all([
        fetchTMDB('/discover/movie',{ 'primary_release_date.gte':p90,'primary_release_date.lte':f45, sort_by:'popularity.desc', region:'US', with_original_language:'en' }),
        fetchTMDB('/discover/tv',   { 'air_date.gte':p60,'air_date.lte':ts(today), sort_by:'popularity.desc', with_original_language:'en' })
    ]);
    return [
        ...mov.results.slice(0,8).map(tag('movie')),
        ...tv.results.slice(0,6).map(tag('tv'))
    ].sort((a,b)=>b.popularity-a.popularity).slice(0,14);
};

// Movies
const loadNowPlaying   = () => fetchTMDB('/movie/now_playing',{ region:'US' }).then(tagResults('movie'));
const loadTopMovies    = () => fetchTMDB('/discover/movie',{ sort_by:'vote_average.desc','vote_count.gte':1000, without_genres:'16', with_original_language:'en' }).then(tagResults('movie'));
const loadMovieGenre   = (id) => () => fetchTMDB('/discover/movie',{ with_genres:id, sort_by:'popularity.desc','vote_count.gte':80 }).then(tagResults('movie'));

// TV Shows
const loadTopShows     = () => fetchTMDB('/discover/tv',{ sort_by:'vote_average.desc','vote_count.gte':500, without_genres:'16,99', with_original_language:'en' }).then(tagResults('tv'));
const loadShowGenre    = (...ids) => () => fetchTMDB('/discover/tv',{ with_genres:ids.join(','), sort_by:'popularity.desc','vote_count.gte':50, with_original_language:'en' }).then(tagResults('tv'));
const loadDocs         = () => fetchTMDB('/discover/tv',{ sort_by:'vote_average.desc','vote_count.gte':100, with_genres:'99', with_original_language:'en' }).then(tagResults('tv'));
const loadKids         = () => fetchTMDB('/discover/movie',{ sort_by:'popularity.desc', certification_country:'US','certification.lte':'PG', with_genres:'16,10751', with_original_language:'en' }).then(tagResults('movie'));
const loadKidsTV       = () => fetchTMDB('/discover/tv',  { sort_by:'popularity.desc', with_genres:'10762,10751', with_original_language:'en' }).then(tagResults('tv'));

// Anime
const loadAnime        = () => fetchTMDB('/discover/tv',{ sort_by:'popularity.desc', with_genres:'16', with_original_language:'ja' }).then(tagResults('tv'));
const loadTopAnime     = () => fetchTMDB('/discover/tv',{ sort_by:'vote_average.desc','vote_count.gte':200, with_genres:'16', with_original_language:'ja' }).then(tagResults('tv'));
const loadAnimeGenre   = (...ids) => () => fetchTMDB('/discover/tv',{ with_genres:['16',...ids].join(','), with_original_language:'ja', sort_by:'popularity.desc' }).then(tagResults('tv'));

// International
const loadByLang       = (lang, type) => () => fetchTMDB(`/discover/${type}`,{ with_original_language:lang, sort_by:'popularity.desc','vote_count.gte':100 }).then(tagResults(type));

const loadInternational = async () => {
    const langs = ['ko','fr','es','de','it','zh','hi','ja'];
    const all = await Promise.all(langs.map(l => fetchTMDB('/discover/movie',{ sort_by:'popularity.desc','vote_count.gte':200, with_original_language:l })));
    return all.flatMap(r=>r.results.slice(0,3)).sort((a,b)=>b.popularity-a.popularity).slice(0,20).map(tag('movie'));
};

// Home extras
const loadPopularTV = () => fetchTMDB('/trending/tv/week').then(tagResults('tv'));

const loadNewStreaming = async () => {
    const today = new Date(), ts = d => d.toISOString().split('T')[0];
    const p120 = ts(new Date(today - 120*864e5)), p10 = ts(new Date(today - 10*864e5));
    const d = await fetchTMDB('/discover/movie',{
        'primary_release_date.gte': p120, 'primary_release_date.lte': p10,
        sort_by: 'popularity.desc', with_original_language: 'en', 'vote_count.gte': 20
    });
    return (d.results || []).slice(0, 20).map(tag('movie'));
};

const loadHiddenGems = async () => {
    const [mov, tv] = await Promise.all([
        fetchTMDB('/discover/movie',{ sort_by:'vote_average.desc','vote_count.gte':150,'vote_count.lte':1500,'vote_average.gte':7.5, with_original_language:'en', without_genres:'99' }),
        fetchTMDB('/discover/tv',   { sort_by:'vote_average.desc','vote_count.gte':100,'vote_count.lte':800, 'vote_average.gte':7.8, with_original_language:'en', without_genres:'99' })
    ]);
    return [
        ...(mov.results||[]).slice(0,8).map(tag('movie')),
        ...(tv.results||[]).slice(0,6).map(tag('tv'))
    ].sort((a,b) => b.vote_average - a.vote_average).slice(0,14);
};

const loadActionMix = async () => {
    const [mov, tv] = await Promise.all([
        fetchTMDB('/discover/movie',{ with_genres:'28',    sort_by:'popularity.desc','vote_count.gte':200, with_original_language:'en' }),
        fetchTMDB('/discover/tv',   { with_genres:'10759', sort_by:'popularity.desc','vote_count.gte':100, with_original_language:'en' })
    ]);
    return [
        ...(mov.results||[]).slice(0,8).map(tag('movie')),
        ...(tv.results||[]).slice(0,6).map(tag('tv'))
    ].sort((a,b) => b.popularity - a.popularity).slice(0,14);
};

const loadComedyMix = async () => {
    const [mov, tv] = await Promise.all([
        fetchTMDB('/discover/movie',{ with_genres:'35', sort_by:'popularity.desc','vote_count.gte':200, with_original_language:'en' }),
        fetchTMDB('/discover/tv',   { with_genres:'35', sort_by:'popularity.desc','vote_count.gte':100, with_original_language:'en' })
    ]);
    return [
        ...(mov.results||[]).slice(0,8).map(tag('movie')),
        ...(tv.results||[]).slice(0,6).map(tag('tv'))
    ].sort((a,b) => b.popularity - a.popularity).slice(0,14);
};

const loadSciFiMix = async () => {
    const [mov, tv] = await Promise.all([
        fetchTMDB('/discover/movie',{ with_genres:'878',   sort_by:'popularity.desc','vote_count.gte':200, with_original_language:'en' }),
        fetchTMDB('/discover/tv',   { with_genres:'10765', sort_by:'popularity.desc','vote_count.gte':100, with_original_language:'en' })
    ]);
    return [
        ...(mov.results||[]).slice(0,8).map(tag('movie')),
        ...(tv.results||[]).slice(0,6).map(tag('tv'))
    ].sort((a,b) => b.popularity - a.popularity).slice(0,14);
};

const loadCriticallyAcclaimed = async () => {
    const [mov, tv] = await Promise.all([
        fetchTMDB('/discover/movie',{ sort_by:'vote_average.desc','vote_count.gte':3000,'vote_average.gte':8.0, with_original_language:'en', without_genres:'99,16' }),
        fetchTMDB('/discover/tv',   { sort_by:'vote_average.desc','vote_count.gte':1000,'vote_average.gte':8.2, with_original_language:'en', without_genres:'99,16' })
    ]);
    return [
        ...(mov.results||[]).slice(0,8).map(tag('movie')),
        ...(tv.results||[]).slice(0,6).map(tag('tv'))
    ].sort((a,b) => b.vote_average - a.vote_average).slice(0,14);
};

// ── Page definitions ──────────────────────────────────────────
const PAGES = {
    home: {
        eyebrow: 'Trending Now',
        heroLoader: () => fetchTMDB('/trending/all/week'),
        rows: [
            { id:'trending',       title:'Trending Now',           loader: loadTrending },
            { id:'in-theaters',    title:'Now in Theaters',        loader: loadNowPlaying },
            { id:'new-streaming',  title:'New on Streaming',       loader: loadNewStreaming },
            { id:'popular-tv',     title:'Popular TV Shows',       loader: loadPopularTV },
            { id:'acclaimed',      title:'Critically Acclaimed',   loader: loadCriticallyAcclaimed },
            { id:'top-movies',     title:'Top Rated Movies',       loader: loadTopMovies },
            { id:'action-mix',     title:'Action & Adventure',     loader: loadActionMix },
            { id:'hidden-gems',    title:'Hidden Gems',            loader: loadHiddenGems },
            { id:'scifi-mix',      title:'Sci-Fi & Fantasy',       loader: loadSciFiMix },
            { id:'comedy-mix',     title:'Comedy',                 loader: loadComedyMix },
            { id:'top-shows',      title:'Top Rated TV Shows',     loader: loadTopShows },
            { id:'docs',           title:'Documentaries',          loader: loadDocs },
            { id:'anime',          title:'Anime Spotlight',        loader: loadAnime },
            { id:'international',  title:'International Hits',     loader: loadInternational },
            { id:'kids',           title:'Kids & Family',          loader: loadKids },
        ]
    },
    movies: {
        eyebrow: 'Featured Film',
        heroLoader: async () => { const d = await fetchTMDB('/trending/movie/week'); return { results: d.results.map(tag('movie')) }; },
        rows: [
            { id:'m-theaters',  title:'Now in Theaters',     loader: loadNowPlaying },
            { id:'m-top',       title:'Top Rated',           loader: loadTopMovies },
            { id:'m-action',    title:'Action & Adventure',  loader: loadMovieGenre(28) },
            { id:'m-comedy',    title:'Comedy',              loader: loadMovieGenre(35) },
            { id:'m-drama',     title:'Drama',               loader: loadMovieGenre(18) },
            { id:'m-scifi',     title:'Science Fiction',     loader: loadMovieGenre(878) },
            { id:'m-thriller',  title:'Thriller',            loader: loadMovieGenre(53) },
            { id:'m-horror',    title:'Horror',              loader: loadMovieGenre(27) },
            { id:'m-animation', title:'Animation',           loader: loadMovieGenre(16) },
            { id:'m-romance',   title:'Romance',             loader: loadMovieGenre(10749) },
            { id:'m-history',   title:'History & War',       loader: loadMovieGenre(36) },
        ]
    },
    shows: {
        eyebrow: 'Featured Series',
        heroLoader: async () => { const d = await fetchTMDB('/trending/tv/week'); return { results: d.results.map(tag('tv')) }; },
        rows: [
            { id:'tv-top',      title:'Top Rated',           loader: loadTopShows },
            { id:'tv-crime',    title:'Crime & Mystery',     loader: loadShowGenre(80, 9648) },
            { id:'tv-drama',    title:'Drama',               loader: loadShowGenre(18) },
            { id:'tv-comedy',   title:'Comedy',              loader: loadShowGenre(35) },
            { id:'tv-scifi',    title:'Sci-Fi & Fantasy',    loader: loadShowGenre(10765) },
            { id:'tv-action',   title:'Action & Adventure',  loader: loadShowGenre(10759) },
            { id:'tv-reality',  title:'Reality',             loader: loadShowGenre(10764) },
            { id:'tv-docs',     title:'Documentaries',       loader: loadDocs },
            { id:'tv-kids',     title:'Kids & Family',       loader: loadKidsTV },
        ]
    },
    anime: {
        eyebrow: 'Featured Anime',
        heroLoader: async () => { const d = await fetchTMDB('/discover/tv',{ with_genres:'16', with_original_language:'ja', sort_by:'popularity.desc' }); return { results: d.results.map(tag('tv')) }; },
        rows: [
            { id:'a-trending', title:'Popular Right Now',   loader: loadAnime },
            { id:'a-top',      title:'Top Rated',           loader: loadTopAnime },
            { id:'a-action',   title:'Action',              loader: loadAnimeGenre(10759) },
            { id:'a-drama',    title:'Drama',               loader: loadAnimeGenre(18) },
            { id:'a-fantasy',  title:'Fantasy & Sci-Fi',    loader: loadAnimeGenre(10765) },
            { id:'a-comedy',   title:'Comedy',              loader: loadAnimeGenre(35) },
        ]
    },
    international: {
        eyebrow: 'World Cinema',
        heroLoader: async () => {
            const d = await fetchTMDB('/trending/movie/week');
            return { results: d.results.filter(x => x.original_language !== 'en').map(tag('movie')) };
        },
        rows: [
            { id:'i-kr-m',  title:'Korean Movies',         loader: loadByLang('ko','movie') },
            { id:'i-kr-tv', title:'Korean TV',             loader: loadByLang('ko','tv') },
            { id:'i-ja-m',  title:'Japanese',              loader: loadByLang('ja','movie') },
            { id:'i-es',    title:'Spanish Language',      loader: loadByLang('es','movie') },
            { id:'i-fr',    title:'French Cinema',         loader: loadByLang('fr','movie') },
            { id:'i-hi',    title:'Indian Cinema',         loader: loadByLang('hi','movie') },
            { id:'i-de',    title:'German',                loader: loadByLang('de','movie') },
            { id:'i-it',    title:'Italian',               loader: loadByLang('it','movie') },
            { id:'i-zh',    title:'Chinese',               loader: loadByLang('zh','movie') },
        ]
    }
};

// ── Card factory ──────────────────────────────────────────────
function makeCard(item) {
    const type    = item.media_type || (item.title ? 'movie' : 'tv');
    const title   = item.title || item.name || 'Unknown';
    const year    = (item.release_date || item.first_air_date || '').slice(0,4);
    const rating  = item.vote_average ? item.vote_average.toFixed(1) : null;
    const poster  = item.poster_path ? `${CONFIG.TMDB_IMG}/w342${item.poster_path}` : null;
    const overview = item.overview ? (item.overview.length > 95 ? item.overview.slice(0,92) + '…' : item.overview) : '';

    const daysOld      = item.release_date ? (Date.now() - new Date(item.release_date)) / 86400000 : Infinity;
    const isNew        = daysOld >= 0 && daysOld <= 60;
    const isTheatrical = type === 'movie' && daysOld >= -90 && daysOld <= 45;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-poster">
            ${poster
                ? `<img src="${poster}" alt="${title}" loading="lazy" onerror="this.style.display='none'">`
                : `<div class="card-poster-none"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`}
            ${rating ? `<div class="card-rating">★ ${rating}</div>` : ''}
            ${isNew ? '<div class="card-badge new">New</div>' : ''}
            ${isTheatrical && !isNew ? '<div class="card-badge theaters">In Theaters</div>' : ''}
            <div class="card-hover">
                ${overview ? `<div class="card-hover-overview">${overview}</div>` : ''}
                <div class="card-hover-meta">
                    ${rating ? `<span>★ ${rating}</span>` : ''}
                    ${year ? `<span>${year}</span>` : ''}
                    <span>${type === 'movie' ? 'Movie' : 'TV'}</span>
                </div>
            </div>
        </div>
        <div class="card-foot">
            <div class="card-name">${title}</div>
            ${year ? `<div class="card-year">${year}</div>` : ''}
        </div>`;
    card.addEventListener('click', () => openModal(item.id, type, item));
    return card;
}

function makeSkeletonCard() {
    const d = document.createElement('div');
    d.className = 'skel-card';
    d.innerHTML = '<div class="skel skel-poster"></div><div class="skel skel-line"></div><div class="skel skel-line2"></div>';
    return d;
}

// ── Row factory ───────────────────────────────────────────────
function makeRow(id, title, loader) {
    const row = document.createElement('div');
    row.className = 'row'; row.id = id;
    row.innerHTML = `
        <div class="row-head"><h2 class="row-title">${title}</h2></div>
        <div class="row-wrap">
            <button class="row-arrow row-arrow-l" aria-label="Scroll left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div class="row-track" id="track-${id}"></div>
            <button class="row-arrow row-arrow-r" aria-label="Scroll right">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
        </div>`;

    const track = row.querySelector('.row-track');
    for (let i = 0; i < 10; i++) track.appendChild(makeSkeletonCard());

    row.querySelector('.row-arrow-l').addEventListener('click', () => track.scrollBy({ left:-620, behavior:'smooth' }));
    row.querySelector('.row-arrow-r').addEventListener('click', () => track.scrollBy({ left: 620, behavior:'smooth' }));

    loader().then(items => {
        track.innerHTML = '';
        if (!items.length) { track.innerHTML = '<div class="empty-row">Nothing to show here</div>'; return; }
        items.forEach(item => track.appendChild(makeCard(item)));
    }).catch(() => { track.innerHTML = '<div class="empty-row">Could not load content</div>'; });

    return row;
}

// ── Page navigation ───────────────────────────────────────────
async function navigatePage(pageId) {
    if (pageId === state.currentPage && document.getElementById('rows').children.length > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    state.currentPage = pageId;

    document.querySelectorAll('.nav-link[data-page], .mobile-nav-link[data-page]').forEach(l =>
        l.classList.toggle('active', l.dataset.page === pageId)
    );

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Fade out existing rows
    const container = document.getElementById('rows');
    container.classList.add('fade-out');

    // Load hero and rows in parallel, but wait at least one tick for the fade to register
    await new Promise(r => setTimeout(r, 250));

    container.innerHTML = '';
    container.classList.remove('fade-out');

    const page = PAGES[pageId];
    page.rows.forEach(({ id, title, loader }) => container.appendChild(makeRow(id, title, loader)));

    loadHeroForPage(pageId);
}

// ── Hero ──────────────────────────────────────────────────────
async function loadHeroForPage(pageId) {
    clearInterval(state.heroTimer);
    const page = PAGES[pageId];
    try {
        const data = await page.heroLoader();
        const items = (data.results || []).filter(x => x.backdrop_path).slice(0, 5);
        state.heroItems = items;
        state.heroIdx   = 0;
        if (!items.length) return;
        renderHeroSlide(0);
        buildHeroDots();
        if (items.length > 1) {
            state.heroTimer = setInterval(() => renderHeroSlide((state.heroIdx + 1) % state.heroItems.length), 7000);
        }
    } catch(e) { console.warn('Hero load failed:', e); }
}

function renderHeroSlide(idx) {
    state.heroIdx = idx;
    const item   = state.heroItems[idx];
    const title  = item.title || item.name || '';
    const year   = (item.release_date || item.first_air_date || '').slice(0,4);
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
    const type   = item.media_type === 'movie' ? 'Movie' : 'TV Show';

    const img = document.getElementById('heroImg');
    img.style.opacity = '0';
    img.src = `${CONFIG.TMDB_IMG}/w1280${item.backdrop_path}`;
    img.onload = () => { img.style.opacity = '1'; };

    document.getElementById('heroTitle').textContent    = title;
    document.getElementById('heroOverview').textContent = item.overview || '';
    document.getElementById('heroMeta').innerHTML =
        (rating ? `<span class="hero-star">★ ${rating}</span>` : '') +
        (year   ? `<span>${year}</span>` : '') +
        `<span class="hero-pill">${type}</span>`;

    const eyebrow = document.querySelector('.hero-eyebrow');
    if (eyebrow) eyebrow.textContent = PAGES[state.currentPage]?.eyebrow || 'Trending Now';

    document.getElementById('heroInfoBtn').onclick = () => openModal(item.id, item.media_type, item);
    document.querySelectorAll('.hero-dot').forEach((d,i) => d.classList.toggle('active', i === idx));
}

function buildHeroDots() {
    const wrap = document.getElementById('heroDots');
    wrap.innerHTML = '';
    state.heroItems.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'hero-dot' + (i === 0 ? ' active' : '');
        b.addEventListener('click', () => { clearInterval(state.heroTimer); renderHeroSlide(i); });
        wrap.appendChild(b);
    });
}

// ── Search ────────────────────────────────────────────────────
function initSearch() {
    const input    = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');

    document.getElementById('searchBtn').addEventListener('click', openSearch);
    document.getElementById('searchCancel').addEventListener('click', closeSearch);

    input.addEventListener('input', () => {
        clearBtn.classList.toggle('visible', input.value.length > 0);
        clearTimeout(state.searchTimer);
        state.searchTimer = setTimeout(doSearch, 380);
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.remove('visible');
        document.getElementById('searchGrid').innerHTML = '';
        document.getElementById('searchHint').style.display = 'flex';
    });

    document.querySelectorAll('#typeChips .chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#typeChips .chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.searchType = btn.dataset.type;
            if (input.value.trim().length > 1) doSearch();
        });
    });

    const serviceSelect = document.getElementById('serviceSelect');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', () => {
            state.searchService = serviceSelect.value || null;
            if (input.value.trim().length > 1) doSearch();
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (document.getElementById('svcBg').classList.contains('open')) closeSvcOverlay();
            else if (document.getElementById('modalBg').classList.contains('open')) closeModal();
            else if (document.getElementById('searchOverlay').classList.contains('open')) closeSearch();
            else if (document.getElementById('mobileMenu').classList.contains('open')) closeMobileMenu();
        }
    });
}

function openSearch() {
    document.getElementById('searchOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('searchInput').focus(), 80);
}

function closeSearch() {
    document.getElementById('searchOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

async function doSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const grid  = document.getElementById('searchGrid');
    const hint  = document.getElementById('searchHint');

    if (query.length < 2) { grid.innerHTML = ''; hint.style.display = 'flex'; return; }
    hint.style.display = 'none';
    grid.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

    try {
        let results = [];
        if (state.searchType === 'all' || state.searchType === 'movie') {
            const d = await fetchTMDB('/search/movie', { query });
            results.push(...d.results.map(x => ({ ...x, media_type:'movie' })));
        }
        if (state.searchType === 'all' || state.searchType === 'tv') {
            const d = await fetchTMDB('/search/tv', { query });
            results.push(...d.results.map(x => ({ ...x, media_type:'tv' })));
        }
        results.sort((a,b) => b.popularity - a.popularity);

        if (state.searchService) {
            const svcLow = state.searchService.toLowerCase();
            const checked = [];
            for (const item of results.slice(0,30)) {
                const providers = await getTMDBProviders(item, state.country);
                if (providers && Object.keys(providers).some(n => n.toLowerCase().includes(svcLow) || svcLow.includes(n.toLowerCase()))) {
                    checked.push(item);
                    if (checked.length >= 20) break;
                }
            }
            results = checked;
        }

        grid.innerHTML = '';
        if (!results.length) { grid.innerHTML = '<div class="empty-row" style="grid-column:1/-1">No results found</div>'; return; }
        results.slice(0, 40).forEach(item => grid.appendChild(makeCard(item)));
    } catch {
        grid.innerHTML = '<div class="empty-row" style="grid-column:1/-1">Search failed — try again</div>';
    }
}

// ── Service overlay ───────────────────────────────────────────
function openSvcOverlay(p) {
    const url = p.link || SERVICE_URLS[p.name] || null;

    // Header
    const header = document.getElementById('svcHeader');
    const logoEl = p.logo
        ? `<img class="svc-logo" src="${CONFIG.TMDB_IMG}/w92${p.logo}" alt="" onerror="this.outerHTML='<div class=svc-abbr>${p.name.slice(0,3).toUpperCase()}</div>'">`
        : `<div class="svc-abbr">${p.name.slice(0,3).toUpperCase()}</div>`;
    const n = p.countries ? p.countries.length : 0;
    header.innerHTML = `${logoEl}<div><div class="svc-name">${p.name}</div><div class="svc-count">${n} ${n === 1 ? 'country' : 'countries'}</div></div>`;

    // Country chips — code + full name
    const wrap = document.getElementById('svcCountries');
    wrap.innerHTML = '';
    (p.countries || []).forEach(code => {
        const name = COUNTRY_NAMES[code.toLowerCase()];
        if (!name) return; // skip codes we can't resolve to a proper name
        const chip = document.createElement('div');
        chip.className = 'svc-country-chip';
        chip.textContent = name;
        wrap.appendChild(chip);
    });
    // Update count to reflect only named countries
    const namedCount = (p.countries || []).filter(c => COUNTRY_NAMES[c.toLowerCase()]).length;
    const countEl = document.querySelector('#svcHeader .svc-count');
    if (countEl) countEl.textContent = `${namedCount} ${namedCount === 1 ? 'country' : 'countries'}`;

    // Link
    const link = document.getElementById('svcLink');
    if (url) {
        link.href = url;
        link.textContent = `Watch on ${p.name} ↗`;
        link.style.display = '';
    } else {
        link.style.display = 'none';
    }

    document.getElementById('svcBg').classList.add('open');
}

function closeSvcOverlay() {
    document.getElementById('svcBg').classList.remove('open');
}

// ── Mobile menu ───────────────────────────────────────────────
function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const btn  = document.getElementById('hamburgerBtn');
    if (!menu) return;
    menu.classList.remove('open');
    if (btn) btn.classList.remove('open');
    document.body.style.overflow = '';
}

// ── Modal ─────────────────────────────────────────────────────
function initModal() {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalBg').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
    document.getElementById('svcClose').addEventListener('click', closeSvcOverlay);
    document.getElementById('svcBg').addEventListener('click', e => { if (e.target === e.currentTarget) closeSvcOverlay(); });
}

function closeModal() {
    document.getElementById('modalBg').classList.remove('open');
    document.body.style.overflow = '';
}

let _modalToken = 0;

async function openModal(id, type, item) {
    const myToken = ++_modalToken;
    const bg = document.getElementById('modalBg');
    bg.classList.add('open');
    document.body.style.overflow = 'hidden';

    document.getElementById('modalTitle').textContent    = item?.title || item?.name || '…';
    document.getElementById('modalChips').innerHTML      = '';
    document.getElementById('modalOverview').textContent = item?.overview || '';
    document.getElementById('modalBanner').src           = item?.backdrop_path ? `${CONFIG.TMDB_IMG}/w1280${item.backdrop_path}` : '';
    // Clear any previously injected Cast heading to avoid duplicates on re-open
    document.querySelectorAll('#castSection .modal-section-title').forEach(el => el.remove());
    document.getElementById('castRow').innerHTML         = '<div class="spin" style="margin:8px 0"></div>';
    document.getElementById('streamingList').innerHTML   = '<div class="stream-loading"><div class="spin"></div><span>Checking availability…</span></div>';
    const watchTitle = document.querySelector('.modal-watch .modal-section-title');
    if (watchTitle) watchTitle.textContent = state.country ? 'Where to Watch' : 'Where to Watch — Worldwide';
    document.getElementById('modalDetails').innerHTML    = '';
    document.getElementById('similarSection').style.display = 'none';
    document.getElementById('modalTmdbLink').href = `https://www.themoviedb.org/${type === 'tv' ? 'tv' : 'movie'}/${id}`;

    const [details, cast, similar] = await Promise.all([
        getMediaDetails(id, type),
        getMediaCast(id, type),
        getMediaSimilar(id, type)
    ]);

    if (myToken !== _modalToken) return; // a newer modal opened — abandon this one

    // Scroll to top now — modal has full content height so the reset lands at the banner
    bg.scrollTop = 0;

    const title = details.title || details.name || item?.title || item?.name || '';
    const year  = (details.release_date || details.first_air_date || '').slice(0,4);
    const lang  = LANGUAGE_NAMES[details.original_language] || details.original_language || '';

    const bannerSrc = details.backdrop_path
        ? `${CONFIG.TMDB_IMG}/w1280${details.backdrop_path}`
        : (item?.backdrop_path ? `${CONFIG.TMDB_IMG}/w1280${item.backdrop_path}` : '');
    document.getElementById('modalBanner').src           = bannerSrc;
    document.getElementById('modalTitle').textContent    = title;
    document.getElementById('modalOverview').textContent = details.overview || item?.overview || 'No description available.';

    const chips  = document.getElementById('modalChips');
    const rating = details.vote_average ? details.vote_average.toFixed(1) : null;
    if (rating && parseFloat(rating) > 0) chips.innerHTML += `<span class="modal-chip gold">★ ${rating}</span>`;
    if (year)   chips.innerHTML += `<span class="modal-chip">${year}</span>`;
    chips.innerHTML += `<span class="modal-chip blue">${type === 'tv' ? 'TV Show' : 'Movie'}</span>`;

    if (type === 'movie' && details.runtime) {
        const h = Math.floor(details.runtime/60), m = details.runtime%60;
        chips.innerHTML += `<span class="modal-chip">${h > 0 ? `${h}h ${m}m` : `${m}m`}</span>`;
    } else if (type === 'tv' && details.number_of_seasons) {
        const s = details.number_of_seasons, ep = details.number_of_episodes;
        chips.innerHTML += `<span class="modal-chip">${s} Season${s>1?'s':''}${ep?`, ${ep} Eps`:''}</span>`;
    }

    const detailsEl = document.getElementById('modalDetails');
    const addDetail = (label, val) => {
        if (!val) return;
        const d = document.createElement('div'); d.className = 'detail-row';
        d.innerHTML = `<span class="detail-label">${label}</span><span class="detail-val" style="word-break:break-word;overflow-wrap:break-word">${val}</span>`;
        detailsEl.appendChild(d);
    };
    addDetail('Language', lang);
    addDetail('Status', details.status);
    if (type === 'tv' && details.networks?.length) addDetail('Network', details.networks.map(n=>n.name).join(', '));
    if (details.genres?.length) addDetail('Genres', details.genres.map(g=>g.name).join(', '));
    if (type === 'movie' && details.budget > 0) addDetail('Budget', '$' + details.budget.toLocaleString());

    // Cast
    const castSection = document.getElementById('castSection');
    const castRow = document.getElementById('castRow');
    castRow.innerHTML = '';
    // Inject heading now that data has resolved (avoids heading showing above loading spinner)
    const castHeading = document.createElement('h3');
    castHeading.className = 'modal-section-title';
    castHeading.textContent = 'Cast';
    castSection.insertBefore(castHeading, castRow);
    if (cast.length) {
        cast.slice(0,10).forEach(actor => {
            const rawRole = actor.character || '';
            const role = rawRole.length > 22 ? rawRole.slice(0, 20) + '…' : rawRole;
            const el = document.createElement('div'); el.className = 'cast-item';
            el.innerHTML = actor.profile_path
                ? `<div class="cast-avatar"><img src="${CONFIG.TMDB_IMG}/w185${actor.profile_path}" alt="${actor.name}" loading="lazy"></div><div class="cast-name">${actor.name}</div><div class="cast-role">${role}</div>`
                : `<div class="cast-avatar-ph">👤</div><div class="cast-name">${actor.name}</div><div class="cast-role">${role}</div>`;
            castRow.appendChild(el);
        });
    } else {
        castRow.innerHTML = '<span style="font-size:12px;color:var(--t3)">No cast data</span>';
    }

    // Similar — always exactly 2 full rows
    if (similar.length) {
        const sec  = document.getElementById('similarSection');
        const grid = document.getElementById('similarGrid');
        sec.style.display = '';
        grid.innerHTML = '';

        // Match fixed CSS column counts per breakpoint
        const w = window.innerWidth;
        const cols  = w <= 480 ? 3 : w <= 900 ? 4 : 5;
        const count = Math.min(similar.length, cols * 2);

        similar.slice(0, count).forEach(sim => {
            const el = document.createElement('div'); el.className = 'sim-card';
            el.innerHTML = `<img src="${sim.poster_path ? `${CONFIG.TMDB_IMG}/w185${sim.poster_path}` : ''}" alt="${sim.title||sim.name}" loading="lazy" style="${sim.poster_path ? '' : 'background:var(--surf3)'}"><div class="sim-name" style="word-break:break-word;overflow-wrap:break-word">${sim.title||sim.name}</div>`;
            el.addEventListener('click', () => openModal(sim.id, type, sim));
            grid.appendChild(el);
        });
    }

    // Streaming
    const stEl = document.getElementById('streamingList');
    try {
        const cached = state.streamCache.get(id);
        const result = cached || await buildPlatformArray({ id, media_type: type }, { country: state.country });
        if (!cached) state.streamCache.set(id, result);
        const { platforms, countryLabel } = result;

        if (!platforms.length) {
            stEl.innerHTML = `<div class="stream-empty">Not available on subscription platforms${countryLabel ? ` in ${countryLabel}` : ''}.</div>`;
        } else {
            stEl.innerHTML = '';
            const list = document.createElement('div'); list.className = 'stream-list';
            platforms.filter(p => p.name).forEach(p => {
                const pill = document.createElement('div');
                pill.className = 'stream-item';
                pill.setAttribute('role', 'button');
                pill.addEventListener('click', () => openSvcOverlay(p));

                const abbr = p.name.slice(0, 3).toUpperCase();
                if (p.logo) {
                    const img = document.createElement('img');
                    img.className = 'stream-pill-logo';
                    img.src = `${CONFIG.TMDB_IMG}/w45${p.logo}`;
                    img.alt = '';
                    img.loading = 'lazy';
                    img.onerror = function() {
                        const sp = document.createElement('span');
                        sp.className = 'stream-pill-abbr';
                        sp.textContent = abbr;
                        this.parentNode.replaceChild(sp, this);
                    };
                    pill.appendChild(img);
                } else {
                    const sp = document.createElement('span');
                    sp.className = 'stream-pill-abbr';
                    sp.textContent = abbr;
                    pill.appendChild(sp);
                }

                const nameEl = document.createElement('span');
                nameEl.className = 'stream-name';
                nameEl.textContent = p.name;
                pill.appendChild(nameEl);

                // Show full country names; skip any code we can't resolve
                if (p.countries && p.countries.length) {
                    const names = p.countries
                        .map(c => COUNTRY_NAMES[c.toLowerCase()])
                        .filter(Boolean);
                    if (names.length) {
                        const top   = names.slice(0, 2);
                        const extra = names.length > 2 ? ` +${names.length - 2}` : '';
                        const codesEl = document.createElement('span');
                        codesEl.className = 'stream-countries';
                        codesEl.textContent = top.join(' · ') + extra;
                        pill.appendChild(codesEl);
                    }
                }

                list.appendChild(pill);
            });
            stEl.appendChild(list);
        }
    } catch {
        stEl.innerHTML = '<div class="stream-empty">Could not load streaming data.</div>';
    }
}

// ── Nav ───────────────────────────────────────────────────────
function initNav() {
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('solid', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Keep search overlay + mobile drawer selects in sync
    function applyCountry(code) {
        state.country = code;
        localStorage.setItem('cs_country', code);
        state.streamCache.clear();
        // Nav button label
        const label = document.getElementById('navCountryCode');
        if (label) label.textContent = code ? (COUNTRY_NAMES[code.toLowerCase()] || code.toUpperCase()) : 'All';
        // Nav list active state
        document.querySelectorAll('#navCountryList .nav-country-item').forEach(item => {
            item.classList.toggle('active', item.dataset.code === code);
        });
        // Sync the two <select> elements (search overlay + mobile drawer)
        ['countrySelect', 'mobileCountrySelect'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = code;
        });
    }

    // Populate search overlay + mobile drawer selects
    ['countrySelect', 'mobileCountrySelect'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const allOpt = document.createElement('option');
        allOpt.value = ''; allOpt.textContent = 'All Countries';
        if (!state.country) allOpt.selected = true;
        sel.appendChild(allOpt);
        Object.entries(COUNTRY_NAMES).forEach(([code, name]) => {
            const opt = document.createElement('option');
            opt.value = code; opt.textContent = name;
            if (code === state.country) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', e => applyCountry(e.target.value));
    });

    // Build the nav country list (custom buttons, no <select>)
    const navCountryList = document.getElementById('navCountryList');
    const navCountryDropdown = document.getElementById('navCountryDropdown');
    const navCountryBtn = document.getElementById('navCountryBtn');
    if (navCountryList && navCountryDropdown && navCountryBtn) {
        const addItem = (code, name) => {
            const btn = document.createElement('button');
            btn.className = 'nav-country-item' + (code === state.country ? ' active' : '');
            btn.dataset.code = code;
            btn.textContent = name;
            btn.addEventListener('click', () => {
                applyCountry(code);
                navCountryDropdown.classList.remove('open');
                navCountryBtn.classList.remove('open');
            });
            navCountryList.appendChild(btn);
        };
        addItem('', 'All Countries');
        Object.entries(COUNTRY_NAMES).forEach(([code, name]) => addItem(code, name));
    }

    // Nav country picker toggle + initial label
    const navCountryCode = document.getElementById('navCountryCode');
    if (navCountryCode) navCountryCode.textContent = state.country ? (COUNTRY_NAMES[state.country.toLowerCase()] || state.country.toUpperCase()) : 'All';
    if (navCountryBtn && navCountryDropdown) {
        navCountryBtn.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = navCountryDropdown.classList.toggle('open');
            navCountryBtn.classList.toggle('open', isOpen);
        });
        document.addEventListener('click', e => {
            if (!navCountryBtn.closest('.nav-country').contains(e.target)) {
                navCountryDropdown.classList.remove('open');
                navCountryBtn.classList.remove('open');
            }
        });
    }

    document.getElementById('homeLink').addEventListener('click', e => {
        e.preventDefault(); navigatePage('home');
    });

    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault(); navigatePage(link.dataset.page);
        });
    });

    // Hamburger / mobile drawer
    const hamburgerBtn      = document.getElementById('hamburgerBtn');
    const mobileMenu        = document.getElementById('mobileMenu');
    const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
    const mobileMenuClose   = document.getElementById('mobileMenuClose');

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        hamburgerBtn.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    hamburgerBtn.addEventListener('click', openMobileMenu);
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);

    document.querySelectorAll('.mobile-nav-link[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            closeMobileMenu();
            navigatePage(link.dataset.page);
        });
    });
}

// ── Init ──────────────────────────────────────────────────────
function init() {
    initNav();
    initSearch();
    initModal();
    navigatePage('home');
}

init();
