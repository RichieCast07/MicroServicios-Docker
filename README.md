# 🚀 RichieCastNotes - Gestor de Tareas (Microservicios)

**Autor:** Richard Othon Castañeda de la Rosa  
**Descripción:** Sistema de microservicios para la gestión personal de tareas (To-Do List).  
Este proyecto está orquestado mediante **Docker Compose** e incluye:

- Frontend en **React + TailwindCSS**
- API REST con **FastAPI (Python)**
- Base de datos **MySQL**

---

## 📦 Componentes del Entorno

El proyecto consta de tres servicios clave que se ejecutan en contenedores Docker y se comunican entre sí mediante una red interna.

| Servicio        | Tecnología                | Puerto Local | Rol y Comunicación |
|----------------|---------------------------|--------------|--------------------|
| frontend-richie | React (TSX) + Tailwind    | `4200`       | UI, visible al usuario final |
| api-richie      | FastAPI (Python)          | `5000`       | Lógica de negocio / controlador |
| db-mysql        | MySQL Server              | `3306`       | Persistencia de datos |

---

## 📐 Arquitectura del Sistema

El diseño implementa un patrón de **tres capas** separadas por límites de red (microservicios), promoviendo **escalabilidad** y **resiliencia**.


