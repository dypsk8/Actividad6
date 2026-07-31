import React, { useEffect, useState } from 'react';
import { usersApi, booksApi, loansApi } from '../api/config';
import { UsersRound, BookCopy, BookOpenCheck, AlertTriangle, Folders, Bookmark } from 'lucide-react';
import { CardSkeleton } from '../components/TableSkeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState(null); // null = cargando
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Consulta paralela a los tres microservicios; fallo individual no detiene los demás
        const [usersRes, booksRes, loansRes] = await Promise.all([
          usersApi.get('/users').catch(() => ({ data: [] })),
          booksApi.get('/books').catch(() => ({ data: [] })),
          loansApi.get('/loans').catch(() => ({ data: [] }))
        ]);

        const users = usersRes.data;
        const books = booksRes.data;
        const loans = loansRes.data;

        const now = new Date();
        const OVERDUE_DAYS = 14; // Plazo máximo en días antes de considerar un préstamo vencido

        setStats({
          totalUsers: users.length,
          totalBooks: books.length,
          availableBooks: books.filter(b => b.is_available).length,
          activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
          overdueBooks: loans.filter(l => {
            if (l.status !== 'ACTIVE') return false;
            const diffDays = (now - new Date(l.loan_date)) / (1000 * 60 * 60 * 24);
            return diffDays > OVERDUE_DAYS;
          }).length,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(true);
      }
    };
    fetchStats();
  }, []);

  const loading = stats === null && !error;

  const statCards = stats ? [
    {
      label: 'Libros en Inventario',
      value: stats.totalBooks,
      sub: `${stats.availableBooks} disponibles actualmente`,
      subColor: 'var(--status-available)',
      iconBg: '#F8F5F0',
      iconColor: 'var(--primary-color)',
      icon: <BookCopy size={28} strokeWidth={2.5} />,
    },
    {
      label: 'Usuarios Registrados',
      value: stats.totalUsers,
      sub: 'Lectores activos en la plataforma',
      subColor: 'var(--text-secondary)',
      iconBg: '#F0F9FF',
      iconColor: '#0284C7',
      icon: <UsersRound size={28} strokeWidth={2.5} />,
    },
    {
      label: 'Préstamos Activos',
      value: stats.activeLoans,
      sub: 'Libros actualmente en lectura',
      subColor: 'var(--text-secondary)',
      iconBg: '#FFF7ED',
      iconColor: '#EA580C',
      icon: <BookOpenCheck size={28} strokeWidth={2.5} />,
    },
    {
      label: 'Libros Vencidos',
      value: stats.overdueBooks,
      sub: stats.overdueBooks > 0 ? 'Requieren atención inmediata' : 'Todo al día',
      subColor: stats.overdueBooks > 0 ? 'var(--status-overdue)' : 'var(--status-available)',
      iconBg: '#FEF2F2',
      iconColor: 'var(--status-overdue)',
      icon: <AlertTriangle size={28} strokeWidth={2.5} />,
    },
    {
      label: 'Reservas',
      value: 0,
      sub: 'Próximos a ser retirados',
      subColor: 'var(--text-secondary)',
      iconBg: '#F4F4F5',
      iconColor: '#52525B',
      icon: <Bookmark size={28} strokeWidth={2.5} />,
    },
    {
      label: 'Categorías',
      value: 12,
      sub: 'Colecciones disponibles',
      subColor: 'var(--text-secondary)',
      iconBg: '#F5F3FF',
      iconColor: '#7C3AED',
      icon: <Folders size={28} strokeWidth={2.5} />,
    },
  ] : [];

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <h1 className="page-title logo-font" style={{ fontSize: '36px', color: 'var(--primary-color)' }}>
          Bienvenido, Administrador
        </h1>
        <p className="page-description" style={{ fontSize: '16px' }}>
          Gestiona tu biblioteca desde un solo lugar.
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px', background: '#FFCDD2', borderRadius: '12px', color: 'var(--status-overdue)', marginBottom: '24px' }}>
          No se pudieron cargar algunas estadísticas. Verifica que los servicios estén activos.
        </div>
      )}

      <div className="grid-layout">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map((card, i) => (
              <div className="card" key={i}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                      {card.label}
                    </p>
                    <h3 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {card.value}
                    </h3>
                  </div>
                  <div style={{ padding: '12px', background: card.iconBg, borderRadius: '14px', color: card.iconColor }}>
                    {card.icon}
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '13px', color: card.subColor, fontWeight: 500 }}>
                  {card.sub}
                </p>
              </div>
            ))
        }
      </div>
    </div>
  );
}
