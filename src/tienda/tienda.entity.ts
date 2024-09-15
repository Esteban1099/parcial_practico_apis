import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ProductoEntity } from '../producto/producto.entity';

@Entity()
export class TiendaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  ciudad: string;

  @Column()
  direccion: string;

  @ManyToMany(
    () => ProductoEntity,
    (producto: ProductoEntity) => producto.tiendas,
  )
  productos: ProductoEntity[];
}
