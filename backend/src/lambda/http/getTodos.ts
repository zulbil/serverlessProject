import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { formatJSONResponse } from '../../utils/api-gateway'
import { getUserId } from '../utils'
import { todoRepository } from '../../repositories';

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const userId = getUserId(event);
      const todos = await todoRepository.getTodos(userId);
      logger.info('Get Todos API from DynamoDB Table', { todos });      
      const response = { items : todos };
      return formatJSONResponse(response);
    } catch (error: any) {
      logger.error('Get Todos failed' , { error });  
      return formatJSONResponse({
        message: error.message
      }, 500)
    }
  }  
)

handler.use(
  cors({
    credentials: true
  })
)
