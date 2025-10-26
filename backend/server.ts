import express, { Request, Response } from 'express';
import mysql, { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

// Tipado para los resultados de la DB
interface ItemRow extends RowDataPacket {
    id: number;
    name: string;
    description: string;
    status: 'To Do' | 'Done'; // Definimos el ENUM de la DB
    due_date: Date | null;
    created_at: Date;
}

// Tipado para la respuesta esperada por el Frontend
interface TaskResponse {
    id: number;
    name: string;
    description: string;
    due_date: string;
    completed: boolean;
    // Otros campos necesarios si los hubiera (como created_at, pero el frontend no lo usa)
}

// Helper para transformar el objeto de la DB al formato del Frontend
const mapRowToTaskResponse = (row: ItemRow): TaskResponse => ({
    id: row.id,
    name: row.name,
    description: row.description,
    // Mapeo CRÍTICO: 'Done' se traduce a true, 'To Do' a false
    completed: row.status === 'Done',
    // Aseguramos que la fecha sea un string en formato ISO o null
    due_date: row.due_date ? new Date(row.due_date).toISOString().split('T')[0] : '',
});


// Get environment variables from docker-compose.yml
const PORT = process.env.API_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const app = express();
app.use(cors());
app.use(express.json());

let dbConnection: Connection | null = null;

// Function to connect to the database
const connectDB = async () => {
    try {
        dbConnection = await mysql.createConnection({
            host: DB_HOST, // This will be 'castaneda-mysql' inside Docker network
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });
        console.log('Conexión a MySQL establecida con éxito.');
    } catch (error) {
        console.error('Fallo al conectar a MySQL. Reintentando en 5s...', error);
        // Retry connection as the DB service might be starting up
        setTimeout(connectDB, 5000);
    }
};

// Middleware to check DB connection status before running queries
const checkDbConnection = (req: Request, res: Response, next: () => void) => {
    if (!dbConnection) {
        return res.status(503).json({
            message: 'Servicio no disponible',
            error: 'La conexión a la base de datos no está activa.'
        });
    }
    next();
};

// Health Check Endpoint
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        service: 'API de Richard Castañeda',
        status: 'Online',
        db_status: dbConnection ? 'Conectado' : 'Desconectado'
    });
});

// 1. Personalized Endpoint: /castaneda (Requisito de apellido)
app.get('/castaneda', (req: Request, res: Response) => {
    res.status(200).json({
        // Nombre completo solicitado por el usuario
        nombre_completo: "Richard Othon Castañeda de la Rosa",
        mensaje: "Bienvenido al microservicio. Requisito del apellido cumplido."
    });
});

// =======================================================
// 2. CRUD Endpoints: /items
// =======================================================

// READ ALL: Obtener todos los items (AHORA MAPEANDO 'status' a 'completed')
app.get('/items', checkDbConnection, async (req: Request, res: Response) => {
    try {
        // Obtenemos los datos con el campo 'status'
        const [rows] = await dbConnection!.execute<ItemRow[]>('SELECT id, name, description, status, due_date, created_at FROM items ORDER BY id DESC');

        // Mapeamos cada fila para incluir 'completed' en lugar de 'status'
        const tasks: TaskResponse[] = rows.map(mapRowToTaskResponse);

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error al obtener datos de la DB:', error);
        res.status(500).json({ error: 'Error interno del servidor al consultar DB.' });
    }
});

// READ ONE: Obtener un item por ID (AHORA MAPEANDO 'status' a 'completed')
app.get('/items/:id', checkDbConnection, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows] = await dbConnection!.execute<ItemRow[]>('SELECT id, name, description, status, due_date, created_at FROM items WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Item no encontrado' });
        }

        // Mapeamos el único resultado
        const task: TaskResponse = mapRowToTaskResponse(rows[0]);

        res.status(200).json(task);
    } catch (error) {
        console.error('Error al obtener item por ID:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// CREATE: Crear un nuevo item (AHORA MAPEANDO el resultado a 'completed')
app.post('/items', checkDbConnection, async (req: Request, res: Response) => {
    const { name, description, due_date } = req.body;
    // status no se usa en la creación, por defecto es 'To Do'
    if (!name || !description) {
        return res.status(400).json({ error: 'Faltan campos: name y description son requeridos.' });
    }

    // Status por defecto es 'To Do' y el frontend espera completed: false
    const finalStatus: 'To Do' = 'To Do';
    const finalDueDate = due_date || null;

    try {
        const query = 'INSERT INTO items (name, description, status, due_date) VALUES (?, ?, ?, ?)';
        const [result] = await dbConnection!.execute<ResultSetHeader>(query, [
            name,
            description,
            finalStatus,
            finalDueDate
        ]);

        // Devolvemos el objeto completo que el frontend espera
        res.status(201).json({
            id: result.insertId,
            name,
            description,
            completed: false, // Siempre false al crear (status='To Do')
            due_date: finalDueDate,
            message: 'Item creado con éxito.'
        });
    } catch (error) {
        console.error('Error al crear item:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear item.' });
    }
});

// UPDATE: Actualizar un item existente por ID 
app.put('/items/:id', checkDbConnection, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, completed, due_date } = req.body; // Recibimos 'completed' del frontend

    if (!name || !description || typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Faltan campos: name, description y completed son requeridos para la actualización.' });
    }

    // Mapear el booleano 'completed' al ENUM 'status' de la DB
    const finalStatus = completed ? 'Done' : 'To Do';
    const finalDueDate = due_date || null;

    try {
        // La consulta usa 'status' en lugar de 'completed'
        const query = 'UPDATE items SET name = ?, description = ?, status = ?, due_date = ? WHERE id = ?';
        const [result] = await dbConnection!.execute<ResultSetHeader>(query, [
            name,
            description,
            finalStatus,
            finalDueDate,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item no encontrado para actualizar.' });
        }
        // La respuesta ya era correcta, devuelve el campo 'completed' para actualizar el estado de React
        res.status(200).json({ id: parseInt(id), name, description, completed, due_date: finalDueDate, message: 'Item actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar item:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar item.' });
    }
});

// DELETE: Eliminar un item por ID 
app.delete('/items/:id', checkDbConnection, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result] = await dbConnection!.execute<ResultSetHeader>('DELETE FROM items WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item no encontrado para eliminar.' });
        }
        res.status(200).json({ id, message: 'Item eliminado con éxito.' });
    } catch (error) {
        console.error('Error al eliminar item:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar item.' });
    }
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor API corriendo en el puerto ${PORT}`);
    });
});

export default app;
