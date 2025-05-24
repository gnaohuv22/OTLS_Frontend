/**
 * Client-side favorites management using local storage
 */

// Key used for storing favorites in localStorage
const FAVORITES_STORAGE_KEY = 'otls_resource_favorites';

/**
 * Favorites manager for client-side favorite management
 */
export const FavoritesManager = {
  /**
   * Get all favorite resource IDs for the current user
   * @param userId The current user's ID
   * @returns Array of resource IDs marked as favorites
   */
  getFavorites: (userId: string): string[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      // Get stored favorites
      const storedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!storedData) return [];
      
      // Parse stored data
      const allUserFavorites = JSON.parse(storedData);
      
      // Return the current user's favorites or empty array
      return Array.isArray(allUserFavorites[userId]) ? allUserFavorites[userId] : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },
  
  /**
   * Check if a resource is marked as favorite by the current user
   * @param userId The current user's ID
   * @param resourceId The resource ID to check
   * @returns boolean indicating if the resource is a favorite
   */
  isFavorite: (userId: string, resourceId: string): boolean => {
    const userFavorites = FavoritesManager.getFavorites(userId);
    return userFavorites.includes(resourceId);
  },
  
  /**
   * Toggle favorite status for a resource
   * @param userId The current user's ID
   * @param resourceId The resource ID to toggle
   * @returns boolean indicating the new favorite status
   */
  toggleFavorite: (userId: string, resourceId: string): boolean => {
    if (typeof window === 'undefined') return false;
    if (!userId) return false;
    
    try {
      // Get stored favorites for all users
      const storedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const allUserFavorites = storedData ? JSON.parse(storedData) : {};
      
      // Get current user's favorites or initialize empty array
      const userFavorites = Array.isArray(allUserFavorites[userId]) ? 
        allUserFavorites[userId] : [];
      
      // Check if resource is already a favorite
      const index = userFavorites.indexOf(resourceId);
      
      // Toggle favorite status
      if (index >= 0) {
        // Remove from favorites
        userFavorites.splice(index, 1);
        allUserFavorites[userId] = userFavorites;
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allUserFavorites));
        return false;
      } else {
        // Add to favorites
        userFavorites.push(resourceId);
        allUserFavorites[userId] = userFavorites;
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allUserFavorites));
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },
  
  /**
   * Update resource objects with favorite status
   * @param userId The current user's ID
   * @param resources Array of resource objects
   * @returns Resources with isFavorite property added
   */
  markFavorites: <T extends { id: string }>(userId: string, resources: T[]): (T & { isFavorite: boolean })[] => {
    if (!userId || !resources.length) {
      return resources.map(r => ({ ...r, isFavorite: false }));
    }
    
    const favorites = FavoritesManager.getFavorites(userId);
    
    return resources.map(resource => ({
      ...resource,
      isFavorite: favorites.includes(resource.id)
    }));
  },
  
  /**
   * Clear all favorites for the current user
   * @param userId The current user's ID
   */
  clearFavorites: (userId: string): void => {
    if (typeof window === 'undefined') return;
    if (!userId) return;
    
    try {
      const storedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!storedData) return;
      
      const allUserFavorites = JSON.parse(storedData);
      
      // Clear user's favorites
      allUserFavorites[userId] = [];
      
      // Save updated data
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allUserFavorites));
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  }
}; 