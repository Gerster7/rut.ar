import { Table, Column, Model, DataType, HasOne, HasMany } from 'sequelize-typescript';
import { Fletero } from './fletero.model';
import { Negocio } from './negocio.model';

@Table({ tableName: 'usuarios', timestamps: true })
export class Usuario extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  rol!: string;

  @HasOne(() => Fletero)
  fletero!: Fletero;

  @HasMany(() => Negocio)
  negocios!: Negocio[];
}
