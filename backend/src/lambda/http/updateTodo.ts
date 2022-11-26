import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { formatJSONResponse } from '../../utils/api-gateway'
import { getUserId } from './../utils';
import { todoService } from '../../services'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      const userId = getUserId(event);
      logger.info('Updating Todo with Id', {id : todoId })
      const updatedItem = await todoService.updateTodo(todoId, userId, updatedTodo);
      const response = {
        item : updatedItem
      };
      logger.info('Todo updated successfully with Id', {id : todoId })
      return formatJSONResponse(response);
    } catch (error: any) {
      logger.error('Updating todo failed', { error });  
      return formatJSONResponse({
        message: error.message
      }, 500)
    }
    
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
