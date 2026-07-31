import React from 'react';
import './TableSkeleton.css';

/**
 * Skeleton animado para tablas.
 * @param {number} rows - número de filas a mostrar (default: 5)
 * @param {number} columns - número de columnas (default: 4)
 */
export default function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} style={{
              padding: '16px 20px',
              background: 'var(--header-bg)',
              borderBottom: '1px solid var(--border-color)',
              textAlign: i === columns - 1 ? 'right' : 'left'
            }}>
              <div className="skeleton" style={{ width: i === columns - 1 ? '60px' : '100px', marginLeft: i === columns - 1 ? 'auto' : 0 }} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx} style={{
                padding: '16px 20px',
                borderBottom: rowIdx === rows - 1 ? 'none' : '1px solid var(--border-color)'
              }}>
                <div className="skeleton" style={{
                  width: colIdx === 0 ? '80%' : colIdx === columns - 1 ? '70px' : '60%',
                  marginLeft: colIdx === columns - 1 ? 'auto' : 0
                }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Skeleton para las tarjetas del Dashboard */
export function CardSkeleton() {
  return (
    <div className="card" style={{ pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '60%' }}>
          <div className="skeleton" style={{ width: '70%', height: '13px' }} />
          <div className="skeleton" style={{ width: '50%', height: '36px' }} />
        </div>
        <div className="skeleton" style={{ width: '52px', height: '52px', borderRadius: '14px' }} />
      </div>
      <div className="skeleton" style={{ width: '55%', height: '12px', marginTop: '20px' }} />
    </div>
  );
}
