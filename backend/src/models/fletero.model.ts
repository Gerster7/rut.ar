import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { Usuario } from './usuario.model';
import { Viaje } from './viaje.model';

@Table({ tableName: 'fleteros', timestamps: true })
export class Fletero extends Model {
  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  usuarioId!: number;

  @BelongsTo(() => Usuario)
  usuario!: Usuario;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  nombre!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  telefono!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  vehiculo!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  patenteVehiculo!: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  capacidadVehiculo!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true
  })
  latitudActual!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true
  })
  longitudActual!: number;

  @HasMany(() => Viaje)
  viajes!: Viaje[];
}
