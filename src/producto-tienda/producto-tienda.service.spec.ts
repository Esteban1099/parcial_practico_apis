import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config.t';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { ProductoTiendaService } from './producto-tienda.service';
import { faker } from '@faker-js/faker';

describe('ProductoTiendaService', () => {
  let service: ProductoTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let producto: ProductoEntity;
  let tiendas: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(
      getRepositoryToken(ProductoEntity),
    );
    tiendaRepository = module.get<Repository<TiendaEntity>>(
      getRepositoryToken(TiendaEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    productoRepository.clear();
    tiendaRepository.clear();
    tiendas = [];
    for (let i: number = 0; i < 5; i++) {
      const producto: TiendaEntity = await tiendaRepository.save({
        nombre: faker.company.name(),
        ciudad: faker.helpers.arrayElement(['BOG', 'MED', 'CTG']),
        direccion: faker.company.name(),
      });
      tiendas.push(producto);
    }
    producto = await productoRepository.save({
      nombre: faker.company.name(),
      precio: faker.number.int({ max: 1000 }),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
      tiendas: tiendas,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addStoreToProduct debe asociar una tienda a un producto', async () => {
    const productoNuevo: ProductoEntity = await productoRepository.save({
      nombre: faker.company.name(),
      precio: faker.number.int({ max: 1000 }),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
    });
    const tiendaNueva: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.helpers.arrayElement(['BOG', 'MED', 'CTG']),
      direccion: faker.company.name(),
    });

    const result: ProductoEntity = await service.addStoreToProduct(
      productoNuevo.id,
      tiendaNueva.id,
    );

    expect(result).not.toBeNull();
    expect(result.nombre).toBe(productoNuevo.nombre);
    expect(result.precio).toBe(productoNuevo.precio);
    expect(result.tipo).toStrictEqual(productoNuevo.tipo);
    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(tiendaNueva.nombre);
    expect(result.tiendas[0].ciudad).toBe(tiendaNueva.ciudad);
    expect(result.tiendas[0].direccion).toBe(tiendaNueva.direccion);
  });

  it('addStoreToProduct debe lanzar una excepción para un producto no valido', async () => {
    await expect(() =>
      service.addStoreToProduct('0', tiendas[0].id),
    ).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no fue encontrado',
    );
  });

  it('addStoreToProduct debe lanzar una excepción para una tienda no valida', async () => {
    await expect(() =>
      service.addStoreToProduct(producto.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no fue encontrada',
    );
  });

  it('findStoresFromProduct debe retornar todas las tiendas de un producto', async () => {
    const result: TiendaEntity[] = await service.findStoresFromProduct(
      producto.id,
    );
    expect(result).not.toBeNull();
    expect(result.length).toBe(tiendas.length);
  });

  it('findStoresFromProduct debe lanzar una excepción para un producto no valido', async () => {
    await expect(() =>
      service.findStoresFromProduct('0'),
    ).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no fue encontrado',
    );
  });

  it('findStoreFromProduct debe retornar una tienda de un producto', async () => {
    const result: TiendaEntity = await service.findStoreFromProduct(
      producto.id,
      tiendas[0].id,
    );
    expect(result).not.toBeNull();
    expect(result.nombre).toBe(tiendas[0].nombre);
    expect(result.ciudad).toBe(tiendas[0].ciudad);
    expect(result.direccion).toBe(tiendas[0].direccion);
  });

  it('findStoreFromProduct debe lanzar una excepción para un producto no valido', async () => {
    await expect(() =>
      service.findStoreFromProduct('0', tiendas[0].id),
    ).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no fue encontrado',
    );
  });

  it('findStoreFromProduct debe lanzar una excepción para una tienda no valida', async () => {
    await expect(() =>
      service.findStoreFromProduct(producto.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no fue encontrada',
    );
  });

  it('findStoreFromProduct debe lanzar una excepción para una tienda no asociada', async () => {
    const tiendaNueva: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.helpers.arrayElement(['BOG', 'MED', 'CTG']),
      direccion: faker.company.name(),
    });
    await expect(() =>
      service.findStoreFromProduct(producto.id, tiendaNueva.id),
    ).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no está asociado al producto con el id dado',
    );
  });

  it('updateStoresFromProduct debe actualizar una tienda a un producto', async () => {
    const tiendaNueva: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.helpers.arrayElement(['BOG', 'MED', 'CTG']),
      direccion: faker.company.name(),
    });
    const result: ProductoEntity = await service.updateStoresFromProduct(
      producto.id,
      [tiendaNueva],
    );
    expect(result).not.toBeNull();
    expect(result.nombre).toBe(producto.nombre);
    expect(result.precio).toBe(producto.precio);
    expect(result.tipo).toStrictEqual(producto.tipo);
    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(tiendaNueva.nombre);
    expect(result.tiendas[0].ciudad).toBe(tiendaNueva.ciudad);
    expect(result.tiendas[0].direccion).toBe(tiendaNueva.direccion);
  });

  it('updateStoresFromProduct debe lanzar una excepción para un producto no valido', async () => {
    await expect(() =>
      service.updateStoresFromProduct('0', null),
    ).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no fue encontrado',
    );
  });

  it('updateStoresFromProduct debe lanzar una excepción para una tienda no valida', async () => {
    const tienda: Partial<TiendaEntity> = {
      id: '0',
    };
    await expect(() =>
      service.updateStoresFromProduct(producto.id, [tienda as TiendaEntity]),
    ).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no fue encontrada',
    );
  });

  it('deleteStoreFromProduct debe eliminar una tienda de un producto', async () => {
    const tienda: TiendaEntity = tiendas[0];

    await service.deleteStoreFromProduct(producto.id, tienda.id);

    const productoGuardado: ProductoEntity = await productoRepository.findOne({
      where: { id: producto.id },
      relations: ['tiendas'],
    });
    const tiendaEliminada: TiendaEntity = productoGuardado.tiendas.find(
      (entity: TiendaEntity) => entity.id === tienda.id,
    );
    expect(tiendaEliminada).toBeUndefined();
  });

  it('deleteStoreFromProduct debe lanzar una excepción para un producto no valido', async () => {
    await expect(() =>
      service.deleteStoreFromProduct('0', tiendas[0].id),
    ).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no fue encontrado',
    );
  });

  it('deleteStoreFromProduct debe lanzar una excepción para una tienda no valida', async () => {
    await expect(() =>
      service.deleteStoreFromProduct(producto.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no fue encontrada',
    );
  });

  it('deleteStoreFromProduct debe lanzar una excepción para una tienda no asociada', async () => {
    const tiendaNueva: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.helpers.arrayElement(['BOG', 'MED', 'CTG']),
      direccion: faker.company.name(),
    });
    await expect(() =>
      service.deleteStoreFromProduct(producto.id, tiendaNueva.id),
    ).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no está asociado al producto con el id dado',
    );
  });
});
