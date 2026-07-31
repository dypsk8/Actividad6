import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LibraryBig,
  LayoutDashboard,
  UsersRound,
  BookCopy,
  BookOpenCheck,
  Settings,
  Search,
  Bell,
  UserCircle2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import './App.css';

// Contexto y Alertas
import { ToastProvider } from './components/Toast';
import { SearchContext } from './context/SearchContext';

// Paginas
import UsersPage from './pages/UsersPage';
import BooksPage from './pages/BooksPage';
import LoansPage from './pages/LoansPage';
import DashboardPage from './pages/DashboardPage';

// AppLayout: contiene el sidebar, el header y el área de contenido (rutas)
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Limpiar búsqueda al cambiar de página
  React.useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="app-container">
        {/* Overlay oscuro que cierra el sidebar al hacer clic (solo visible en móvil) */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <LibraryBig className="logo-icon" size={32} />
              <span className="logo-font">VirtualLib</span>
            </div>
            <div className="subtitle">Biblioteca Digital</div>
          </div>

          <div className="separator"></div>

          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
              <UsersRound size={20} />
              Usuarios
            </NavLink>
            <NavLink to="/books" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
              <BookCopy size={20} />
              Libros
            </NavLink>
            <NavLink to="/loans" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
              <BookOpenCheck size={20} />
              Préstamos
            </NavLink>
          </nav>

          <div className="separator"></div>

          <div className="sidebar-footer nav-links">
            <button className="nav-link">
              <Settings size={20} />
              Configuración
            </button>
            <button className="nav-link">
              <UserCircle2 size={20} />
              Perfil
            </button>
            <button className="nav-link nav-link-danger">
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main Wrapper (Header + Content) */}
        <div className="main-wrapper">
          {/* Top Header */}
          <header className="top-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menú">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="search-bar">
                <Search className="search-icon-header" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar libros, usuarios o autores..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Buscar"
                />
              </div>
            </div>

            <div className="header-actions">
              <button className="notification-btn" aria-label="Notificaciones">
                <Bell size={20} />
                <span className="notification-badge"></span>
              </button>
              <div className="user-profile">
                <div className="user-avatar">AD</div>
                <div className="user-info">
                  <span className="user-name">Administrador</span>
                  <span className="user-role">Gestor Principal</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/loans" element={<LoansPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </SearchContext.Provider>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppLayout />
      </Router>
    </ToastProvider>
  );
}

export default App;
