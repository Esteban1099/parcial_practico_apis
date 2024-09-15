import { Injectable } from '@nestjs/common';
import { TiendaEntity } from './tienda.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';

@Injectable()
export class TiendaService {
  constructor(
    @InjectRepository(TiendaEntity)
    private readonly repository: Repository<TiendaEntity>,
  ) {}

  async findAll(): Promise<TiendaEntity[]> {
    return await this.repository.find({
      relations: ['productos'],
    });
  }

  async findOne(id: string): Promise<TiendaEntity> {
    const tienda: TiendaEntity = await this.repository.findOne({
      where: { id },
      relations: ['productos'],
    });
    if (!tienda) {
      throw new BusinessLogicException(
        'La tienda con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    }
    return tienda;
  }

  async create(tienda: TiendaEntity): Promise<TiendaEntity> {
    const formatoCiudad = /^[A-Z]{3}$/;
    if (!formatoCiudad.test(tienda.ciudad)) {
      throw new BusinessLogicException(
        'La ciudad debe ser un código de 3 caracteres mayusculas',
        BusinessError.BAD_REQUEST,
      );
    }
    return await this.repository.save(tienda);
  }

  async update(id: string, tienda: TiendaEntity): Promise<TiendaEntity> {
    const tiendaGuardada: TiendaEntity = await this.repository.findOne({
      where: { id },
    });
    if (!tiendaGuardada) {
      throw new BusinessLogicException(
        'La tienda con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    }
    const formatoCiudad = /^[A-Z]{3}$/;
    if (!formatoCiudad.test(tienda.ciudad)) {
      throw new BusinessLogicException(
        'La ciudad debe ser un código de 3 caracteres mayusculas',
        BusinessError.BAD_REQUEST,
      );
    }
    tienda.id = id;
    return await this.repository.save({
      ...tiendaGuardada,
      ...tienda,
    });
  }

  async delete(id: string) {
    const tiendaGuardada: TiendaEntity = await this.repository.findOne({
      where: { id },
    });
    if (!tiendaGuardada) {
      throw new BusinessLogicException(
        'La tienda con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    }
    return await this.repository.remove(tiendaGuardada);
  }
}
