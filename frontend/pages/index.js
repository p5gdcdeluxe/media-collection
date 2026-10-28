/**
 * Media Collection Manager Application
 * A comprehensive DVD/BluRay management website with advanced features for organizing
 * and tracking media collections with loan history, analytics, and reporting capabilities.
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaPlus, FaFilter, FaTable, FaTh, FaBarcode, FaBook, FaTv, FaStar, FaLock, FaUnlock, FaDownload, FaUpload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Main component for the Media Collection Manager application
 * Manages all UI state, data fetching, and user interactions for the collection management system
 */
const MediaCollectionManager = () => {
  const [medias, setMedias] = useState([]);
  const [filteredMedias, setFilteredMedias] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loanedFilter, setLoanedFilter] = useState('');
  const [years, setYears] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBoxSetManager, setShowBoxSetManager] = useState(false);
  const [showTvShowManager, setShowTvShowManager] = useState(false);
  const [showSeasonManager, setShowSeasonManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showLoanHistory, setShowLoanHistory] = useState(false);
  const [showCollectionAnalytics, setShowCollectionAnalytics] = useState(false);
  const [loanHistory, setLoanHistory] = useState([]);
  const [collectionAnalytics, setCollectionAnalytics] = useState(null);
  const [selectedBoxSet, setSelectedBoxSet] = useState(null);
  const [wishlistMediaId, setWishlistMediaId] = useState('');
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showOnlyMovies, setShowOnlyMovies] = useState(false);
  const [showOnlyTvShows, setShowOnlyTvShows] = useState(false);
  const [boxSets, setBoxSets] = useState([]);
  const [genres, setGenres] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [formats, setFormats] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [stats, setStats] = useState({});
  
  // Collection form state
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    ean13: '',
    title: '',
    releaseYear: '',
    director: '',
    rating: '',
    genre: '',
    format: '',
    edition: '',
    coverImage: '',
    isLoaned: false,
    customNotes: '',
    location: '',
    country: '',
    price: ''
  });

  // TV Show form state
  const [tvShowForm, setTvShowForm] = useState({
    ean13: '',
    title: '',
    releaseYear: '',
    director: '',
    rating: '',
    genre: '',
    format: '',
    edition: '',
    coverImage: '',
    isLoaned: false,
    customNotes: '',
    location: '',
    country: '',
    totalSeasons: ''
  });

  // Season form state
  const [seasonForm, setSeasonForm] = useState({
    ean13: '',
    title: '',
    releaseYear: '',
    director: '',
    rating: '',
    genre: '',
    format: '',
    edition: '',
    coverImage: '',
    isLoaned: false,
    customNotes: '',
    location: '',
    country: '',
    tvShowId: ''
  });

  // BoxSet form state
  const [boxSetForm, setBoxSetForm] = useState({
    name: '',
    description: ''
  });

  // Fetch data
  useEffect(() => {
    fetchData();
    fetchStats();
    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (showWishlist) {
      fetchWishlistItems();
    }
    if (showLoanHistory) {
      fetchLoanHistory();
    }
    if (showCollectionAnalytics) {
      fetchCollectionAnalytics();
    }
  }, [showWishlist, showLoanHistory, showCollectionAnalytics]);

  /**
   * Fetches all data for the application including media items, box sets, and suggestions
   * @param {number} page - Page number for pagination (optional)
   * @param {number} limit - Number of items per page (optional)
   */
  const fetchData = async (page = 1, limit = itemsPerPage) => {
    try {
      setLoading(true);
      const [mediasRes, boxSetsRes, genresRes, directorsRes, countriesRes, formatsRes, ratingsRes, collectionsRes, yearsRes, tvShowsRes] = await Promise.all([
        axios.get(`/api/media?page=${page}&limit=${limit}`),
        axios.get('/api/media/boxsets'),
        axios.get('/api/media/genres'),
        axios.get('/api/media/directors'),
        axios.get('/api/media/countries'),
        axios.get('/api/media/formats'),
        axios.get('/api/media/ratings'),
        axios.get('/api/media/collections'),
        axios.get('/api/media/years'),
        axios.get('/api/media/tvshows')
      ]);

      setMedias(mediasRes.data.data);
      setFilteredMedias(mediasRes.data.data);
      setTotalItems(mediasRes.data.total);
      setBoxSets(boxSetsRes.data);
      setGenres(genresRes.data);
      setDirectors(directorsRes.data);
      setCountries(countriesRes.data);
      setFormats(formatsRes.data);
      setRatings(ratingsRes.data);
      setCollections(collectionsRes.data);
      setYears(yearsRes.data);
      setTvShows(tvShowsRes.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches suggestions for autocomplete fields (genres, directors, etc.)
   */
  const fetchSuggestions = async () => {
    try {
      const [genresRes, directorsRes, countriesRes, ratingsRes, collectionsRes, yearsRes, tvShowsRes] = await Promise.all([
        axios.get('/api/media/genres'),
        axios.get('/api/media/directors'),
        axios.get('/api/media/countries'),
        axios.get('/api/media/ratings'),
        axios.get('/api/media/collections'),
        axios.get('/api/media/years'),
        axios.get('/api/media/tvshows')
      ]);
      
      setGenres(genresRes.data);
      setDirectors(directorsRes.data);
      setCountries(countriesRes.data);
      setRatings(ratingsRes.data);
      setCollections(collectionsRes.data);
      setYears(yearsRes.data);
      setTvShows(tvShowsRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement des suggestions:', err);
    }
  };

  /**
   * Fetches statistics about the media collection for display in the dashboard
   */
  const fetchStats = async () => {
    try {
      const statsRes = await axios.get('/api/media/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  /**
   * Fetches loan history data when the loan history modal is opened
   */
  const fetchLoanHistory = async () => {
    try {
      const response = await axios.get('/api/media/loan-history');
      setLoanHistory(response.data);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique des emprunts');
      console.error(err);
    }
  };

  /**
   * Fetches collection analytics data when the analytics modal is opened
   */
  const fetchCollectionAnalytics = async () => {
    try {
      const response = await axios.get('/api/media/collection-growth-analytics');
      setCollectionAnalytics(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des analyses de collection');
      console.error(err);
    }
  };

  // Filter and search
  useEffect(() => {
    const searchMedia = async () => {
      try {
        // Build query parameters with type filters
        let queryParams = `q=${searchQuery}&format=${selectedFormat}&genre=${selectedGenre}&country=${selectedCountry}&year=${selectedYear}&loaned=${loanedFilter}&page=${currentPage}&limit=${itemsPerPage}`;
        
        // Add type filters if active
        if (showOnlyMovies) {
          queryParams += '&type=Movie';
        } else if (showOnlyTvShows) {
          queryParams += '&type=TV Show';
        }
        
        const response = await axios.get(`/api/media/search?${queryParams}`);
        setMedias(response.data.data);
        setFilteredMedias(response.data.data);
        setTotalItems(response.data.total);
      } catch (err) {
        setError('Erreur lors de la recherche');
        console.error(err);
      }
    };

    const timer = setTimeout(() => {
      if (searchQuery || selectedFormat || selectedGenre || loanedFilter !== '') {
        searchMedia();
      } else {
        fetchData(currentPage, itemsPerPage);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedFormat, selectedGenre, loanedFilter, itemsPerPage, currentPage, showOnlyMovies, showOnlyTvShows]);

  // Apply show/hide filters
  useEffect(() => {
    let filtered = medias;
    
    // Apply show only movies filter
    if (showOnlyMovies) {
      filtered = filtered.filter(media => media.type !== 'TV Show');
    }
    
    // Apply show only TV shows filter
    if (showOnlyTvShows) {
      filtered = filtered.filter(media => media.type === 'TV Show');
    }
    
    setFilteredMedias(filtered);
  }, [medias, showOnlyMovies, showOnlyTvShows]);

  /**
   * Handles form input changes for media items
   * @param {Object} e - Event object from input change
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Handles form input changes for TV show forms
   * @param {Object} e - Event object from input change
   */
  const handleTvShowInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTvShowForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Handles form input changes for season forms
   * @param {Object} e - Event object from input change
   */
  const handleSeasonInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeasonForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBoxSetInputChange = (e) => {
    const { name, value } = e.target;
    setBoxSetForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCollectionInputChange = (e) => {
    const { name, value } = e.target;
    setCollectionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission for creating new media items
   * @param {Object} e - Event object from form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/media', formData);
      setShowAddForm(false);
      setFormData({
        ean13: '',
        title: '',
        releaseYear: '',
        director: '',
        rating: '',
        genre: '',
        format: '',
        edition: '',
        coverImage: '',
        isLoaned: false,
        customNotes: '',
        location: ''
      });
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de l\'ajout du média');
      console.error(err);
    }
  };

  const handleBoxSetSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/media/boxsets', boxSetForm);
      setBoxSetForm({ name: '', description: '' });
      setShowBoxSetManager(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de la création du boxset');
      console.error(err);
    }
  };

  /**
   * Handles form submission for creating new TV shows
   * @param {Object} e - Event object from form submission
   */
  const handleTvShowSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure totalSeasons is converted to number
      const tvShowData = {
        ...tvShowForm,
        totalSeasons: tvShowForm.totalSeasons ? parseInt(tvShowForm.totalSeasons) : 0
      };
      
      await axios.post('/api/media/tvshows', tvShowData);
      setTvShowForm({
        ean13: '',
        title: '',
        releaseYear: '',
        director: '',
        rating: '',
        genre: '',
        format: '',
        edition: '',
        coverImage: '',
        isLoaned: false,
        customNotes: '',
        location: '',
        country: '',
        totalSeasons: ''
      });
      setShowTvShowManager(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de la création de la série TV');
      console.error(err);
    }
  };

  /**
   * Handles form submission for creating new seasons
   * @param {Object} e - Event object from form submission
   */
  const handleSeasonSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make sure tvShowId is properly set
      const seasonData = {
        ...seasonForm,
        tvShowId: seasonForm.tvShowId || ''
      };
      
      await axios.post('/api/media/seasons', seasonData);
      setSeasonForm({
        ean13: '',
        title: '',
        releaseYear: '',
        director: '',
        rating: '',
        genre: '',
        format: '',
        edition: '',
        coverImage: '',
        isLoaned: false,
        customNotes: '',
        location: '',
        country: '',
        tvShowId: ''
      });
      setShowSeasonManager(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de la création de la saison');
      console.error(err);
    }
  };

  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    try {
      // For now, we'll treat collections as boxsets since we don't have a dedicated collection endpoint
      // In a real implementation, we'd have a separate endpoint for collections
      await axios.post('/api/media/boxsets', collectionForm);
      setCollectionForm({ name: '', description: '' });
      setShowCollectionManager(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de la création de la collection');
      console.error(err);
    }
  };

  const toggleLoanStatus = async (id) => {
    try {
      const media = medias.find(m => m.id === id);
      await axios.put(`/api/media/${id}`, { ...media, isLoaned: !media.isLoaned });
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      console.error(err);
    }
  };

  const addMediaToCollection = async (collectionId, mediaId) => {
    try {
      await axios.post(`/api/media/collections/${collectionId}/media/${mediaId}`);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de l\'ajout à la collection');
      console.error(err);
    }
  };

  const removeMediaFromCollection = async (collectionId, mediaId) => {
    try {
      await axios.delete(`/api/media/collections/${collectionId}/media/${mediaId}`);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de la suppression de la collection');
      console.error(err);
    }
  };

  const addToWishlist = async () => {
    if (!wishlistMediaId) {
      setError('Veuillez sélectionner un média');
      return;
    }
    
    try {
      // In a real implementation, you would save this to a wishlist table
      // For now, we'll just show a success message
      await axios.post('/api/media/wishlist', {
        userId: 'current-user', // In a real app, this would come from authentication
        mediaId: parseInt(wishlistMediaId)
      });
      
      alert(`Le média a été ajouté à votre liste de souhaits`);
      setWishlistMediaId('');
      // Refresh wishlist items
      fetchWishlistItems();
    } catch (err) {
      setError('Erreur lors de l\'ajout à la liste de souhaits');
      console.error(err);
    }
  };

  const fetchWishlistItems = async () => {
    try {
      const response = await axios.get('/api/media/wishlist/current-user'); // In a real app, this would come from authentication
      setWishlistItems(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de la liste de souhaits:', err);
    }
  };

  const deleteMedia = async (id) => {
    try {
      await axios.delete(`/api/media/${id}`);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Erreur lors de la suppression du média');
      console.error(err);
    }
  };

  const addToWishlist = async () => {
    if (!wishlistMediaId) {
      setError('Veuillez sélectionner un média');
      return;
    }
    
    try {
      await axios.post('/api/media/wishlist', {
        userId: 'current-user', // In a real app, this would come from authentication
        mediaId: parseInt(wishlistMediaId)
      });
      
      alert(`Le média a été ajouté à votre liste de souhaits`);
      setWishlistMediaId('');
      // Refresh wishlist items
      fetchWishlistItems();
    } catch (err) {
      setError('Erreur lors de l\'ajout à la liste de souhaits');
      console.error(err);
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await axios.delete(`/api/media/wishlist/current-user/${wishlistId}`);
      fetchWishlistItems();
    } catch (err) {
      setError('Erreur lors de la suppression de la liste de souhaits');
      console.error(err);
    }
  };

  const markAsCompleted = async (wishlistId) => {
    try {
      await axios.put(`/api/media/wishlist/current-user/${wishlistId}/mark-completed`);
      fetchWishlistItems();
    } catch (err) {
      setError('Erreur lors de la mise à jour de la liste de souhaits');
      console.error(err);
    }
  };

  const fetchWishlistItems = async () => {
    try {
      const response = await axios.get('/api/media/wishlist/current-user'); // In a real app, this would come from authentication
      setWishlistItems(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de la liste de souhaits:', err);
    }
  };

  /**
   * Exports the current collection data as JSON
   */
  const exportData = async () => {
    try {
      const response = await axios.post('/api/media/export');
      const dataStr = JSON.stringify(response.data);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'media-collection-export.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      setError('Erreur lors de l\'exportation des données');
      console.error(err);
    }
  };

  /**
   * Exports the current collection data as CSV format
   */
  const exportToCsv = async () => {
    try {
      const response = await axios.get('/api/media/export/csv');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'media-collection-export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors de l\'exportation en CSV');
      console.error(err);
    }
  };

  /**
   * Exports the current collection data as text-based "PDF" report
   */
  const exportToPdf = async () => {
    try {
      const response = await axios.get('/api/media/export/pdf');
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'media-collection-report.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors de l\'exportation en PDF');
      console.error(err);
    }
  };

  /**
   * Imports collection data from a JSON file
   * @param {Object} event - File input event object
   */
  const importData = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          await axios.post('/api/media/import', data);
          fetchData(); // Refresh data
        } catch (err) {
          setError('Erreur lors de l\'importation des données');
          console.error(err);
        }
      };
      reader.readAsText(file);
    }
  };

  const getRatingStars = (rating) => {
    if (!rating) return null;
    // Convert 0-10 rating to 0-5 stars
    const stars = Math.round(rating / 2);
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < stars ? "text-yellow-400 fill-current" : "text-gray-300"} />
        ))}
      </div>
    );
  };

  const getFormatBadge = (format) => {
    switch (format) {
      case '4K UHD':
        return <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">4K UHD</span>;
      case 'BluRay':
        return <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">BluRay</span>;
      case 'DVD':
        return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">DVD</span>;
      default:
        return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">{format}</span>;
    }
  };

  const getEditionBadge = (edition) => {
    if (!edition) return null;
    return <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">{edition}</span>;
  };

  const getCollectionsForMedia = (mediaId) => {
    // This would normally fetch collections for a specific media item
    // For now, we'll just return an empty array as we don't have a dedicated endpoint
    return [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vidéo Folies</h1>
        </header>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPlus /> Ajouter
            </button>
            
            <button 
              onClick={() => setShowBoxSetManager(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaBook /> BoxSets
            </button>
            
            <button 
              onClick={() => setShowTvShowManager(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaTv /> Séries TV
            </button>
            
            <button 
              onClick={() => setShowSeasonManager(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaTv /> Saisons
            </button>
            
            <button 
              onClick={() => setShowCollectionManager(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaBook /> Collections
            </button>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaCog /> Paramètres
            </button>
            
            <button 
              onClick={() => setShowWishlist(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaHeart /> Liste de souhaits
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowOnlyMovies(!showOnlyMovies);
                  setShowOnlyTvShows(false);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${showOnlyMovies ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'}`}
              >
                Films
              </button>
              <button
                onClick={() => {
                  setShowOnlyTvShows(!showOnlyTvShows);
                  setShowOnlyMovies(false);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${showOnlyTvShows ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'}`}
              >
                Séries TV
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={exportData}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaDownload /> Exporter JSON
              </button>
              
              <button 
                onClick={() => exportToCsv()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaDownload /> Exporter CSV
              </button>
              
              <button 
                onClick={() => exportToPdf()}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaDownload /> Exporter PDF
              </button>
            </div>
            
            <label className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
              <FaUpload /> Importer
              <input 
                type="file" 
                accept=".json" 
                onChange={importData} 
                className="hidden" 
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {viewMode === 'grid' ? <FaTable /> : <FaTh />}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span>Filtres:</span>
            </div>
            
            <select 
              className="border border-gray-300 rounded-lg p-2"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="">Tous les formats</option>
              {formats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
            
            <select 
              className="border border-gray-300 rounded-lg p-2"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">Tous les genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            
            <select 
              className="border border-gray-300 rounded-lg p-2"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">Toutes les nationalités</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <select 
              className="border border-gray-300 rounded-lg p-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Toutes les années</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select 
              className="border border-gray-300 rounded-lg p-2"
              value={loanedFilter}
              onChange={(e) => setLoanedFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Empruntés</option>
              <option value="false">Disponibles</option>
            </select>
          </div>
        </div>

        {/* Media List */}
        {filteredMedias.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Aucun média trouvé</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedias.map(media => (
              <motion.div 
                key={media.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg truncate">{media.title}</h3>
                    <div className="flex gap-1">
                      {getFormatBadge(media.format)}
                      {getEditionBadge(media.edition)}
                      {media.isLoaned ? (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <FaLock /> Emprunté
                        </span>
                      ) : (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <FaUnlock /> Disponible
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    {media.coverImage ? (
                      <img 
                        src={media.coverImage} 
                        alt={media.title} 
                        className="w-full h-48 object-cover rounded"
                        onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center text-gray-500">
                        Pas d'image
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Année:</span> {media.releaseYear || '-'}</p>
                    <p><span className="font-semibold">Pays:</span> {media.country || '-'}</p>
                    <p><span className="font-semibold">Prix:</span> {media.price ? `${parseFloat(media.price).toFixed(2)} €` : '-'}</p>
                    <p><span className="font-semibold">Réalisateur:</span> {media.director || '-'}</p>
                    <p><span className="font-semibold">Genre:</span> {media.genre || '-'}</p>
                    <p><span className="font-semibold">Format:</span> {media.format || '-'}</p>
                    <p><span className="font-semibold">Édition:</span> {media.edition || '-'}</p>
                    {media.type === 'TV Show' && (
                      <p><span className="font-semibold">Nombre de saisons:</span> {media.seasonCount || 0}</p>
                    )}
                    {media.type === 'TV Show' && (
                      <p><span className="font-semibold">Total saisons prévues:</span> {media.totalSeasons || 0}</p>
                    )}
                    {media.rating && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Note:</span>
                        {getRatingStars(media.rating)}
                      </div>
                    )}
                    {media.pegiRating && (
                      <p><span className="font-semibold">PEGI:</span> {media.pegiRating}+</p>
                    )}
                    {media.customNotes && (
                      <p><span className="font-semibold">Notes:</span> {media.customNotes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Les collections sont gérées via les BoxSets
                    </p>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => toggleLoanStatus(media.id)}
                      className={`flex-1 py-1 rounded ${media.isLoaned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white text-sm`}
                    >
                      {media.isLoaned ? 'Marquer comme disponible' : 'Marquer comme emprunté'}
                    </button>
                    <button 
                      onClick={() => deleteMedia(media.id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réalisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Édition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collections</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedias.map(media => (
                  <tr key={media.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{media.title}</div>
                      <div className="text-sm text-gray-500">{media.ean13}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{media.releaseYear || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{media.country || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{media.price ? `${parseFloat(media.price).toFixed(2)} €` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{media.director || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{media.genre || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getFormatBadge(media.format)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {media.edition || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      BoxSets
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {media.isLoaned ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Emprunté
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Disponible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => toggleLoanStatus(media.id)}
                        className={`mr-2 ${media.isLoaned ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                      >
                        {media.isLoaned ? 'Disponible' : 'Emprunté'}
                      </button>
                      <button 
                        onClick={() => deleteMedia(media.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalItems > itemsPerPage && (
          <div className="mt-6 flex justify-center items-center gap-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Précédent
            </button>
            
            <span className="text-gray-700">
              Page {currentPage} sur {Math.ceil(totalItems / itemsPerPage)}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
              disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
              className={`px-4 py-2 rounded ${currentPage === Math.ceil(totalItems / itemsPerPage) ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Suivant
            </button>
            
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded p-2"
            >
              <option value="10">10 par page</option>
              <option value="20">20 par page</option>
              <option value="40">40 par page</option>
              <option value="100">100 par page</option>
            </select>
          </div>
        )}

        {/* Add Media Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Ajouter un nouveau média</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">EAN-13 *</label>
                        <input
                          type="text"
                          name="ean13"
                          value={formData.ean13}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            list="countries-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="countries-list">
                            {countries.map((country, index) => (
                              <option key={index} value={country} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Année de sortie</label>
                          <input
                            type="number"
                            name="releaseYear"
                            value={formData.releaseYear}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Note (1-5)</label>
                          <input
                            type="number"
                            name="rating"
                            min="1"
                            max="5"
                            value={formData.rating}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Réalisateur</label>
                        <input
                          type="text"
                          name="director"
                          value={formData.director}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <input
                          type="text"
                          name="genre"
                          value={formData.genre}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                        <select
                          name="format"
                          value={formData.format}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Sélectionner un format</option>
                          <option value="DVD">DVD</option>
                          <option value="BluRay">BluRay</option>
                          <option value="4K UHD">4K UHD</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Édition</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="edition"
                            value={formData.edition}
                            onChange={handleInputChange}
                            list="editions-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="editions-list">
                            <option value="Standard" />
                            <option value="Collector" />
                            <option value="Steelbook" />
                            <option value="Limited Edition" />
                            <option value="Special Edition" />
                            <option value="Deluxe Edition" />
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
                        <input
                          type="text"
                          name="coverImage"
                          value={formData.coverImage}
                          onChange={handleInputChange}
                          placeholder="URL de l'image"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isLoaned"
                          checked={formData.isLoaned}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Emprunté</label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            list="countries-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="countries-list">
                            {countries.map((country, index) => (
                              <option key={index} value={country} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            list="countries-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="countries-list">
                            {countries.map((country, index) => (
                              <option key={index} value={country} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Réalisateur</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="director"
                            value={formData.director}
                            onChange={handleInputChange}
                            list="directors-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="directors-list">
                            {directors.map((director, index) => (
                              <option key={index} value={director} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                            list="genres-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="genres-list">
                            {genres.map((genre, index) => (
                              <option key={index} value={genre} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (0-10)</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="rating"
                            min="0"
                            max="10"
                            value={formData.rating}
                            onChange={handleInputChange}
                            list="ratings-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="ratings-list">
                            {ratings.map((rating, index) => (
                              <option key={index} value={rating} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PEGI Rating</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="pegiRating"
                            min="0"
                            max="18"
                            value={formData.pegiRating}
                            onChange={handleInputChange}
                            list="pegi-ratings-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="pegi-ratings-list">
                            <option value="3" />
                            <option value="7" />
                            <option value="12" />
                            <option value="16" />
                            <option value="18" />
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes personnalisées</label>
                        <textarea
                          name="customNotes"
                          value={formData.customNotes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Ajouter
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BoxSet Manager Modal */}
        <AnimatePresence>
          {showBoxSetManager && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Gestion des BoxSets</h2>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Créer un nouveau BoxSet</h3>
                    <form onSubmit={handleBoxSetSubmit} className="flex gap-2">
                      <input
                        type="text"
                        name="name"
                        value={boxSetForm.name}
                        onChange={handleBoxSetInputChange}
                        placeholder="Nom du BoxSet"
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        name="description"
                        value={boxSetForm.description}
                        onChange={handleBoxSetInputChange}
                        placeholder="Description"
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        Créer
                      </button>
                    </form>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">BoxSets existants</h3>
                    {boxSets.length === 0 ? (
                      <p className="text-gray-500">Aucun BoxSet créé</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {boxSets.map(boxSet => (
                          <div key={boxSet.id} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-bold">{boxSet.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{boxSet.description || 'Aucune description'}</p>
                            <p className="text-sm text-gray-500">{boxSet.mediaItems?.length || 0} éléments</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowBoxSetManager(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Paramètres</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Éléments par page</label>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="6">6 par page</option>
                        <option value="12">12 par page</option>
                        <option value="24">24 par page</option>
                        <option value="48">48 par page</option>
                      </select>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-semibold mb-2">Statistiques</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Total médias</p>
                          <p className="text-xl font-bold">{stats.totalMedia || 0}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Empruntés</p>
                          <p className="text-xl font-bold">{stats.loanedMedia || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Formats</p>
                          <p className="text-xl font-bold">{stats.formats ? Object.keys(stats.formats).length : 0}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Genres</p>
                          <p className="text-xl font-bold">{stats.genres ? stats.genres.length : 0}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Répartition par année</h4>
                        {stats.years && Object.keys(stats.years).length > 0 ? (
                          <div className="max-h-40 overflow-y-auto">
                            {Object.entries(stats.years)
                              .sort(([a], [b]) => b - a)
                              .slice(0, 10)
                              .map(([year, count]) => (
                                <div key={year} className="flex justify-between text-sm">
                                  <span>{year}</span>
                                  <span>{count}</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Répartition par décennie</h4>
                        {stats.decades && Object.keys(stats.decades).length > 0 ? (
                          <div className="max-h-40 overflow-y-auto">
                            {Object.entries(stats.decades)
                              .sort(([a], [b]) => b - a)
                              .map(([decade, count]) => (
                                <div key={decade} className="flex justify-between text-sm">
                                  <span>{decade}s</span>
                                  <span>{count}</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Répartition par pays</h4>
                        {stats.countries && stats.countries.length > 0 ? (
                          <div className="max-h-40 overflow-y-auto">
                            {stats.countries.slice(0, 10).map((country, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{country}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* New Analytics Section */}
                  <div className="pt-4 border-t border-gray-200 mt-6">
                    <h3 className="font-semibold mb-2">Analyse Avancée</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Historique des Emprunts</h4>
                        <button 
                          onClick={() => setShowLoanHistory(true)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Voir l'historique
                        </button>
                      </div>
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Croissance de la Collection</h4>
                        <button 
                          onClick={() => setShowCollectionAnalytics(true)}
                          className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Voir les analyses
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Wishlist Modal */}
          <AnimatePresence>
            {showWishlist && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Liste de souhaits</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ajouter un média à la liste de souhaits</label>
                        <select
                          value={wishlistMediaId}
                          onChange={(e) => setWishlistMediaId(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Sélectionner un média</option>
                          {medias.filter(m => m.type === 'Movie' || m.type === 'TV Show').map(media => (
                            <option key={media.id} value={media.id}>
                              {media.title} ({media.type === 'Movie' ? 'Film' : 'Série TV'})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={addToWishlist}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Ajouter à la liste de souhaits
                        </button>
                        
                        <button
                          onClick={() => setShowWishlist(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-bold mb-2">Vos éléments de liste de souhaits</h3>
                      {wishlistItems.length === 0 ? (
                        <p className="text-gray-500">Votre liste de souhaits est vide.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {wishlistItems.map(item => (
                            <div key={item.id} className="border rounded p-2 flex justify-between items-center">
                              <div>
                                <span className="font-medium">{item.media.title}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({item.media.type === 'Movie' ? 'Film' : 'Série TV'})
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => markAsCompleted(item.id)}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                                >
                                  Terminé
                                </button>
                                <button
                                  onClick={() => removeFromWishlist(item.id)}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatePresence>

        {/* TV Show Manager Modal */}
        <AnimatePresence>
          {showTvShowManager && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Gestion des Séries TV</h2>
                  
                  <form onSubmit={handleTvShowSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">EAN-13 *</label>
                        <input
                          type="text"
                          name="ean13"
                          value={tvShowForm.ean13}
                          onChange={handleTvShowInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                        <input
                          type="text"
                          name="title"
                          value={tvShowForm.title}
                          onChange={handleTvShowInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Année de sortie</label>
                          <input
                            type="number"
                            name="releaseYear"
                            value={tvShowForm.releaseYear}
                            onChange={handleTvShowInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Note (0-10)</label>
                          <input
                            type="number"
                            name="rating"
                            min="0"
                            max="10"
                            value={tvShowForm.rating}
                            onChange={handleTvShowInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Réalisateur</label>
                        <input
                          type="text"
                          name="director"
                          value={tvShowForm.director}
                          onChange={handleTvShowInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <input
                          type="text"
                          name="genre"
                          value={tvShowForm.genre}
                          onChange={handleTvShowInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                        <select
                          name="format"
                          value={tvShowForm.format}
                          onChange={handleTvShowInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Sélectionner un format</option>
                          <option value="DVD">DVD</option>
                          <option value="BluRay">BluRay</option>
                          <option value="4K UHD">4K UHD</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Édition</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="edition"
                            value={tvShowForm.edition}
                            onChange={handleTvShowInputChange}
                            list="editions-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="editions-list">
                            <option value="Standard" />
                            <option value="Collector" />
                            <option value="Steelbook" />
                            <option value="Limited Edition" />
                            <option value="Special Edition" />
                            <option value="Deluxe Edition" />
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="country"
                            value={tvShowForm.country}
                            onChange={handleTvShowInputChange}
                            list="countries-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="countries-list">
                            {countries.map((country, index) => (
                              <option key={index} value={country} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
                        <input
                          type="text"
                          name="coverImage"
                          value={tvShowForm.coverImage}
                          onChange={handleTvShowInputChange}
                          placeholder="URL de l'image"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isLoaned"
                          checked={tvShowForm.isLoaned}
                          onChange={handleTvShowInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Emprunté</label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes personnalisées</label>
                        <textarea
                          name="customNotes"
                          value={tvShowForm.customNotes}
                          onChange={handleTvShowInputChange}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre total de saisons *</label>
                        <input
                          type="number"
                          name="totalSeasons"
                          value={tvShowForm.totalSeasons}
                          onChange={handleTvShowInputChange}
                          min="0"
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTvShowManager(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Créer la série TV
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Season Manager Modal */}
        <AnimatePresence>
          {showSeasonManager && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Gestion des Saisons</h2>
                  
                  <form onSubmit={handleSeasonSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">EAN-13 *</label>
                        <input
                          type="text"
                          name="ean13"
                          value={seasonForm.ean13}
                          onChange={handleSeasonInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                        <input
                          type="text"
                          name="title"
                          value={seasonForm.title}
                          onChange={handleSeasonInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Année de sortie</label>
                          <input
                            type="number"
                            name="releaseYear"
                            value={seasonForm.releaseYear}
                            onChange={handleSeasonInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Note (0-10)</label>
                          <input
                            type="number"
                            name="rating"
                            min="0"
                            max="10"
                            value={seasonForm.rating}
                            onChange={handleSeasonInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Série TV *</label>
                        <select
                          name="tvShowId"
                          value={seasonForm.tvShowId}
                          onChange={handleSeasonInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">Sélectionner une série TV</option>
                          {tvShows.map(tvShow => (
                            <option key={tvShow.id} value={tvShow.id}>{tvShow.title}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Réalisateur</label>
                        <input
                          type="text"
                          name="director"
                          value={seasonForm.director}
                          onChange={handleSeasonInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <input
                          type="text"
                          name="genre"
                          value={seasonForm.genre}
                          onChange={handleSeasonInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                        <select
                          name="format"
                          value={seasonForm.format}
                          onChange={handleSeasonInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Sélectionner un format</option>
                          <option value="DVD">DVD</option>
                          <option value="BluRay">BluRay</option>
                          <option value="4K UHD">4K UHD</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Édition</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="edition"
                            value={seasonForm.edition}
                            onChange={handleSeasonInputChange}
                            list="editions-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="editions-list">
                            <option value="Standard" />
                            <option value="Collector" />
                            <option value="Steelbook" />
                            <option value="Limited Edition" />
                            <option value="Special Edition" />
                            <option value="Deluxe Edition" />
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="country"
                            value={seasonForm.country}
                            onChange={handleSeasonInputChange}
                            list="countries-list"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                          <datalist id="countries-list">
                            {countries.map((country, index) => (
                              <option key={index} value={country} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
                        <input
                          type="text"
                          name="coverImage"
                          value={seasonForm.coverImage}
                          onChange={handleSeasonInputChange}
                          placeholder="URL de l'image"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isLoaned"
                          checked={seasonForm.isLoaned}
                          onChange={handleSeasonInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Emprunté</label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes personnalisées</label>
                        <textarea
                          name="customNotes"
                          value={seasonForm.customNotes}
                          onChange={handleSeasonInputChange}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSeasonManager(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Créer la saison
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaCollectionManager;
