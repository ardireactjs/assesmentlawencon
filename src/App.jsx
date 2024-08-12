import './App.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Card, CardContent, CardMedia, TextField, Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setMovies, appendMovies, setLoading, setQuery, setPage, setDebouncedQuery, setSelectedMovie, setModalOpen, incrementPage } from './redux/movieSlice';

function App() {
  const [noSoal, setNoSoal] = useState(1);

  /*function soal no 1*/
  function groupAnagrams(words) {
    var groupedAnagrams = [];  // Array untuk menyimpan grup anagram yang ditemukan

    function getCharCount(word) {
        var charCount = {};  // Objek untuk menghitung frekuensi karakter
        for (var i = 0; i < word.length; i++) {
            var char = word[i];
            if (charCount[char]) {
                charCount[char]++;
            } else {
                charCount[char] = 1;
            }
        }
        return charCount;
    }

    function isSameCharCount(count1, count2) {
        for (var char in count1) {
            if (count1[char] !== count2[char]) {
                return false;
            }
        }

        for (var CountChar in count2) {
            if (count1[CountChar] !== count2[CountChar]) {
                return false;
            }
        }

        return true;
    }

    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var charCount = getCharCount(word);  // Dapatkan frekuensi karakter kata ini
        var found = false;

        // Cek apakah kata ini bisa dimasukkan ke grup anagram yang sudah ada
        for (var j = 0; j < groupedAnagrams.length; j++) {
            if (isSameCharCount(groupedAnagrams[j].charCount, charCount)) {
                groupedAnagrams[j].words.push(word);
                found = true;
                break;
            }
        }

        // Jika tidak ada grup yang cocok, buat grup baru
        if (!found) {
            groupedAnagrams.push({ words: [word], charCount: charCount });
        }
    }

    // Konversi objek grup anagram menjadi array array
    var result = [];
    for (var ik = 0; ik < groupedAnagrams.length; ik++) {
        result.push(groupedAnagrams[ik].words);
    }

    return result;
  }

  var words = ['kita', 'atik', 'tika', 'aku', 'kia', 'makan', 'kua'];
  var grouped = groupAnagrams(words);
  console.log(grouped);

  /*end function soal no 1*/

  const dispatch = useDispatch();
  const movies = useSelector(state => state.movies.list);
  const loading = useSelector(state => state.movies.loading);
  const query = useSelector(state => state.movies.query);
  const debouncedQuery = useSelector(state => state.movies.debouncedQuery);
  const page = useSelector(state => state.movies.page);
  const selectedMovie = useSelector(state => state.movies.selectedMovie);
  const modalOpen = useSelector(state => state.movies.modalOpen);
  
  const observer = useRef();

  const fetchMovies = async (searchQuery, pageNumber) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get(
        `http://www.omdbapi.com?apikey=faf7e5bb&s=${searchQuery}&page=${pageNumber}`
      );
      const validMovies = response.data.Search?.filter(movie => movie && movie.Title) || [];
      if (pageNumber === 1) {
        dispatch(setMovies(validMovies));
      } else {
        dispatch(appendMovies(validMovies));
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    dispatch(setQuery(value));
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setDebouncedQuery(query));
    }, 2000);
    return () => {
      clearTimeout(handler);
    };
  }, [query, dispatch]);

  useEffect(() => {
    if (debouncedQuery) {
      dispatch(setPage(1));
      dispatch(setMovies([]));
      fetchMovies(debouncedQuery, 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, dispatch]);

  const lastMovieElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && debouncedQuery) {
        dispatch(incrementPage());
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, debouncedQuery, dispatch]);

  useEffect(() => {
    if (page > 1) {
      fetchMovies(debouncedQuery, page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery, dispatch]);

  const handleClickOpen = (movie) => {
    dispatch(setSelectedMovie(movie));
    dispatch(setModalOpen(true));
  };

  const handleClose = () => {
    dispatch(setModalOpen(false));
    dispatch(setSelectedMovie(null));
  };

  const handleSoal = (value) => {
    // console.log("value::",value);
    setNoSoal(value);
  }

  const Navbar = () => (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Movies Lawencon
          </Typography>
          <Button onClick={() => handleSoal(1)} color="inherit">Soal 1</Button>
          <Button onClick={() => handleSoal(2)} color="inherit">Soal 2</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );

  const ListView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-5 gap-5 px-4 py-4">
      {movies.map((movie, index) => (
        <Card
          ref={movies.length === index + 1 ? lastMovieElementRef : null}
          key={index}
          sx={{ maxWidth: 180 }}
          onClick={() => handleClickOpen(movie)}
        >
          <CardMedia
            component="img"
            alt={movie?.Title}
            height="100"
            width="180"
            image={movie?.Poster}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div" style={{ textAlign: "center" }}>
              {movie?.Title}
            </Typography>
          </CardContent>
        </Card>
      ))}
      {loading && <div>Loading more movies...</div>}
    </div>
  );
  return (
    <>
      <Navbar />
      {noSoal === 1 ? (
        <div className='px-4 py-4'>
          <h1>Datanya :{words && words?.join(", ")}</h1>
          <h1 className="pt-5">Hasilnya :</h1>
          <ul>
            {grouped?.map((group, index) => (
              <li key={index}>
                . {group?.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      ) : noSoal === 2 ? (
        <div className="pt-5 px-5 text-right">
          <TextField
            id="filled-search"
            label="Search field"
            type="text"
            variant="filled"
            onChange={handleSearch}
            value={query}
          />
        </div>
      ) : <p>No content available</p>}
      <ListView />
      
      {/* Modal untuk menampilkan poster film */}
      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle>{selectedMovie?.Title}</DialogTitle>
        <DialogContent>
          <img src={selectedMovie?.Poster} alt={selectedMovie?.Title} style={{ width: '100%' }} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;