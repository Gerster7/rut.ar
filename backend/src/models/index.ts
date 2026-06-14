export * from './usuario.model';
export * from './fletero.model';
export * from './negocio.model';
export * from './viaje.model';

import { Usuario } from './usuario.model';
import { Fletero } from './fletero.model';
import { Negocio } from './negocio.model';
import { Viaje } from './viaje.model';

export const dbModels = [Usuario, Fletero, Negocio, Viaje];
