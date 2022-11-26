import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { formatJSONResponse } from '../../utils/api-gateway'
import { getUserId } from './../utils';
import { todoService } from '../../services'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const jwtToken = getUserId(event);
      logger.info('Creating new todo');  
      const newItem = await todoService.createTodo(newTodo, jwtToken); 
      logger.info('New todo created :', { todo : newItem }); 
      const response = { item: newItem }; 
      return formatJSONResponse(response, 201);
    } catch (error: any) {
      logger.error('Creating new todo failed' , { error });  
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
