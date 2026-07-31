import axios from 'axios';

// Una instancia de Axios por microservicio; cada una apunta a su puerto dedicado
export const usersApi = axios.create({
  baseURL: 'http://localhost:3001' // Microservicio de usuarios
});

export const booksApi = axios.create({
  baseURL: 'http://localhost:3002' // Microservicio de libros
});

export const loansApi = axios.create({
  baseURL: 'http://localhost:3003' // Microservicio de préstamos
});
