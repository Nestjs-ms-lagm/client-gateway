import { Body, Controller, Get, Inject, Logger, Param, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { ORDER_SERVICE } from 'src/config';
import { CreateOrderDto } from './dto/create-order.dto';

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
  findAll() {
    this.logger.log('findAll');
    return this.ordersClient.send('findAllOrders', {})
      // .pipe(
      //   catchError(err => { throw new RpcException(err) })
      // )
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersClient.send('findOneOrder', { id })
      // .pipe(
      //   catchError(err => { throw new RpcException(err) })
      // )
  }
}
