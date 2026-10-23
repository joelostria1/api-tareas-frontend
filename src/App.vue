<template>
  <div class="container my-5" style="max-width: 700px;">
    <h1 class="text-center mb-4 text-primary fw-bold">Mis tareas</h1>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Nueva Tarea</h5>
        <form @submit.prevent="handleSubmit">
          
          <div class="mb-3">
            <label class="form-label fw-semibold">Título</label>
            <input 
              v-model="form.titulo" 
              type="text" 
              class="form-control" 
              :class="{ 'is-invalid': v$.titulo.$error }"
              placeholder="Titulo Tarea"
            />
            <div class="invalid-feedback" v-if="v$.titulo.$error">
              Ingresar titulo
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Descripción</label>
            <textarea 
              v-model="form.descripcion" 
              class="form-control" 
              :class="{ 'is-invalid': v$.descripcion.$error }"
              rows="2"
              placeholder="Descripcion de la tarea"
            ></textarea>
            <div class="invalid-feedback" v-if="v$.descripcion.$error">
              La descripción es obligatoria.
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100">Agregar Tarea</button>
        </form>
      </div>
    </div>


    <div v-if="taskStore.loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else>
      <h5 class="mb-3 fw-bold">Mis Tareas ({{ taskStore.tasks.length }})</h5>
      
      <div v-if="taskStore.tasks.length === 0" class="alert alert-info text-center">
        No hay tareas pendientes.
      </div>

      <div 
        v-for="task in taskStore.tasks" 
        :key="task.id" 
        class="card shadow-sm mb-2"
        :class="{ 'bg-light border-success-subtle': task.completado }"
      >
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 
              class="card-title mb-1" 
              :class="{ 'text-decoration-line-through text-muted': task.completado }"
            >
              {{ task.titulo }}
            </h5>
            <p class="card-text text-muted small mb-0">{{ task.descripcion }}</p>
            <small class="text-black-50 d-block mt-1" style="font-size: 0.75rem;">
              Creado: {{ new Date(task.fechaCreacion).toLocaleString() }}
            </small>
          </div>

          <div class="d-flex gap-2">
            <button 
              @click="toggleComplete(task)" 
              class="btn btn-sm"
              :class="task.completado ? 'btn-success' : 'btn-outline-success'"
            >
              {{ task.completado ? 'Completada' : 'Completar' }}
            </button>
            
            <button @click="confirmDelete(task.id)" class="btn btn-sm btn-danger">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useTaskStore } from './stores/tasks'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength } from '@vuelidate/validators'
import Swal from 'sweetalert2'
import type { Tarea, CrearTareaDto } from './interfaces/task.interface'

const taskStore = useTaskStore()

const form = reactive<CrearTareaDto>({
  titulo: '',
  descripcion: ''
})

const rules = {
  titulo: { required, minLength: minLength(1) },
  descripcion: { required }
}

const v$ = useVuelidate(rules, form)

onMounted(() => {
  taskStore.obtenerTareas().catch(() => {
    Swal.fire('Error', 'No se pudieron conectar las tareas con el servidor backend', 'error')
  })
})

const handleSubmit = async (): Promise<void> => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  try {
    await taskStore.crearTarea({ ...form })
    
    Swal.fire({
      title: 'Exito!',
      text: 'La tarea se genero de manera correcta.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    })

    form.titulo = ''
    form.descripcion = ''
    v$.value.$reset()
  } catch (error) {
    Swal.fire('Error', 'Ocurrio un error al guardar la tarea', 'error')
  }
}

const toggleComplete = async (task: Tarea): Promise<void> => {
  try {
    await taskStore.actualizarTarea(task.id, {
      completado: !task.completado
    })
  } catch (error) {
    Swal.fire('Error', 'No se pudo actualizar el estado de la tarea', 'error')
  }
}

const confirmDelete = (id: string): void => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡Esta acción no se puede deshacer!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await taskStore.eliminarTarea(id)
        Swal.fire('¡Eliminada!', 'La tarea ha sido borrada.', 'success')
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la tarea', 'error')
      }
    }
  })
}
</script>
