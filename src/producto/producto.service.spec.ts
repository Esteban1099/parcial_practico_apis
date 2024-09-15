import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config.t';
import { ProductoEntity } from './producto.entity';
import { ProductoService } from './producto.service';
import { faker } from '@faker-js/faker';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: Repository<ProductoEntity>;
  let productos: ProductoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoService],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<Repository<ProductoEntity>>(
      getRepositoryToken(ProductoEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    productos = [];
    for (let i: number = 0; i < 5; i++) {
      const producto: ProductoEntity = await repository.save({
        nombre: faker.company.name(),
        precio: faker.number.int({ max: 1000 }),
        tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
        tiendas: [],
      });
      productos.push(producto);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todos los productos', async () => {
    const productosSolicitados: ProductoEntity[] = await service.findAll();
    expect(productosSolicitados).not.toBeNull();
    expect(productosSolicitados).toHaveLength(productos.length);
  });

  it('findOne debe retornar un producto por id', async () => {
    const producto: ProductoEntity = productos[0];
    const productoSolicitado: ProductoEntity = await service.findOne(
      producto.id,
    );
    expect(productoSolicitado).not.toBeNull();
    expect(productoSolicitado.nombre).toEqual(producto.nombre);
    expect(productoSolicitado.precio).toEqual(producto.precio);
    expect(productoSolicitado.tipo).toEqual(producto.tipo);
  });

  it('findOne debe lanzar una excepción para un producto no valido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no fue encontrado',
    );
  });

  it('create debe retornar un nuevo producto', async () => {
    const producto: ProductoEntity = {
      id: '',
      nombre: faker.company.name(),
      precio: faker.number.int({ max: 1000 }),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
      tiendas: [],
    };

    const nuevoProducto: ProductoEntity = await service.create(producto);
    expect(nuevoProducto).not.toBeNull();

    const productoGuardado: ProductoEntity = await repository.findOne({
      where: { id: nuevoProducto.id },
    });
    expect(productoGuardado).not.toBeNull();
    expect(productoGuardado.nombre).toEqual(nuevoProducto.nombre);
    expect(productoGuardado.precio).toEqual(nuevoProducto.precio);
    expect(productoGuardado.tipo).toEqual(nuevoProducto.tipo);
  });

  it('update debe modificar un producto', async () => {
    const producto: ProductoEntity = productos[0];
    producto.nombre = faker.company.name();
    producto.precio = faker.number.int({ max: 1000 });
    producto.tipo = faker.helpers.arrayElement(['Perecedero', 'No perecedero']);
    const productoActualizado: ProductoEntity = await service.update(
      producto.id,
      producto,
    );
    expect(productoActualizado).not.toBeNull();
    const productoGuardado: ProductoEntity = await repository.findOne({
      where: { id: producto.id },
    });
    expect(productoGuardado).not.toBeNull();
    expect(productoGuardado.nombre).toEqual(producto.nombre);
    expect(productoGuardado.precio).toEqual(producto.precio);
    expect(productoGuardado.tipo).toEqual(producto.tipo);
  });

  it('update debe lanzar una excepción para un producto no valido', async () => {
    await expect(() => service.update('0', null)).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no fue encontrado',
    );
  });

  it('delete debe quitar un producto', async () => {
    const producto: ProductoEntity = productos[0];
    await service.delete(producto.id);
    const productoEliminado: ProductoEntity = await repository.findOne({
      where: { id: producto.id },
    });
    expect(productoEliminado).toBeNull();
  });

  it('delete debe lanzar una excepción para un producto no valido', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no fue encontrado',
    );
  });
});
