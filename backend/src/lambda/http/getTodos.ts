import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { formatJSONResponse } from '../../utils/api-gateway'
import { getUserId } from '../utils'
import { getTodos } from './../../helpers/todos';

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Get Todos API call Event ' , { event });
    try {
      
      const userId = getUserId(event);
      logger.info('Get Todos API call Event ' , { userId });
      const todos = await getTodos(userId);
      logger.info('Get Todos API call' , { todos });      
      const response = { items : todos };
      return formatJSONResponse(response);
    } catch (error: any) {
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
