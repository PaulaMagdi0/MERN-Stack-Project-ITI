import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchBooks } from '../../store/bookSlice';
import { debounce } from 'lodash';
import { 
  TextField, 
  InputAdornment, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  CircularProgress,
  Typography,
  IconButton,
  Collapse,
  Grow
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { searchResults, searchLoading, error } = useSelector((state) => state.book || {});
  const searchContainerRef = useRef(null);

  // Debounce function remains the same
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.length > 2) {
        dispatch(searchBooks(searchQuery));
      }
    }, 300),
    [dispatch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleBookSelect = (bookId) => {
    navigate(`/books/${bookId}`);
    setIsExpanded(false);
  };

  const handleToggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) setTimeout(() => document.querySelector('#search-input')?.focus(), 10);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsExpanded(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchContainerRef} style={{ position: 'relative', width: 'auto' }}>
      {/* Search Toggle Button */}
      <IconButton 
        onClick={handleToggleSearch}
        sx={{ 
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `scale(${isExpanded ? 0 : 1})`,
          opacity: isExpanded ? 0 : 1,
          position: 'absolute',
          right: 8,
          zIndex: 1
        }}
      >
        <SearchIcon />
      </IconButton>

      {/* Search Input Field */}
      <Collapse 
        in={isExpanded}
        orientation="horizontal"
        sx={{
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <TextField
          id="search-input"
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          // onBlur={() => setIsFocused(false)}
          placeholder="Search books..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            backgroundColor: 'white',
            borderRadius: '4px',
            width: 300,
            '& .MuiOutlinedInput-root': {
              pr: 1,
              transition: 'all 0.3s ease',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setIsExpanded(false)}
                  sx={{ p: 0.5, transition: 'transform 0.3s ease' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Collapse>

      {/* Search Results Dropdown */}
      <Grow in={query.length > 0 && isExpanded}>
        <Paper
          sx={{
            position: 'absolute',
            width: 300,
            maxHeight: 300,
            overflow: 'auto',
            zIndex: 9999,
            mt: 1,
            boxShadow: 3,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <List dense>
            {error ? (
              <ListItem>
                <ListItemText 
                  primary="Error loading results" 
                  secondary={import.meta.env.MODE === 'development' ? error : ''}
                />
              </ListItem>
            ) : searchLoading ? (
              <ListItem>
                <CircularProgress size={20} sx={{ mr: 2 }} />
                <Typography>Loading...</Typography>
              </ListItem>
            ) : searchResults?.length > 0 ? (
              searchResults.map((book) => (
                <ListItem
                  key={book._id}
                  onClick={() => handleBookSelect(book._id)}
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <ListItemText
                    primary={<Typography noWrap>{book.title || 'Untitled Book'}</Typography>}
                    secondary={<Typography noWrap>{book.author_id?.name || 'Unknown Author'}</Typography>}
                    sx={{ transition: 'opacity 0.2s ease' }}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No books found" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grow>
    </div>
  );
};

export default SearchBar;