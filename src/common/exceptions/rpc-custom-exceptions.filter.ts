import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {

  catch(exception: RpcException, host: ArgumentsHost) {
    console.log('Begin RpcCustomExceptionFilter catch...');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rpcError = exception.getError();
    console.log({rpcError});

    if (
      typeof rpcError === 'object' && 
      'status' in rpcError && 
      'message' in rpcError
    ) {
      // const status = rpcError.status;
      const status = isNaN(+rpcError.status) ? 400 : +rpcError.status;
      return response.status(status).json(rpcError)
    }
    
    response.status(400).json({
      status: 400,
      message: rpcError
    });
  }
}