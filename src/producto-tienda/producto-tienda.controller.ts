import {
  Controller,
  Param,
  Body,
  HttpCode,
  Get,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ProductoTiendaService } from './producto-tienda.service';
import { TiendaDto } from 'src/tienda/tienda.dto';
import { TiendaEntity } from 'src/tienda/tienda.entity';
import { plainToInstance } from 'class-transformer';

@Controller('productos')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductoTiendaController {
  constructor(private readonly productoTiendaService: ProductoTiendaService) {}

  @Get(':productoId/tiendas')
  async findStoresFromProduct(@Param('productoId') productoId: string) {
    return await this.productoTiendaService.findStoresFromProduct(productoId);
  }

  @Get(':productoId/tiendas/:tiendaId')
  async findStoreFromProduct(
    @Param('productoId') productoId: string,
    @Param('tiendaId') tiendaId: string,
  ) {
    return await this.productoTiendaService.findStoreFromProduct(
      productoId,
      tiendaId,
    );
  }

  @Post(':productoId/tiendas/:tiendaId')
  async addStoreToProduct(
    @Param('productoId') productoId: string,
    @Param('tiendaId') tiendaId: string,
  ) {
    return await this.productoTiendaService.addStoreToProduct(
      productoId,
      tiendaId,
    );
  }

  @Put(':productoId/tiendas')
  async updateStoresFromProduct(
    @Param('productoId') productoId: string,
    @Body() tiendasDto: TiendaDto[],
  ) {
    const tiendas: TiendaEntity[] = plainToInstance(TiendaEntity, tiendasDto);
    return await this.productoTiendaService.updateStoresFromProduct(
      productoId,
      tiendas,
    );
  }

  @Delete(':productoId/tiendas/:tiendaId')
  @HttpCode(204)
  async deleteStoreFromProduct(
    @Param('productoId') productoId: string,
    @Param('tiendaId') tiendaId: string,
  ) {
    return await this.productoTiendaService.deleteStoreFromProduct(
      productoId,
      tiendaId,
    );
  }
}
