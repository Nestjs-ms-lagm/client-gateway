import { Body, Controller, Get, Inject, Logger, NotImplementedException, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { ORDER_SERVICE } from 'src/config';
import { OrderPaginationDto } from './dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './enum/order.enum';
import { PaginationDto } from 'src/common';
import { StatusDto } from './dto/status.dto';

@Controller('orders')
export class OrdersController {
  private readonly logger: Logger = new Logger('OrdersController');

  constructor(
    @Inject(ORDER_SERVICE) private readonly ordersClient: ClientProxy
  ) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log('Begin createOrder with order: ', { createOrderDto });
    return this.ordersClient.send('createOrder', createOrderDto)
      .pipe(catchError(err => { throw new RpcException(err) }))
  }

  @Get()
  findAll(
    @Query() orderPaginationDto: OrderPaginationDto
  ) {
    this.logger.log('findAll with paginationDto', { orderPaginationDto });
    return this.ordersClient.send('findAllOrders', orderPaginationDto)
    // .pipe(
    //   catchError(err => { throw new RpcException(err) })
    // )
  }

  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      this.logger.log('findAllByStatus with ', { statusDto, paginationDto });
      return this.ordersClient.send('findAllOrders', {
        ...paginationDto,
        status: statusDto.status
      });

    } catch (error) {
      throw new RpcException(error);
    }
  }

  // @Get(':id')
  // findOne(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.ordersClient.send('findOneOrder', { id })
  //     .pipe(
  //       catchError(err => { throw new RpcException(err) })
  //     )
  // }

  @Get('/id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const order = await firstValueFrom(this.ordersClient.send("findOneOrder", { id }));
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() changeStatus: ChangeStatusDto
  ) {
    return this.ordersClient.send('changeOrderStatus', {
      id, status: changeStatus.status
    })
      .pipe(catchError(err => { throw new RpcException(err) }));
  }

  @Patch('/v2/:id')
  changeStatus2(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status', new ParseEnumPipe(OrderStatus))
    status: OrderStatus
  ) {
    this.logger.log('changeStatusv2', {
      id, status
    });
    return this.ordersClient.send('changeOrderStatus', {
      id, status
    })
      .pipe(
        catchError(err => {
          this.logger.error(err);
          throw new RpcException(err)
        })
      );
  }

  @Patch('/v3/:id')
  changeStatus3(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {
    try {
      this.logger.log('changeStatusv3', {
        id, status: statusDto.status
      });
      return this.ordersClient.send('changeOrderStatus3', {
        id,
        status: statusDto.status
      })
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
