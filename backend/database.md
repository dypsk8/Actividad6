# Base de Datos `Act6` (PostgreSQL)

La base de datos `Act6` contiene tablas independientes para cada microservicio. A continuación se detalla la estructura y el script SQL para crear las tablas necesarias en PostgreSQL.

## Estructura de Tablas

### 1. Tabla `users` (Microservicio de Usuarios)
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Tabla `books` (Microservicio de Libros)
```sql
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Tabla `loans` (Microservicio de Préstamos)
```sql
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE' -- 'ACTIVE' o 'RETURNED'
);
```


