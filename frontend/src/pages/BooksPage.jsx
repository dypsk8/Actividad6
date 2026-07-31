import React, { useState, useEffect } from 'react';
import { booksApi } from '../api/config';
import { Plus, BookOpen, BookCopy, UserCircle2, Pencil, Trash2, X, Check } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useSearch } from '../context/SearchContext';
import TableSkeleton from '../components/TableSkeleton';

export default function BooksPage() {
  const { addToast } = useToast();
  const { searchQuery } = useSearch();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [formData, setFormData] = useState({ title: '', author: '' });
  const [formError, setFormError] = useState('');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await booksApi.get('/books');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      addToast('Error al cargar el catálogo de libros', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const openCreateForm = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (book) => {
    setEditingBook(book);
    setFormData({ title: book.title, author: book.author });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormData({ title: '', author: '' });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingBook) {
        await booksApi.put(`/books/${editingBook.id}`, formData);
        addToast(`"${formData.title}" actualizado correctamente`, 'success');
      } else {
        await booksApi.post('/books', formData);
        addToast(`"${formData.title}" registrado en el catálogo`, 'success');
      }
      closeForm();
      fetchBooks();
    } catch (err) {
      setFormError(err.response?.data?.error || (editingBook ? 'Error al editar libro' : 'Error al registrar libro'));
    }
  };

  const handleDelete = async (book) => {
    try {
      await booksApi.delete(`/books/${book.id}`);
      setConfirmDeleteId(null);
      addToast(`"${book.title}" eliminado del catálogo`, 'success');
      fetchBooks();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al eliminar el libro', 'error');
      setConfirmDeleteId(null);
    }
  };

  // Filtrado por búsqueda
  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title logo-font">Catálogo de Libros</h1>
          <p className="page-description">
            {searchQuery
              ? `${filteredBooks.length} resultado(s) para "${searchQuery}"`
              : 'Administra el inventario de la biblioteca.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          <Plus size={18} /> Nuevo Libro
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {editingBook ? 'Editar Libro' : 'Registrar Libro'}
          </h2>
          {formError && (
            <div style={{ color: 'var(--status-overdue)', marginBottom: '16px', fontSize: '14px', padding: '12px', background: '#FFCDD2', borderRadius: '8px' }}>
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid-layout">
              <div className="input-group">
                <label>Título de la Obra</label>
                <div className="input-container">
                  <BookOpen className="input-icon" size={18} />
                  <input type="text" className="input-field with-icon" placeholder="Ej. Cien Años de Soledad"
                    required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Autor</label>
                <div className="input-container">
                  <UserCircle2 className="input-icon" size={18} />
                  <input type="text" className="input-field with-icon" placeholder="Ej. Gabriel García Márquez"
                    required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancelar</button>
              <button type="submit" className="btn btn-success">{editingBook ? 'Guardar Cambios' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} style={{ margin: '0 auto 16px', color: 'var(--border-color)' }} />
            <p>{searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay obras registradas en el catálogo'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título de la Obra</th>
                <th>Autor</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr key={book.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <BookCopy size={18} color="var(--primary-color)" />
                      <span style={{ fontWeight: 500 }}>{book.title}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{book.author}</td>
                  <td>
                    <span className={`status-badge ${book.is_available ? 'status-available' : 'status-borrowed'}`}>
                      {book.is_available ? 'Disponible' : 'Prestado'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {confirmDeleteId === book.id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>¿Eliminar?</span>
                        <button className="btn-icon success" title="Confirmar" onClick={() => handleDelete(book)}>
                          <Check size={16} />
                        </button>
                        <button className="btn-icon danger" title="Cancelar" onClick={() => setConfirmDeleteId(null)}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" title="Editar" onClick={() => openEditForm(book)}>
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon danger" title="Eliminar" onClick={() => setConfirmDeleteId(book.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
