import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { Usuario } from './usuario.model';
import { Viaje } from './viaje.model';

@Table({ tableName: 'negocios', timestamps: true })
export class Negocio extends Model {
  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  usuarioId!: number; // El usuario que publica el negocio

  @BelongsTo(() => Usuario)
  usuario!: Usuario;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  descripcion!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  tipoCarga!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'abierto'
  })
  estado!: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  origenLat!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  origenLng!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  destinoLat!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  destinoLng!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  pesoTotal!: number;

  @HasMany(() => Viaje)
  viajes!: Viaje[];
}
