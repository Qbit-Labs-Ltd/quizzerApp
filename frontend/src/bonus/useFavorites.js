import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'quiz_favorites';

/**
 * Custom hook for managing favorite quizzes using localStorage
 * @returns {Object} Object containing favorites array and methods to manage favorites
 */
export default function useFavorites() {
  // Initialize state from localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing favorites from localStorage:', error);
      return [];
    }
  });

  // Update localStorage when favorites change
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Add a quiz to favorites
  const addFavorite = useCallback((id) => {
    setFavorites((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  // Remove a quiz from favorites
  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((favId) => favId !== id));
  }, []);

  // Check if a quiz is favorited
  const isFavorite = useCallback((id) => {
    return favorites.includes(id);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((id) => {
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  };
}
