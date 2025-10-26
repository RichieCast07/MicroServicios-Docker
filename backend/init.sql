--
-- Esquema de base de datos actualizado
-- Se han agregado las columnas 'status' y 'due_date' para la gestión de proyectos.
--

-- 1. Eliminar la tabla si existe para evitar conflictos al crearla con un nuevo esquema
-- NOTA: Esto es útil para scripts de prueba, pero debe usarse con precaución en producción.
DROP TABLE IF EXISTS items;

-- 2. Crear la tabla 'items' con campos actualizados
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Nuevo campo para rastrear el estado de la tarea (ej: 'To Do', 'In Progress', 'Done')
    status VARCHAR(50) NOT NULL DEFAULT 'To Do',
    -- Nuevo campo para establecer una fecha límite
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insertar los datos, incluyendo valores para los nuevos campos 'status' y 'due_date'
INSERT INTO items (name, description, status, due_date) VALUES
-- Tareas clave en progreso
('Frontend App', 'Componente React con estilos responsivos.', 'In Progress', '2025-11-15'),
('Backend API', 'Servicio Node.js en TypeScript con conexión a MySQL.', 'In Progress', '2025-11-20'),

-- Tarea pendiente
('Microservicio 3', 'Pendiente de definir, será un servicio de logging y métricas.', 'To Do', '2025-12-01'),

-- Tareas de infraestructura
('Docker Compose', 'Herramienta de orquestación que une los tres servicios.', 'To Do', '2025-11-25'),

-- Tareas completadas (simulando que ya se configuraron)
('Base de Datos MySQL', 'Capa de persistencia con almacenamiento en volúmenes.', 'Done', '2025-10-20'),
('Conexión CORS', 'Configuración de seguridad para permitir peticiones entre servicios.', 'Done', '2025-10-20');
