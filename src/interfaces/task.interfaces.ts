export interface Tarea{
    id: number;
    titulo: string;
    descripcion: string;
    completado: boolean;
    fechaCreacion: string | Date;
}

export interface TareaDto{
    titulo: string;
    descripcion: string;
    completado: boolean;
}