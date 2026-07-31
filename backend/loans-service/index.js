const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3001';
const BOOKS_SERVICE_URL = process.env.BOOKS_SERVICE_URL || 'http://localhost:3002';

/**
 * @route   GET /loans
 * @desc    Obtener historial de préstamos
 */
app.get('/loans', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM loans ORDER BY loan_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   POST /loans
 * @desc    Registrar un nuevo préstamo
 */
app.post('/loans', async (req, res) => {
  try {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
      return res.status(400).json({ error: 'user_id y book_id son obligatorios' });
    }

    // 1. Validar que el usuario existe (Comunicación con el Microservicio de Usuarios)
    try {
      await axios.get(`${USERS_SERVICE_URL}/users/${user_id}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ error: 'Usuario no encontrado en el sistema' });
      }
      console.error('Error contactando MS Usuarios:', err.message);
      return res.status(500).json({ error: 'Error de comunicación con el servicio de usuarios' });
    }

    // 2. Validar que el libro existe y está disponible (Comunicación con el Microservicio de Libros)
    let book;
    try {
      const response = await axios.get(`${BOOKS_SERVICE_URL}/books/${book_id}`);
      book = response.data;
      if (!book.is_available) {
        return res.status(400).json({ error: 'El libro no está disponible actualmente' });
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ error: 'Libro no encontrado en el sistema' });
      }
      console.error('Error contactando MS Libros:', err.message);
      return res.status(500).json({ error: 'Error de comunicación con el servicio de libros' });
    }

    // 3. Registrar el préstamo
    const loanResult = await pool.query(
      'INSERT INTO loans (user_id, book_id) VALUES ($1, $2) RETURNING *',
      [user_id, book_id]
    );

    // 4. Actualizar el estado del libro a "no disponible" (Comunicación con el Microservicio de Libros)
    try {
      await axios.put(`${BOOKS_SERVICE_URL}/books/${book_id}/status`, { is_available: false });
    } catch (err) {
      console.error('Error al actualizar disponibilidad del libro, revirtiendo préstamo:', err.message);
      // Compensación: revertir el préstamo creado para evitar inconsistencia de datos
      try {
        await pool.query('DELETE FROM loans WHERE id = $1', [loanResult.rows[0].id]);
      } catch (rollbackErr) {
        console.error('Error crítico al revertir préstamo:', rollbackErr.message);
      }
      return res.status(500).json({ error: 'Error al actualizar disponibilidad del libro. El préstamo fue cancelado.' });
    }

    res.status(201).json(loanResult.rows[0]);
  } catch (error) {
    console.error('Error al registrar préstamo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   PUT /loans/:id/return
 * @desc    Registrar la devolución de un libro
 */
app.put('/loans/:id/return', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el préstamo
    const loanQuery = await pool.query('SELECT * FROM loans WHERE id = $1', [id]);
    if (loanQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    const loan = loanQuery.rows[0];
    if (loan.status === 'RETURNED') {
      return res.status(400).json({ error: 'Este libro ya fue devuelto' });
    }

    // Actualizar el estado del préstamo
    const updatedLoan = await pool.query(
      "UPDATE loans SET status = 'RETURNED', return_date = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    // Actualizar el estado del libro a "disponible"
    try {
      await axios.put(`${BOOKS_SERVICE_URL}/books/${loan.book_id}/status`, { is_available: true });
    } catch (err) {
      console.error('Error al actualizar disponibilidad del libro:', err.message);
    }

    res.json(updatedLoan.rows[0]);
  } catch (error) {
    console.error('Error al procesar devolución:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🤝 Loans Service corriendo en el puerto ${PORT}`);
});
