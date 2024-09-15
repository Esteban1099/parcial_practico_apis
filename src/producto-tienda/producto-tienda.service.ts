import { Injectable } from '@nestjs/common';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';

@Injectable()
export class ProductoTiendaService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    @InjectRepository(TiendaEntity)
    private readonly tiendaRepository: Repository<TiendaEntity>,
  ) {}

  async addStoreToProduct(
    productoId: string,
    tiendaId: string,
  ): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.findProductoById(productoId);
    const tienda: TiendaEntity = await this.findTiendaById(tiendaId);

    producto.tiendas = [...producto.tiendas, tienda];
    return await this.productoRepository.save(producto);
  }

  async findStoresFromProduct(productoId: string): Promise<TiendaEntity[]> {
    const producto: ProductoEntity = await this.findProductoById(productoId);
    return producto.tiendas;
  }

  async findStoreFromProduct(
    productoId: string,
    tiendaId: string,
  ): Promise<TiendaEntity> {
    const producto: ProductoEntity = await this.findProductoById(productoId);
    const tienda: TiendaEntity = await this.findTiendaById(tiendaId);

    const tiendaProducto: TiendaEntity = producto.tiendas.find(
      (entity: TiendaEntity) => entity.id === tienda.id,
    );
    if (!tiendaProducto) {
      throw new BusinessLogicException(
        'La tienda con el id dado no está asociado al producto con el id dado',
        BusinessError.PRECONDITION_FAILED,
      );
    }
    return tiendaProducto;
  }

  async updateStoresFromProduct(
    productoId: string,
    tiendas: TiendaEntity[],
  ): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.findProductoById(productoId);

    for (const tienda of tiendas) {
      await this.findTiendaById(tienda.id);
    }

    producto.tiendas = tiendas;
    return await this.productoRepository.save(producto);
  }

  async deleteStoreFromProduct(productoId: string, tiendaId: string) {
    const producto: ProductoEntity = await this.findProductoById(productoId);
    const tienda: TiendaEntity = await this.findTiendaById(tiendaId);

    const tiendaProducto: TiendaEntity = producto.tiendas.find(
      (entity: TiendaEntity) => entity.id === tienda.id,
    );

    if (!tiendaProducto) {
      throw new BusinessLogicException(
        'La tienda con el id dado no está asociado al producto con el id dado',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    producto.tiendas = producto.tiendas.filter(
      (entity: TiendaEntity) => entity.id !== tiendaId,
    );
    await this.productoRepository.save(producto);
  }

  private async findProductoById(productoId: string): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.productoRepository.findOne({
      where: { id: productoId },
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

  private async findTiendaById(tiendaId: string): Promise<TiendaEntity> {
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({
      where: { id: tiendaId },
    });
    if (!tienda) {
      throw new BusinessLogicException(
        'La tienda con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    }
    return tienda;
  }
}
