const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

/**
 * @route   GET /users
 * @desc    Obtener todos los usuarios registrados
 */
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   GET /users/:id
 * @desc    Obtener un usuario por ID (Usado para validación por el MS de Préstamos)
 */
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   POST /users
 * @desc    Registrar un nuevo usuario
 */
app.post('/users', async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    
    // Validación básica
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Insertar el nuevo usuario en la base de datos
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING *',
      [first_name, last_name, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    // Si el error es por duplicidad de email (código 23505 en PostgreSQL)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   PUT /users/:id
 * @desc    Actualizar los datos de un usuario
 */
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING *',
      [first_name, last_name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El email ya está registrado por otro usuario' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   DELETE /users/:id
 * @desc    Eliminar un usuario del sistema
 */
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Users Service corriendo en el puerto ${PORT}`);
});
