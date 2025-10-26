import { useState, useEffect, useCallback } from 'react';
// Importamos solo los tipos que se usan realmente: ChangeEvent y FormEvent
import type { ChangeEvent, FormEvent } from 'react';
// Importamos los íconos de Lucide para un diseño más limpio
import { Check, Edit, Trash2, X, Save, Lightbulb } from 'lucide-react'; // Agregué Lightbulb para el botón del nombre

// 1. DEFINICIÓN DE INTERFAZ
interface Task {
    id: number;
    name: string;
    description: string;
    due_date: string; // Formato YYYY-MM-DD
    completed: boolean;
}

// Interfaz para el estado de las nuevas tareas (inputs)
interface NewTaskData {
    name: string;
    description: string;
    due_date: string;
}

// FIX: Usamos la URL base para la comunicación con el servicio de API local
const API_BASE_URL = 'http://localhost:5000';

/**
 * Componente funcional para renderizar una tarea individual, incluyendo
 * modos de visualización y edición.
 */
interface TaskItemProps {
    task: Task;
    isEditing: boolean;
    editedTaskData: Task | null;
    handleStartEdit: (id: number) => void;
    handleToggleComplete: (task: Task) => Promise<void>;
    handleEditTaskChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSaveEdit: (editedTask: Task) => Promise<void>;
    handleDeleteTask: (id: number) => Promise<void>;
    handleCancelEdit: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
    task,
    isEditing,
    editedTaskData,
    handleStartEdit,
    handleToggleComplete,
    handleEditTaskChange,
    handleSaveEdit,
    handleDeleteTask,
    handleCancelEdit
}) => {
    return (
        <div
            key={task.id}
            className={`p-5 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center transition duration-200 ${
                task.completed ? 'bg-green-50 border-l-4 border-green-500 opacity-80' : 'bg-white border-l-4 border-indigo-300 hover:shadow-xl'
            }`}
        >
            {isEditing ? (
                // Modo Edición
                <div className="flex-grow w-full space-y-3">
                    <input
                        type="text"
                        name="name"
                        value={editedTaskData?.name || ''}
                        onChange={handleEditTaskChange}
                        className="p-2 border border-gray-300 rounded-md w-full font-bold text-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                        type="text"
                        name="description"
                        value={editedTaskData?.description || ''}
                        onChange={handleEditTaskChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                        type="date"
                        name="due_date"
                        // El valor del input type="date" debe estar en formato YYYY-MM-DD
                        value={editedTaskData?.due_date || ''}
                        onChange={handleEditTaskChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="mt-3 flex space-x-2">
                        <button
                            onClick={() => editedTaskData && handleSaveEdit(editedTaskData)}
                            className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition duration-150 shadow-md flex items-center"
                        >
                            <Save className="w-4 h-4 mr-1" /> Guardar
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="bg-gray-400 text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-500 transition duration-150 shadow-md flex items-center"
                        >
                            <X className="w-4 h-4 mr-1" /> Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                // Modo Visualización
                <>
                    <div className="flex-grow min-w-0 pr-4">
                        <h3 className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-indigo-800'}`}>
                            {task.name}
                        </h3>
                        {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        {task.due_date && (
                            <p className="text-xs text-gray-400 mt-1">Vencimiento: {new Date(task.due_date).toLocaleDateString()}</p>
                        )}
                         <p className="text-xs text-gray-400 mt-1">ID: {task.id}</p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-2 mt-4 md:mt-0 flex-shrink-0">
                        <button
                            onClick={() => handleToggleComplete(task)}
                            className={`p-3 rounded-full text-white transition duration-150 shadow-md ${task.completed ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                            title={task.completed ? "Marcar como Pendiente" : "Marcar como Completada"}
                        >
                            <Check className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleStartEdit(task.id)}
                            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-150 shadow-md"
                            title="Editar Tarea"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-150 shadow-md"
                            title="Eliminar Tarea"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function App() {
    // Tipado del estado: Task[] o null. Inicializado a un array vacío.
    const [tasks, setTasks] = useState<Task[]>([]);
    // Tipado del estado de error: string o null.
    const [error, setError] = useState<string | null>(null);

    const [newTask, setNewTask] = useState<NewTaskData>({
        name: '',
        description: '',
        due_date: '',
    });

    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editedTaskData, setEditedTaskData] = useState<Task | null>(null);

    // Nuevo estado para mostrar el nombre
    const [mostrarNombre, setMostrarNombre] = useState<boolean>(false);

    // ----------------------------------------------------
    // MANEJADORES DE DATOS Y ESTADO
    // ----------------------------------------------------

    const fetchTasks = useCallback(async () => {
        try {
            setError(null);
            // Usamos la ruta completa para obtener todas las tareas
            const response = await fetch(`${API_BASE_URL}/items`);
            if (!response.ok) {
                // Si la respuesta no es OK, aún debemos intentar leer el cuerpo por si hay un error detallado
                const errorBody = await response.text();
                throw new Error(`La respuesta de la API no fue OK. Estado: ${response.status}. Cuerpo: ${errorBody}`);
            }
            const data: Task[] = await response.json();
            setTasks(data);
        } catch (e: unknown) { // Tipado de error (e) para manejo de excepciones
            const errorMessage = 'Error al conectar con la API o al obtener datos. Asegúrate de que el servicio castaneda-api esté levantado.';
            console.error(errorMessage, e);
            setError(errorMessage);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Tipado de 'e' como ChangeEvent para inputs/textareas
    const handleNewTaskChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewTask((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditTaskChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (editedTaskData) {
            setEditedTaskData((prev) => ({
                ...prev!, // Se sabe que no es null aquí gracias a la comprobación de arriba
                [name]: value,
            }));
        }
    };

    // Tipado de 'e' como FormEvent
    const handleAddTask = async (e: FormEvent) => {
        e.preventDefault();
        // Validación básica
        if (!newTask.name.trim()) {
            setError("El nombre de la tarea no puede estar vacío.");
            return;
        }

        try {
            // Usamos la ruta de postear tareas
            const response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Fallo al agregar la tarea. Estado: ${response.status}. Cuerpo: ${errorBody}`);
            }
            const addedTask: Task = await response.json();

            setTasks((prev) => [...prev, addedTask]);
            setNewTask({ name: '', description: '', due_date: '' });
            setError(null);
        } catch (e) {
            setError('No se pudo crear la tarea. Revisa la consola para más detalles.');
            console.error(e);
        }
    };

    // Tipado de 'id' como number
    const handleDeleteTask = async (id: number) => {
        try {
            // Usamos la ruta de eliminar por ID
            const response = await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Fallo al eliminar la tarea. Estado: ${response.status}. Cuerpo: ${errorBody}`);
            }

            setTasks((prev) => prev.filter((task) => task.id !== id));
            setError(null);
        } catch (e) {
            setError('No se pudo eliminar la tarea.');
            console.error(e);
        }
    };

    // Tipado de 'id' como number
    const handleStartEdit = (id: number) => {
        const taskToEdit = tasks.find(task => task.id === id); // 'task' es de tipo Task
        if (taskToEdit) {
            setIsEditing(id);
            // Aseguramos que la fecha esté en formato YYYY-MM-DD para el input type="date"
            const formattedTask = {
                ...taskToEdit,
                due_date: taskToEdit.due_date ? new Date(taskToEdit.due_date).toISOString().split('T')[0] : ''
            };
            setEditedTaskData(formattedTask);
        }
    };

    // Tipado de 'editedTask' como Task
    const handleSaveEdit = async (editedTask: Task) => {
        try {
            // Usamos la ruta de editar por ID (PUT)
            const response = await fetch(`${API_BASE_URL}/items/${editedTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedTask),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Fallo al actualizar la tarea. Estado: ${response.status}. Cuerpo: ${errorBody}`);
            }
            // Aunque la API devuelva la tarea actualizada, la tomamos del estado para simplicidad.

            setTasks((prev) =>
                prev.map((task) => (task.id === editedTask.id ? editedTask : task))
            );

            setIsEditing(null);
            setEditedTaskData(null);
            setError(null);
        } catch (e) {
            setError('No se pudo actualizar la tarea.');
            console.error(e);
        }
    };
    
    const handleCancelEdit = () => {
        setIsEditing(null);
        setEditedTaskData(null);
    };

    // Tipado de 'task' como Task
    const handleToggleComplete = async (task: Task) => {
        const updatedTask = { ...task, completed: !task.completed };

        try {
            // Usamos la ruta de editar por ID (PUT)
            const response = await fetch(`${API_BASE_URL}/items/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Fallo al cambiar el estado. Estado: ${response.status}. Cuerpo: ${errorBody}`);
            }

            setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? updatedTask : t))
            );
            setError(null);
        } catch (e) {
            setError('No se pudo actualizar el estado de la tarea.');
            console.error(e);
        }
    };

    // Manejador para el nuevo botón del nombre
    const handleMostrarNombre = () => {
        setMostrarNombre(true);
        // Oculta el nombre después de 3 segundos
        setTimeout(() => setMostrarNombre(false), 3000); 
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-8 transform transition duration-500 hover:shadow-3xl">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8 text-center">
                    RichieCastNotes - Gestor de Tareas
                </h1>

                {/* Botón para mostrar el nombre */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleMostrarNombre}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center transition duration-300 transform hover:scale-105"
                    >
                        <Lightbulb className="w-5 h-5 mr-2" /> Click Aquí
                    </button>
                </div>

                {/* Nombre completo que aparece y desaparece */}
                {mostrarNombre && (
                    <div className="text-center bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-3 rounded-md mb-6 animate-fadeInOut">
                        <p className="font-semibold">Richard Othon Castañeda de la Rosa</p>
                    </div>
                )}

                {/* Formulario para agregar tarea */}
                <form onSubmit={handleAddTask} className="bg-indigo-50 p-6 rounded-lg shadow-inner mb-8 border border-indigo-200">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                        <Edit className="w-6 h-6 mr-2 text-indigo-500" /> Crear Nueva Tarea
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Nombre de la Tarea"
                            value={newTask.name}
                            onChange={handleNewTaskChange}
                            required
                            className="col-span-4 md:col-span-1 p-3 border border-indigo-300 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition duration-150"
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Descripción (opcional)"
                            value={newTask.description}
                            onChange={handleNewTaskChange}
                            className="col-span-4 md:col-span-2 p-3 border border-indigo-300 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition duration-150"
                        />
                        <input
                            type="date"
                            name="due_date"
                            value={newTask.due_date}
                            onChange={handleNewTaskChange}
                            className="col-span-4 md:col-span-1 p-3 border border-indigo-300 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition duration-300 shadow-lg transform hover:scale-[1.01] flex items-center justify-center"
                    >
                        <Check className="w-5 h-5 mr-2" /> Agregar Tarea
                    </button>
                </form>

                {/* Mensaje de Error */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-md" role="alert">
                        <strong className="font-bold block mb-1">¡Algo salió mal!</strong>
                        <span className="block">{error}</span>
                    </div>
                )}

                {/* Listado de Tareas */}
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-indigo-300 pb-3">
                    Lista de Tareas <span className="text-indigo-500">({tasks.length})</span>
                </h2>

                {tasks.length === 0 && !error && (
                    <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg shadow-inner">
                        <p className="text-lg font-medium">No hay tareas pendientes. ¡Hora de empezar a crear!</p>
                    </div>
                )}

                <div className="space-y-4">
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            isEditing={isEditing === task.id}
                            editedTaskData={editedTaskData}
                            handleStartEdit={handleStartEdit}
                            handleToggleComplete={handleToggleComplete}
                            handleEditTaskChange={handleEditTaskChange}
                            handleSaveEdit={handleSaveEdit}
                            handleDeleteTask={handleDeleteTask}
                            handleCancelEdit={handleCancelEdit}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;
