import { Body, Controller, Delete, Get, Inject, Logger, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { PaginationDto } from 'src/common';
import { PRODUCT_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  private readonly logger: Logger = new Logger('ProductsController');
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy
  ) { }

  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto
  ) {
    this.logger.log('Begin createProduct with product: ', { createProductDto });
    return this.productsClient.send({ cmd: 'create' }, createProductDto)
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );

  }

  @Get()
  findAllProducts(
    @Query() paginationDto: PaginationDto
  ) {
    this.logger.log('findAllProducts: ', { paginationDto });
    return this.productsClient.send({ cmd: 'find_all' }, paginationDto)
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string
  ) {
    return this.productsClient.send({ cmd: "find_one" }, { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      )
  }

  @Delete(':id')
  deleteProduct(
    @Param('id', ParseIntPipe) id: number
  ) {
    this.logger.log('Begin deleteProduct...', { id });
    return this.productsClient.send({ cmd: 'delete' }, { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      )
  }

  @Patch(':id')
  patchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    this.logger.log('Begin patchProduct...', { id, updateProductDto });
    return this.productsClient.send({ cmd: 'update' }, {
      id,
      ...updateProductDto
    })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      )
  }
}
