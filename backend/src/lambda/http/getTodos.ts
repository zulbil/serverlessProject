import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { formatJSONResponse } from '../../utils/api-gateway'

import { getTodos as getTodosForUser} from './../../helpers/todos';

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Get Todos API call' , { event });
    try {
      const todos = await getTodosForUser()
      logger.info('Get Todos API call' , { todos });
      const response = { items :todos };
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
