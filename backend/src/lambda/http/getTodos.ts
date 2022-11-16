import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { formatJSONResponse } from '../../utils/api-gateway'

import { getTodos as getTodosForUser} from './../../helpers/todos';


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log('GET TODO EVENT :',event);
    
    try {
      const todos = await getTodosForUser()
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
