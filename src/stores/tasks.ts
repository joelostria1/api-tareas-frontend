import {defineStore} from 'pinia'
import axios from 'axios'
import type { Tarea, TareaDto } from '../interfaces/task.interfaces'

const API_URL = 'http://localhost:3000/tareas'
const AUTH_TOKEN = 'Bearer 6e4100cb9fc7b69bdc56e30b83fafd577e2ec5f6bdf94f54e680c7fad27f4ca5'

interface TareaState {
    tasks: Tarea[];
    loading: boolean;
    error: string | null;
}

export const useTaskStore = defineStore('task', {
    state: (): TareaState => ({
        tasks: [],
        loading: false,
        error: null,
    }),
    actions: {
        getHeader() {
            return {
                headers: {
                    Authorization: AUTH_TOKEN,
                },
            }
        },
        async obtenerTareas() {
            this.loading = true
            try {
                const response = await axios.get<Tarea[]>(API_URL, this.getHeader())
                this.tasks = response.data
            } catch (error) {
                this.error = 'Error listando tareas'
            } finally {
                this.loading = false
            }
        },
        async crearTarea(task: TareaDto) {
            try {
                const response = await axios.post<Tarea>(API_URL, task, this.getHeader())
                this.tasks.unshift(response.data)
                return response.data
            }catch (error) {
                this.error = 'Error creando tarea'
                throw error
            } 
        },
        async actualizarTarea(id: number, updatedData: Partial<Tarea>): Promise<void> {
            try {
                const response = await axios.put<Tarea>(`${API_URL}/${id}`, updatedData, this.getHeader())
                const index = this.tasks.findIndex(task => task.id === id)
                if (index !== -1) {
                    this.tasks[index] = response.data
                }
            } catch (error) {
                this.error = 'Error actualizando tarea'
                throw error
            }
        },
        async eliminarTarea(id: number): Promise<void> {
            try {
                await axios.delete(`${API_URL}/${id}`, this.getHeader())
                this.tasks = this.tasks.filter(task => task.id !== id)
            } catch (error) {
                this.error = 'Error eliminando tarea'
                throw error
            }
        },
    },
})