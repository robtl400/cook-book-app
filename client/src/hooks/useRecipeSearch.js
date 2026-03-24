import { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';

export function useRecipeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!query.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const data = await api.get(`/search/recipes?q=${encodeURIComponent(query)}`);
        setResults(data.slice(0, 8));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [query]);

  return [query, setQuery, results, setResults];
}
