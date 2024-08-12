import './App.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import { Card, CardContent, CardMedia, TextField, Dialog, DialogTitle, DialogContent, Box, Container, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';
import { setMovies, appendMovies, setLoading, setQuery, setPage, setDebouncedQuery, setSelectedMovie, setModalOpen, incrementPage } from './redux/movieSlice';
import Logo from './assets/icon/LogoLawen.jpeg';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
function App() {
  const [noSoal, setNoSoal] = useState(2);
  const [detail, setDetails] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [dataHeader, setDataHeader] = useState([]);

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
  // console.log(grouped);

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

  useEffect(() => {
    // Fungsi async untuk melakukan fetch data
    const fetchData = async () => {
        try {
            const response = await axios.get('http://www.omdbapi.com/?apikey=faf7e5bb&i=tt1877830');
            setDataHeader(response.data);
          } catch (error) {
            console.error('Error fetching movies:', error);
          } finally {
            dispatch(setLoading(false));
          }
    };

    fetchData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  // console.log("dataHeader",dataHeader);
  const handleClickOpen = (movie) => {
    dispatch(setSelectedMovie(movie));
    dispatch(setModalOpen(true));
  };

  const handleClose = () => {
    dispatch(setModalOpen(false));
    dispatch(setSelectedMovie(null));
  };

  const handleSoal = (value) => {
    setNoSoal(value);
  }

  const handleDetails = async (imdbID) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get(
        `http://www.omdbapi.com/?apikey=faf7e5bb&i=${imdbID}`
      );
      const valDetails = response.data || {};
      setDetails(valDetails);
      setShowDetail(true); // Menampilkan view detail
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleBack = () => {
    setShowDetail(false); // Menampilkan view list
  };

  const ViewDetails = () => {
    if (!detail || Object.keys(detail).length === 0) {
      return null;
    } else {
      // const opts = {
      //   height: '390',
      //   width: '640',
      //   playerVars: {
      //     autoplay: 0,
      //   },
      // };
      return (
        <div className="px-4 py-20">
          <Button 
            onClick={handleBack} 
            variant="contained" 
            color="primary" 
            style={{ marginTop: '20px', marginBottom:'15px' }}
          >
            Kembali
          </Button>
          <Card style={{ borderRadius: '12px', position: 'relative' }}>
            <CardContent>
              <h1>{detail.Title}</h1>
              <div className="flex">
                <div className="relative">
                  <img className="w-32 h-48" src={detail.Poster} alt={detail.Title} />
                  <div className="absolute inset-0 flex items-center justify-center">
                  <PlayArrowIcon 
                    style={{ 
                      fontSize: '48px', 
                      color: 'white', 
                      backgroundColor: 'rgba(0,0,0,0.5)', 
                      borderRadius: '50%', 
                      cursor: 'pointer' // Tambahkan kursor tangan di sini
                    }} 
                  />
                  </div>
                </div>
                <div className="ml-4">
                  <h2>{detail.Genre}</h2>
                  <p><strong>Plot:</strong> {detail.Plot}</p>
                  <p><strong>Director:</strong> {detail.Director}</p>
                  <p><strong>Actors:</strong> {detail.Actors}</p>
                  <p><strong>Released:</strong> {detail.Released}</p>
                  <p><strong>IMDB Rating:</strong> {detail.imdbRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

  };

  const Navbar = () => (
    <div className="fixed top-0 left-0 w-full h-16 bg-[#000000] text-white flex items-center justify-between px-6 shadow-md z-50">
      <img
        src={Logo}
        alt="Lawencon Logo"
        className="h-10 text-white  "
      />
      
      <div className="hidden md:flex space-x-8">
        <a href="#home" onClick={() => handleSoal(1)} className="hover:underline">Soal 1</a>
        <a onClick={() => handleSoal(2)} className="hover:underline">Soal 2</a>
        <a href="#films" className="hover:underline">Films</a>
        <a href="#new" className="hover:underline">New & Popular</a>
        {/* <a href="#mylist" className="hover:underline">My List</a> */}
      </div>
      {/* <div className="h-10 w-10 bg-cover bg-center rounded-full bg-gray-500" style={{ backgroundImage: "url('https://your-image-url.com')" }} /> */}
    </div>
  );
  const ListView = () => {
    if (movies && movies.length > 0 ) {
      return (
        <div className="bg-[#505050] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-5 gap-5 px-4 py-4">
          {movies.map((movie, index) => (
            <Card
              ref={movies.length === index + 1 ? lastMovieElementRef : null}
              key={index}
              sx={{ maxWidth: 180, borderRadius: "12px", display: 'flex', flexDirection: 'column' }}
            >
              <CardMedia
                component="img"
                alt={movie?.Title}
                height="80"
                width="180"
                image={movie?.Poster}
                onClick={() => handleClickOpen(movie)}
              />
              <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography gutterBottom variant="h6" component="div" style={{ textAlign: "left" }}>
                  {movie?.Title}
                </Typography>
                <div style={{ marginTop: 'auto' }}>
                  <h3 className='text-[#AFB1B6]'>Genre: {movie?.Type}</h3>
                  <h4 className='text-[#AFB1B6]'>Tahun: {movie?.Year}</h4>
                  <Button variant="outlined" onClick={() => handleDetails(movie?.imdbID)}>Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {loading && <div>Loading more movies...</div>}
        </div>
      )
    } else {return null}
  };

  const Footer = () => {
    return (
      <Box
        component="footer"
        sx={{
          py: 4,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src={Logo}
                  alt="PT.Lawencon"
                  sx={{ height: 100, borderRadius: '12px', backgroundColor: '#000' }}
                />
                <Typography variant="h6">PT.Lawencon</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h6" gutterBottom>
                Program Kami
              </Typography>
              <Typography>BatDev Talks</Typography>
              <Typography>BatDev Short Course</Typography>
              <Typography>BatDev Bootcamp</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Typography>BatDev Community</Typography>
              <Typography>About Us</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h6" gutterBottom>
                Sosial Media
              </Typography>
              <Typography>LinkedIn</Typography>
              <Typography>Instagram</Typography>
              <Typography>Facebook</Typography>
              <Typography>Youtube</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    )
  };
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      {noSoal === 1 ? (
        <div className='px-4 py-4 mt-14'>
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
      ) : noSoal === 2 && detail.length == 0 ? (
        <div className="w-full h-[400px] mt-10 relative">
          <div className="absolute inset-0  pt-6">
            <img
              src={dataHeader?.Poster}
              alt="Poster"
              className="w-full h-full object-cover"
            />
          </div>
          <div className=" inset-0 flex justify-end px-5 py-10">
            <TextField
              id="filled-search"
              label="Masukan Judul Film"
              type="text"
              variant="filled"
              onChange={handleSearch}
              value={query}
              style={{backgroundColor:'#E1E1E2', borderRadius:'12px'}}
            />
          </div>
        </div>
      ) : <p>No content available</p>}
      {/* <ListView />

      <ViewDetails /> */}

      {/* Render ListView atau ViewDetails berdasarkan state showDetail */}
      {showDetail ? <ViewDetails /> : <ListView />}
      
      {/* Modal untuk menampilkan poster film */}
      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle>{selectedMovie?.Title}</DialogTitle>
        <DialogContent>
          <img src={selectedMovie?.Poster} alt={selectedMovie?.Title} style={{ width: '100%' }} />
        </DialogContent>
      </Dialog>

      <Footer />
    </Box>
  );
}

export default App;