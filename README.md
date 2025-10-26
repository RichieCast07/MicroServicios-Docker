# 🚀 Proyecto Docker - RichieCastNotes (Microservicios)

**Autor:** Richard Othon Castañeda de la Rosa  
**Descripción:** Sistema de microservicios para la gestión de tareas (To-Do List) con CRUD completo, implementado con Docker Compose, utilizando MySQL.

---

## 📦 Componentes del Proyecto

| Servicio | Tecnología | Puerto (Local) | Rol y Comunicación |
|----------|------------|----------------|-------------------|
| **api-richie** | Python + FastAPI | 5000 | Backend: Lógica de negocio. Recibe peticiones del Frontend y realiza el CRUD en MySQL. |
| **frontend-richie** | React + Tailwind | 3000 | Presentación: Interfaz web moderna (desarrollada con TSX/TS). Se comunica únicamente con el servicio api-richie. |
| **db-mysql** | MySQL Server | 3306 | Datos: Almacenamiento persistente de las tareas. Solo accesible por el backend. |

---

## 🔧 Backend (Python + FastAPI)

- Desarrollado en **Python puro**.
- API RESTful para la manipulación de tareas (`/items`) usando el framework **FastAPI**.
- Conexión a MySQL para el CRUD.
- Validaciones de datos y manejo de errores.
- **Puerto:** 5000

---

## 🎨 Frontend (React + Tailwind)

- Desarrollado con **React** y tipado con **TypeScript** (archivos `.tsx` y `.ts`).
- Interfaz web moderna y responsive.
- Formularios para creación y edición de tareas.
- Comunicación asíncrona con la API REST.
- **Puerto:** 3000

---

## 💾 Base de Datos (MySQL)

- Almacenamiento persistente con volúmenes de Docker.
- Tabla de `items` (tareas) con campos como título, descripción y estado.
- **Puerto:** 3306

---

## 🌟 Funcionalidades del CRUD (Gestión de Tareas)

✅ Crear nuevas tareas (items) con validación de campos.  
✅ Listar todas las tareas en la interfaz.  
✅ Editar información de tareas existentes.  
✅ Eliminar tareas con confirmación.  
✅ Validación de campos obligatorios.  
✅ Mensajes de éxito y error en el Frontend.

---

## 🚀 Inicio Rápido

### 1️⃣ Clonar o ubicarse en el proyecto

```bash
cd /ruta/a/docker-compose
```

### 2️⃣ Configurar variables de entorno

Asegúrate de que las variables de entorno de MySQL (host, user, password, database) estén definidas en tu `docker-compose.yml` o en un archivo `.env` para la base de datos.

### 3️⃣ Iniciar los servicios

```bash
docker-compose up --build
```

El flag `--build` es esencial si es la primera vez o si hay cambios en el código.

### 4️⃣ Acceder a las aplicaciones

| Aplicación | URL de Acceso |
|------------|---------------|
| **Frontend** | http://localhost:3000 |
| **API Backend** | http://localhost:5000 |
| **Endpoint de prueba** | http://localhost:5000/api/richie |

---

## 🔗 Endpoints de la API

La API funciona como un servicio RESTful estándar para la gestión de recursos (tareas).

### Tareas (Items)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/items` | Listar todas las tareas. |
| `GET` | `/api/items/:id` | Obtener una tarea específica por ID. |
| `POST` | `/api/items` | Crear una nueva tarea. |
| `PUT` | `/api/items/:id` | Actualizar una tarea existente. |
| `DELETE` | `/api/items/:id` | Eliminar una tarea. |

### Otros

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/richie` | Endpoint de verificación del apellido del autor. |
| `GET` | `/` | Documentación de la API (si está habilitado FastAPI/Swagger). |

---

## 🛠️ Comandos Útiles

```bash
# Iniciar servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Reconstruir imágenes
docker-compose up --build

# Detener y eliminar contenedores y redes
docker-compose down

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs del servicio de la API (backend)
docker-compose logs -f api-richie

# Entrar al contenedor de la base de datos MySQL (para depuración)
docker exec -it db-mysql mysql -u root -p
```

---

## 📋 Estructura del Proyecto

```
richiecastnotes/
├── backend/
│   ├── Dockerfile             # Configuración del contenedor FastAPI (Python)
│   ├── requirements.txt       # Dependencias de Python
│   └── app/
│       ├── main.py            # API REST con lógica de CRUD
│       └── database_setup.py  # Inicialización de MySQL
├── frontend/
│   ├── Dockerfile             # Configuración del contenedor React
│   ├── package.json
│   └── src/
│       ├── App.tsx            # Componente principal React (TSX)
│       └── api.service.ts     # Servicio de comunicación con la API (TypeScript)
├── docker-compose.yml         # Orquestación de servicios
├── .env                       # Variables de entorno (credenciales DB)
└── README.md                  # Este archivo
```

---

## 🐛 Troubleshooting

### Puerto ocupado

Si el puerto 3000 o 5000 ya está en uso, puedes cambiar el puerto local en el `docker-compose.yml`:

```yaml
# Cambia el primer número a un puerto libre, ej. 4201
ports:
  - "4201:4200"
```

### Error de conexión a la base de datos

Verifica que las variables de entorno para MySQL sean correctas y que el servicio de la base de datos esté corriendo y saludable:

```bash
docker-compose ps
docker-compose logs db-mysql
```

Asegúrate de que la API utiliza el nombre del servicio de Docker (`db-mysql`) como host de la base de datos dentro de la red Docker.

---

## 📝 Licencia

Este proyecto fue desarrollado con fines de práctica y demostración académica.

---

## 👨‍💻 Contacto

**Richard Othon Castañeda de la Rosa**  
Proyecto de Microservicios con Docker
