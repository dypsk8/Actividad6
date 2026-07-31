import { createContext, useContext } from 'react';

// Contexto global para compartir el texto de búsqueda entre el header y las páginas
export const SearchContext = createContext({
  searchQuery: '',
  setSearchQuery: () => {},
});

// Hook de conveniencia para consumir el contexto sin importar useContext en cada componente
export const useSearch = () => useContext(SearchContext);
