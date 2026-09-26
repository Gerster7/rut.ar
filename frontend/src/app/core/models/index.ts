export type RolUsuario = 'ADMINISTRADOR' | 'LOGISTICO' | 'FLETERO' | 'USUARIO';

export interface Usuario {
  id: number;
  email: string;
  rol: RolUsuario;
  createdAt?: string;
  updatedAt?: string;
}

export interface Fletero {
  id: number;
  usuarioId: number;
  nombre: string;
  telefono: string;
  vehiculo: string;
  patenteVehiculo: string;
  capacidadVehiculo: number;
  latitudActual: number | null;
  longitudActual: number | null;
  usuario?: Usuario;
  createdAt?: string;
  updatedAt?: string;
}

export type EstadoNegocio = 'abierto' | 'asignado' | 'en_proceso' | 'completado' | 'cancelado';

export interface Negocio {
  id: number;
  usuarioId: number;
  descripcion: string;
  tipoCarga: string;
  estado: EstadoNegocio;
  origenLat: number;
  origenLng: number;
  destinoLat: number;
  destinoLng: number;
  pesoTotal: number;
  usuario?: Usuario;
  createdAt?: string;
  updatedAt?: string;
}

export type EstadoViaje = 'activo' | 'abierto' | 'asignado' | 'en curso' | 'finalizado' | 'cancelado';

export interface Viaje {
  id: number;
  negocioId: number;
  fleteroId: number;
  fechaInicio: string;
  fechaFinEstimada: string;
  estado: EstadoViaje;
  pesoAsignado: number;
  negocio?: Negocio;
  fletero?: Fletero;
  createdAt?: string;
  updatedAt?: string;
}

export interface FleteroDisponible {
  fletero: Fletero;
  distanciaKm: number;
  disponibilidad: 'inmediata' | 'proximo_a_destino';
  viajeActivoId?: number;
}

export interface NegocioRetorno {
  negocio: Negocio;
  desvioKm: number;
  distanciaRetornoEstimadaKm: number;
}
