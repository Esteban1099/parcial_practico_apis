import {
  Controller,
  UseInterceptors,
  Param,
  Body,
  HttpCode,
  Get,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { TiendaService } from './tienda.service';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { TiendaDto } from './tienda.dto';
import { TiendaEntity } from './tienda.entity';
import { plainToInstance } from 'class-transformer';

@Controller('tiendas')
@UseInterceptors(BusinessErrorsInterceptor)
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  @Get()
  async findAll() {
    return await this.tiendaService.findAll();
  }

  @Get(':tiendaId')
  async findOne(@Param('tiendaId') tiendaId: string) {
    return await this.tiendaService.findOne(tiendaId);
  }

  @Post()
  async create(@Body() tiendaDto: TiendaDto) {
    const producto: TiendaEntity = plainToInstance(TiendaEntity, tiendaDto);
    return await this.tiendaService.create(producto);
  }

  @Put(':tiendaId')
  async update(
    @Param('tiendaId') tiendaId: string,
    @Body() tiendaDto: TiendaDto,
  ) {
    const producto: TiendaEntity = plainToInstance(TiendaEntity, tiendaDto);
    return await this.tiendaService.update(tiendaId, producto);
  }

  @Delete(':tiendaId')
  @HttpCode(204)
  async delete(@Param('tiendaId') tiendaId: string) {
    return await this.tiendaService.delete(tiendaId);
  }
}
