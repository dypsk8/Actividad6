import React, { useState, useEffect } from 'react';
import { loansApi, usersApi, booksApi } from '../api/config';
import { Plus, BookOpenCheck, CheckCircle2, UserCircle2, BookCopy, CalendarDays, X, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useSearch } from '../context/SearchContext';
import TableSkeleton from '../components/TableSkeleton';

const LOAN_DAYS = 14; // Duración estándar del préstamo en días

// Calcula la fecha límite de devolución sumándole LOAN_DAYS a la fecha de préstamo
function getDueDate(loanDate) {
  const d = new Date(loanDate);
  d.setDate(d.getDate() + LOAN_DAYS);
  return d;
}

// Devuelve true si el préstamo está activo y ya superó la fecha límite
function isOverdue(loan) {
  if (loan.status !== 'ACTIVE') return false;
  return getDueDate(loan.loan_date) < new Date();
}

export default function LoansPage() {
  const { addToast } = useToast();
  const { searchQuery } = useSearch();

  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmReturnId, setConfirmReturnId] = useState(null);

  const [formData, setFormData] = useState({ user_id: '', book_id: '' });
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Carga paralela: préstamos, usuarios y libros para resolver nombres/títulos en el frontend
      const [loansRes, usersRes, booksRes] = await Promise.all([
        loansApi.get('/loans'),
        usersApi.get('/users'),
        booksApi.get('/books')
      ]);
      setLoans(loansRes.data);
      setUsers(usersRes.data);
      setBooks(booksRes.data);
    } catch (err) {
      console.error(err);
      addToast('Error al cargar los datos de préstamos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await loansApi.post('/loans', formData);
      setFormData({ user_id: '', book_id: '' });
      setShowForm(false);
      addToast('Préstamo registrado correctamente', 'success');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al registrar préstamo');
    }
  };

  const handleReturn = async (id) => {
    try {
      await loansApi.put(`/loans/${id}/return`);
      setConfirmReturnId(null);
      addToast('Devolución procesada correctamente', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al procesar devolución', 'error');
      setConfirmReturnId(null);
    }
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : `Lector #${id}`;
  };

  const getBookTitle = (id) => {
    const book = books.find(b => b.id === id);
    return book ? book.title : `Obra #${id}`;
  };

  // Filtrado por búsqueda
  const filteredLoans = loans.filter(loan => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return getUserName(loan.user_id).toLowerCase().includes(q)
      || getBookTitle(loan.book_id).toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title logo-font">Registro de Préstamos</h1>
          <p className="page-description">
            {searchQuery
              ? `${filteredLoans.length} resultado(s) para "${searchQuery}"`
              : 'Gestiona los préstamos y devoluciones en curso.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Nuevo Préstamo
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Generar Ficha de Préstamo
          </h2>
          {formError && (
            <div style={{ color: 'var(--status-overdue)', marginBottom: '16px', fontSize: '14px', padding: '12px', background: '#FFCDD2', borderRadius: '8px' }}>
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid-layout">
              <div className="input-group">
                <label>Lector Solicitante</label>
                <div className="input-container">
                  <UserCircle2 className="input-icon" size={18} />
                  <select className="input-field with-icon" required
                    value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})}>
                    <option value="">Seleccione un lector...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Obra Solicitada (Solo Disponibles)</label>
                <div className="input-container">
                  <BookCopy className="input-icon" size={18} />
                  <select className="input-field with-icon" required
                    value={formData.book_id} onChange={e => setFormData({...formData, book_id: e.target.value})}>
                    <option value="">Seleccione una obra...</option>
                    {books.filter(b => b.is_available).map(book => (
                      <option key={book.id} value={book.id}>{book.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-success">Autorizar Préstamo</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : filteredLoans.length === 0 ? (
          <div className="empty-state">
            <BookOpenCheck size={48} style={{ margin: '0 auto 16px', color: 'var(--border-color)' }} />
            <p>{searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay registro de préstamos activos ni históricos'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lector</th>
                <th>Obra</th>
                <th>Autorización</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map(loan => {
                const overdue = isOverdue(loan);
                const dueDate = getDueDate(loan.loan_date);

                return (
                  <tr key={loan.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                        <UserCircle2 size={16} color="var(--text-secondary)" />
                        {getUserName(loan.user_id)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 500 }}>
                        <BookCopy size={16} />
                        {getBookTitle(loan.book_id)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <CalendarDays size={14} />
                        {new Date(loan.loan_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {loan.status === 'ACTIVE' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {overdue && <AlertTriangle size={14} color="var(--status-overdue)" />}
                          <span style={{
                            fontSize: '13px',
                            fontWeight: overdue ? 600 : 400,
                            color: overdue ? 'var(--status-overdue)' : 'var(--text-secondary)'
                          }}>
                            {overdue ? 'Vencido' : dueDate.toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${loan.status === 'ACTIVE' ? (overdue ? 'status-overdue' : 'status-borrowed') : 'status-available'}`}>
                        {loan.status === 'ACTIVE' ? (overdue ? 'Vencido' : 'Prestado') : 'Devuelto'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {loan.status === 'ACTIVE' ? (
                        confirmReturnId === loan.id ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>¿Confirmar?</span>
                            <button className="btn-icon success" title="Confirmar devolución" onClick={() => handleReturn(loan.id)}>
                              <Check size={16} />
                            </button>
                            <button className="btn-icon danger" title="Cancelar" onClick={() => setConfirmReturnId(null)}>
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '13px' }}
                            onClick={() => setConfirmReturnId(loan.id)} title="Marcar como devuelto">
                            <CheckCircle2 size={16} /> Devolver
                          </button>
                        )
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Completado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
