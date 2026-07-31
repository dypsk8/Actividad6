const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

/**
 * @route   GET /books
 * @desc    Obtener todos los libros
 */
app.get('/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   GET /books/:id
 * @desc    Obtener un libro por ID (Usado para validación por el MS de Préstamos)
 */
app.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   POST /books
 * @desc    Registrar un nuevo libro
 */
app.post('/books', async (req, res) => {
  try {
    const { title, author } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ error: 'Título y autor son obligatorios' });
    }

    const result = await pool.query(
      'INSERT INTO books (title, author) VALUES ($1, $2) RETURNING *',
      [title, author]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar libro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   PUT /books/:id/status
 * @desc    Actualizar el estado de disponibilidad de un libro (Llamado por el MS de Préstamos)
 */
app.put('/books/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    if (typeof is_available !== 'boolean') {
      return res.status(400).json({ error: 'El estado is_available es requerido y debe ser booleano' });
    }

    const result = await pool.query(
      'UPDATE books SET is_available = $1 WHERE id = $2 RETURNING *',
      [is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   PUT /books/:id
 * @desc    Actualizar título y autor de un libro
 */
app.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Título y autor son obligatorios' });
    }

    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *',
      [title, author, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   DELETE /books/:id
 * @desc    Eliminar un libro del catálogo
 */
app.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM books WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json({ message: 'Libro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`📚 Books Service corriendo en el puerto ${PORT}`);
});
