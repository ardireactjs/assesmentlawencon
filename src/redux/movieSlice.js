import { createSlice } from '@reduxjs/toolkit';

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    list: [],
    loading: false,
    query: '',
    debouncedQuery: '',
    page: 1,
    selectedMovie: null,
    modalOpen: false,
  },
  reducers: {
    setMovies(state, action) {
      state.list = action.payload;
    },
    appendMovies(state, action) {
      state.list = [...state.list, ...action.payload];
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
    setDebouncedQuery(state, action) {
      state.debouncedQuery = action.payload;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setSelectedMovie(state, action) {
      state.selectedMovie = action.payload;
    },
    setModalOpen(state, action) {
      state.modalOpen = action.payload;
    },
  },
});

export const {
  setMovies,
  appendMovies,
  setLoading,
  setQuery,
  setPage,
  setDebouncedQuery,
  setSelectedMovie,
  setModalOpen,
} = movieSlice.actions;

export default movieSlice.reducer;

// Thunk for incrementing page
export const incrementPage = () => (dispatch, getState) => {
  const state = getState();
  const newPage = state.movies.page + 1;
  dispatch(setPage(newPage));
};
