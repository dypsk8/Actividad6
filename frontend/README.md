# Actvidad #6 Duval Yepez Utm – Sistema de Gestión de Biblioteca Digital

Aplicación web full-stack para la administración de una biblioteca digital. Permite gestionar usuarios, libros y préstamos desde un panel de control único, comunicándose con tres microservicios independientes en el backend.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────┐
│                FRONTEND (React/Vite)            │
│  Dashboard │ Usuarios │ Libros │ Préstamos       │
└─────────────┬───────────────────────────────────┘
              │ HTTP (Axios)
    ┌─────────┼──────────────┐
    ▼         ▼              ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│ Users  │ │ Books  │ │   Loans      │
│ :3001  │ │ :3002  │ │   :3003      │
└────────┘ └────┬───┘ └──────┬───────┘
                │  ◄──────── │  (HTTP entre servicios)
           ┌────┴────────────┴────┐
           │   PostgreSQL (Act6)  │
           └──────────────────────┘
```

Cada microservicio tiene su propia conexión a la base de datos `Act6` y se comunica con los demás vía HTTP cuando lo necesita (el servicio de préstamos valida usuarios y libros antes de crear un préstamo).

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Librería UI principal |
| Vite | 8 | Bundler y servidor de desarrollo |
| React Router DOM | 7 | Navegación entre páginas (SPA) |
| Axios | 1.x | Peticiones HTTP a los microservicios |
| Lucide React | 1.x | Íconos SVG |
| Vanilla CSS | — | Estilos (variables CSS, glassmorphism, animaciones) |
| OxLint | 1.x | Linter para JS/JSX |

### Backend (×3 microservicios)
| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor HTTP de cada microservicio |
| `pg` (node-postgres) | Pool de conexión a PostgreSQL |
| `dotenv` | Carga de variables de entorno desde `.env` |
| `cors` | Permite peticiones cross-origin desde el frontend |
| `axios` | Comunicación HTTP entre microservicios |

### Base de Datos
| Tecnología | Uso |
|---|---|
| PostgreSQL | Motor de base de datos relacional |

---

## Estructura del Proyecto

```
Actvidad6/
├── frontend/                   # Aplicación React (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── config.js       # Instancias Axios por microservicio
│   │   ├── components/
│   │   │   ├── Toast.jsx       # Sistema de notificaciones global
│   │   │   └── TableSkeleton.jsx # Skeletons de carga animados
│   │   ├── context/
│   │   │   └── SearchContext.jsx # Contexto global de búsqueda
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   ├── BooksPage.jsx
│   │   │   └── LoansPage.jsx
│   │   ├── App.jsx             # Layout principal + enrutamiento
│   │   ├── App.css             # Estilos del layout
│   │   ├── index.css           # Design system (variables, utilidades)
│   │   └── main.jsx            # Punto de entrada React
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/
    ├── users-service/          # Puerto 3001
    │   ├── index.js            # Rutas CRUD de usuarios
    │   ├── db.js               # Pool de conexión PostgreSQL
    │   ├── .env                # Variables de entorno (no subir al repo)
    │   └── package.json
    ├── books-service/          # Puerto 3002
    │   ├── index.js            # Rutas CRUD + estado de disponibilidad
    │   ├── db.js
    │   ├── .env
    │   └── package.json
    ├── loans-service/          # Puerto 3003
    │   ├── index.js            # Préstamos: valida usuario/libro vía HTTP
    │   ├── db.js
    │   ├── .env
    │   └── package.json
    └── database.md             # Script SQL para crear las tablas
```

---

## Funcionalidades

### Dashboard
- Estadísticas en tiempo real: total de libros, usuarios, préstamos activos y libros vencidos.
- Consulta paralela a los tres microservicios con `Promise.all`.
- Skeletons animados mientras cargan los datos.

### Gestión de Usuarios
- Listado, creación, edición y eliminación de lectores.
- Validación de email único en el backend.
- Búsqueda en tiempo real por nombre o correo desde el header global.

### Catálogo de Libros
- Listado, creación, edición y eliminación de obras.
- Badge de estado: **Disponible** / **Prestado** según `is_available`.
- Búsqueda por título o autor.

### Registro de Préstamos
- Creación de préstamos: solo muestra libros disponibles en el selector.
- El servicio de préstamos valida usuario y libro vía HTTP antes de registrar.
- Al crear un préstamo, actualiza automáticamente la disponibilidad del libro.
- Devolución con confirmación inline; revierte el estado del libro al devolver.
- Detección de vencimiento (plazo de 14 días) con badge visual.

---

## Base de Datos (PostgreSQL)

Base de datos: `Act6`. Las tres tablas conviven en la misma instancia pero son independientes (sin foreign keys entre servicios; la integridad la gestiona el Loans Service vía HTTP).

```sql
-- Microservicio de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Microservicio de Libros
CREATE TABLE IF NOT EXISTS books (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    author       VARCHAR(150) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Microservicio de Préstamos
CREATE TABLE IF NOT EXISTS loans (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL,
    book_id     INT NOT NULL,
    loan_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP,
    status      VARCHAR(20) DEFAULT 'ACTIVE' -- 'ACTIVE' | 'RETURNED'
);
```

---

## Configuración e Instalación

### Prerrequisitos
- Node.js ≥ 18
- PostgreSQL corriendo localmente
- Base de datos `Act6` creada con las tablas del bloque anterior

### 1. Variables de entorno

Cada microservicio necesita un archivo `.env` en su directorio (los `.env` no se suben al repositorio):

```env
# Ejemplo para books-service/.env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=Act6
```

El Loans Service también requiere las URLs de los otros servicios:

```env
# loans-service/.env (campos adicionales)
USERS_SERVICE_URL=http://localhost:3001
BOOKS_SERVICE_URL=http://localhost:3002
```

### 2. Instalar dependencias

```bash
cd backend/users-service && npm install
cd backend/books-service && npm install
cd backend/loans-service && npm install
cd frontend && npm install
```

### 3. Iniciar los servicios

Abrir una terminal por cada servicio:

```bash
node backend/users-service/index.js   # → http://localhost:3001
node backend/books-service/index.js   # → http://localhost:3002
node backend/loans-service/index.js   # → http://localhost:3003
```

Iniciar el frontend:

```bash
cd frontend
npm run dev   # → http://localhost:5173
```

---

## API Endpoints

### Users Service (`http://localhost:3001`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users` | Listar todos los usuarios |
| GET | `/users/:id` | Obtener usuario por ID |
| POST | `/users` | Crear usuario |
| PUT | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |

### Books Service (`http://localhost:3002`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/books` | Listar todos los libros |
| GET | `/books/:id` | Obtener libro por ID |
| POST | `/books` | Registrar libro |
| PUT | `/books/:id` | Actualizar título/autor |
| PUT | `/books/:id/status` | Actualizar disponibilidad (uso interno entre servicios) |
| DELETE | `/books/:id` | Eliminar libro |

### Loans Service (`http://localhost:3003`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/loans` | Historial completo de préstamos |
| POST | `/loans` | Registrar préstamo (valida usuario y libro vía HTTP) |
| PUT | `/loans/:id/return` | Procesar devolución y liberar el libro |
