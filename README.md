# CineScout

A web application that helps you find where to watch movies and TV shows across different streaming platforms worldwide. Perfect for VPN users who want to access content available in different regions!

## ✨ Features

- **Search Movies & TV Shows**: Search through millions of titles using The Movie Database (TMDB)
- **IMDb Ratings**: See IMDb ratings for each title to help you decide what to watch
- **Global Streaming Availability**: Find out which streaming platforms have your content in different countries
- **VPN-Friendly**: Designed for users who want to know where content is available globally
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Clean UI**: Modern, Netflix-inspired interface

## 🚀 Getting Started

### Prerequisites

You'll need to get free API keys from the following services:

1. **TMDB (The Movie Database)** - For movie/TV show data
2. **OMDb** - For IMDb ratings
3. **Streaming Availability API** (Optional) - For real-time streaming data

### Step 1: Get Your API Keys

#### TMDB API Key (Required)
1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Fill out the form (you can use "Personal/Educational" for type)
6. Copy your API Key (v3 auth)

#### OMDb API Key (Required for IMDb ratings)
1. Go to [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
2. Select "FREE" plan (1,000 daily requests)
3. Enter your email address
4. Check your email and activate your API key
5. Copy your API key from the email

#### Streaming Availability API Key (Optional - for real streaming data)
1. Go to [RapidAPI Streaming Availability](https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability)
2. Sign up for a free RapidAPI account
3. Subscribe to the FREE plan (100 requests/day)
4. Copy your RapidAPI key from the code snippet

### Step 2: Configure the Application

1. Open `app.js` in your text editor
2. Find the `CONFIG` object at the top of the file
3. Replace the placeholder API keys with your actual keys:

```javascript
const CONFIG = {
    TMDB_API_KEY: 'your_actual_tmdb_key_here',
    OMDB_API_KEY: 'your_actual_omdb_key_here',
    STREAMING_API_KEY: 'your_actual_rapidapi_key_here', // Optional
    // ... rest of config
};
```

### Step 3: Run the Application

1. Open `index.html` in your web browser
2. Start searching for movies and TV shows!

**Note**: For best results, run this on a local web server:

```bash
# If you have Python installed:
python3 -m http.server 8000

# Then open: http://localhost:8000
```

Or use VS Code's Live Server extension.

## 📖 How to Use

1. **Search**: Enter a movie or TV show name in the search box
2. **Filter**: Choose between Movies, TV Shows, or All
3. **Select Country**: Pick a specific country to see streaming availability there
4. **Browse Results**: Click on any card to see details including:
   - Movie/show poster
   - Release year
   - IMDb rating
   - Overview/description
   - Streaming availability by country

## 🔧 Customization

### Adding More Countries

Edit the `COUNTRY_NAMES` object in `app.js`:

```javascript
const COUNTRY_NAMES = {
    'us': '🇺🇸 United States',
    'ca': '🇨🇦 Canada',
    // Add more countries here
    'es': '🇪🇸 Spain',
    'it': '🇮🇹 Italy',
};
```

Then add the corresponding option in `index.html`:

```html
<option value="es">Spain</option>
<option value="it">Italy</option>
```

### Implementing Real Streaming Data

The current implementation uses mock data for streaming platforms. To implement real data:

1. Get a Streaming Availability API key (see above)
2. Replace the `getStreamingAvailability()` function in `app.js`
3. Update the `loadStreamingData()` function to use real API responses

Example API alternatives:
- [Streaming Availability API](https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability)
- [Watchmode API](https://api.watchmode.com/)
- [JustWatch API](https://www.justwatch.com/) (unofficial)

## 🎨 Color Customization

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #e50914;  /* Main accent color */
    --secondary-color: #221f1f; /* Secondary backgrounds */
    --background: #141414;      /* Main background */
    /* ... more variables */
}
```

## 📱 Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## ⚠️ Important Notes

### API Rate Limits

- **TMDB**: 40 requests per 10 seconds
- **OMDb FREE**: 1,000 requests per day
- **Streaming Availability FREE**: 100 requests per day

### CORS Issues

If you encounter CORS errors, you need to run the app through a web server (not just opening the HTML file). Use:
- Python's http.server
- VS Code Live Server extension
- Node.js http-server
- Any other local web server

### Mock Data

Currently, the streaming availability uses mock data. For production use, integrate a real streaming availability API.

## 🛠️ Technologies Used

- **HTML5**: Structure
- **CSS3**: Styling with modern features (Grid, Flexbox, Animations)
- **Vanilla JavaScript**: No frameworks, pure JS
- **TMDB API**: Movie and TV show database
- **OMDb API**: IMDb ratings
- **Streaming Availability API**: Platform availability (optional)

## 🔮 Future Enhancements

- [ ] Add watchlist functionality (save to browser localStorage)
- [ ] Implement user ratings and reviews
- [ ] Add trailer previews
- [ ] Show similar movies/shows recommendations
- [ ] Add advanced filters (genre, year, rating range)
- [ ] Implement pagination for search results
- [ ] Add dark/light theme toggle
- [ ] Cache API results to reduce requests
- [ ] Add PWA support for offline functionality

## 📄 License

This project is free to use for personal and educational purposes.

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Improve the streaming data integration
- Add more countries and platforms
- Enhance the UI/UX
- Add backend support for API key security
- Implement user accounts

## 📞 Support

If you encounter issues:
1. Make sure all API keys are correctly configured
2. Check the browser console for errors
3. Verify you're running on a web server (not file://)
4. Check API rate limits haven't been exceeded

## 🙏 Credits

- Movie data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Ratings from [OMDb API](http://www.omdbapi.com/)
- Streaming data concept using [Streaming Availability API](https://rapidapi.com/)

---

**Enjoy finding your next movie or show! 🍿🎬**
