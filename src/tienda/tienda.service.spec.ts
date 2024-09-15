import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config.t';
import { TiendaEntity } from './tienda.entity';
import { TiendaService } from './tienda.service';
import { faker } from '@faker-js/faker';

describe('TiendaService', () => {
  let service: TiendaService;
  let repository: Repository<TiendaEntity>;
  let tiendas: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TiendaService],
    }).compile();

    service = module.get<TiendaService>(TiendaService);
    repository = module.get<Repository<TiendaEntity>>(
      getRepositoryToken(TiendaEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    tiendas = [];
    for (let i: number = 0; i < 5; i++) {
      const producto: TiendaEntity = await repository.save({
        nombre: faker.company.name(),
        ciudad: faker.helpers.arrayElement(['BOG', 'MED', 'CTG']),
        direccion: faker.company.name(),
        productos: [],
      });
      tiendas.push(producto);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todas las tiendas', async () => {
    const tiendasSolicitadas: TiendaEntity[] = await service.findAll();
    expect(tiendasSolicitadas).not.toBeNull();
    expect(tiendasSolicitadas).toHaveLength(tiendas.length);
  });

  it('findOne debe retornar una tienda por id', async () => {
    const tienda: TiendaEntity = tiendas[0];
    const tiendaSolicitada: TiendaEntity = await service.findOne(tienda.id);
    expect(tiendaSolicitada).not.toBeNull();
    expect(tiendaSolicitada.nombre).toEqual(tienda.nombre);
    expect(tiendaSolicitada.ciudad).toEqual(tienda.ciudad);
    expect(tiendaSolicitada.direccion).toEqual(tienda.direccion);
  });

  it('findOne debe lanzar una excepción para una tienda no valida', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no fue encontrada',
    );
  });

  it('create debe retornar una nueva tienda', async () => {
    const tienda: TiendaEntity = {
      id: '',
      nombre: faker.company.name(),
      ciudad: faker.helpers.arrayElement(['BOG', 'MED', 'CTG']),
      direccion: faker.company.name(),
      productos: [],
    };

    const nuevaTienda: TiendaEntity = await service.create(tienda);
    expect(nuevaTienda).not.toBeNull();

    const tiendaGuardada: TiendaEntity = await repository.findOne({
      where: { id: nuevaTienda.id },
    });
    expect(tiendaGuardada).not.toBeNull();
    expect(tiendaGuardada.nombre).toEqual(nuevaTienda.nombre);
    expect(tiendaGuardada.ciudad).toEqual(nuevaTienda.ciudad);
    expect(tiendaGuardada.direccion).toEqual(nuevaTienda.direccion);
  });

  it('update debe modificar una tienda', async () => {
    const tienda: TiendaEntity = tiendas[0];
    tienda.nombre = faker.company.name();
    tienda.ciudad = faker.helpers.arrayElement(['BOG', 'MED', 'CTG']);
    tienda.direccion = faker.company.name();
    const tiendaActualizada: TiendaEntity = await service.update(
      tienda.id,
      tienda,
    );
    expect(tiendaActualizada).not.toBeNull();
    const tiendaGuardada: TiendaEntity = await repository.findOne({
      where: { id: tienda.id },
    });
    expect(tiendaGuardada).not.toBeNull();
    expect(tiendaGuardada.nombre).toEqual(tienda.nombre);
    expect(tiendaGuardada.ciudad).toEqual(tienda.ciudad);
    expect(tiendaGuardada.direccion).toEqual(tienda.direccion);
  });

  it('update debe lanzar una excepción para una tienda no valida', async () => {
    await expect(() => service.update('0', null)).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no fue encontrada',
    );
  });

  it('delete debe quitar una tienda', async () => {
    const tienda: TiendaEntity = tiendas[0];
    await service.delete(tienda.id);
    const tiendaEliminada: TiendaEntity = await repository.findOne({
      where: { id: tienda.id },
    });
    expect(tiendaEliminada).toBeNull();
  });

  it('delete debe lanzar una excepción para una tienda no valida', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no fue encontrada',
    );
  });
});
