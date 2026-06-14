import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Fletero } from './fletero.model';
import { Negocio } from './negocio.model';

@Table({ tableName: 'viajes', timestamps: true })
export class Viaje extends Model {
  @ForeignKey(() => Negocio)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  negocioId!: number;

  @BelongsTo(() => Negocio)
  negocio!: Negocio;

  @ForeignKey(() => Fletero)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  fleteroId!: number;

  @BelongsTo(() => Fletero)
  fletero!: Fletero;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  fechaInicio!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  fechaFinEstimada!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'activo'
  })
  estado!: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  pesoAsignado!: number;
}
