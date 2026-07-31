import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/config';
import { Plus, UsersRound, Mail, UserCircle2, Pencil, Trash2, X, Check } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useSearch } from '../context/SearchContext';
import TableSkeleton from '../components/TableSkeleton';

export default function UsersPage() {
  const { addToast } = useToast();
  const { searchQuery } = useSearch();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '' });
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      addToast('Error al cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData({ first_name: '', last_name: '', email: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormData({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ first_name: '', last_name: '', email: '' });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingUser) {
        await usersApi.put(`/users/${editingUser.id}`, formData);
        addToast(`${formData.first_name} ${formData.last_name} actualizado correctamente`, 'success');
      } else {
        await usersApi.post('/users', formData);
        addToast(`${formData.first_name} ${formData.last_name} registrado correctamente`, 'success');
      }
      closeForm();
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.error || (editingUser ? 'Error al editar usuario' : 'Error al crear usuario'));
    }
  };

  const handleDelete = async (user) => {
    try {
      await usersApi.delete(`/users/${user.id}`);
      setConfirmDeleteId(null);
      addToast(`${user.first_name} ${user.last_name} eliminado del sistema`, 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al eliminar el usuario', 'error');
      setConfirmDeleteId(null);
    }
  };

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

  // Filtrado por búsqueda
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return `${user.first_name} ${user.last_name}`.toLowerCase().includes(q)
      || user.email.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title logo-font">Gestión de Usuarios</h1>
          <p className="page-description">
            {searchQuery
              ? `${filteredUsers.length} resultado(s) para "${searchQuery}"`
              : 'Registra y consulta los lectores de la biblioteca.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {editingUser ? 'Editar Lector' : 'Registrar Lector'}
          </h2>
          {formError && (
            <div style={{ color: 'var(--status-overdue)', marginBottom: '16px', fontSize: '14px', padding: '12px', background: '#FFCDD2', borderRadius: '8px' }}>
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid-layout">
              <div className="input-group">
                <label>Nombre</label>
                <div className="input-container">
                  <UserCircle2 className="input-icon" size={18} />
                  <input type="text" className="input-field with-icon" placeholder="Ej. Juan" required
                    value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Apellido</label>
                <div className="input-container">
                  <UserCircle2 className="input-icon" size={18} />
                  <input type="text" className="input-field with-icon" placeholder="Ej. Pérez" required
                    value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Correo Electrónico</label>
                <div className="input-container">
                  <Mail className="input-icon" size={18} />
                  <input type="email" className="input-field with-icon" placeholder="juan@correo.com" required
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancelar</button>
              <button type="submit" className="btn btn-success">{editingUser ? 'Guardar Cambios' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <UsersRound size={48} style={{ margin: '0 auto 16px', color: 'var(--border-color)' }} />
            <p>{searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay lectores registrados'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lector</th>
                <th>Correo Electrónico</th>
                <th>Fecha de Registro</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--primary-color)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 600, flexShrink: 0
                      }}>
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{user.first_name} {user.last_name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {confirmDeleteId === user.id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>¿Eliminar?</span>
                        <button className="btn-icon success" title="Confirmar" onClick={() => handleDelete(user)}>
                          <Check size={16} />
                        </button>
                        <button className="btn-icon danger" title="Cancelar" onClick={() => setConfirmDeleteId(null)}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" title="Editar" onClick={() => openEditForm(user)}>
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon danger" title="Eliminar" onClick={() => setConfirmDeleteId(user.id)}>
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
