import { Injectable } from '@nestjs/common';
import { ProductoEntity } from './producto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly repository: Repository<ProductoEntity>,
  ) {}

  async findAll(): Promise<ProductoEntity[]> {
    return await this.repository.find({
      relations: ['tiendas'],
    });
  }

  async findOne(id: string): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.repository.findOne({
      where: { id },
      relations: ['tiendas'],
    });
    if (!producto) {
      throw new BusinessLogicException(
        'El producto con el id dado no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    return producto;
  }

  async create(producto: ProductoEntity): Promise<ProductoEntity> {
    const tiposPermitidos = ['Perecedero', 'No perecedero'];
    if (!tiposPermitidos.includes(producto.tipo)) {
      throw new BusinessLogicException(
        'El producto no tiene un tipo válido',
        BusinessError.BAD_REQUEST,
      );
    }
    return await this.repository.save(producto);
  }

  async update(id: string, producto: ProductoEntity): Promise<ProductoEntity> {
    const productoGuardado: ProductoEntity = await this.repository.findOne({
      where: { id },
    });
    if (!productoGuardado) {
      throw new BusinessLogicException(
        'El producto con el id dado no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    const tiposPermitidos = ['Perecedero', 'No perecedero'];
    if (!tiposPermitidos.includes(producto.tipo)) {
      throw new BusinessLogicException(
        'El producto no tiene un tipo válido',
        BusinessError.BAD_REQUEST,
      );
    }
    producto.id = id;
    return await this.repository.save({
      ...productoGuardado,
      ...producto,
    });
  }

  async delete(id: string) {
    const productoGuardado: ProductoEntity = await this.repository.findOne({
      where: { id },
    });
    if (!productoGuardado) {
      throw new BusinessLogicException(
        'El producto con el id dado no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    return await this.repository.remove(productoGuardado);
  }
}
