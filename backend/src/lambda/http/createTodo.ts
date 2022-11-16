import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../helpers/todos'
import { formatJSONResponse } from '../../utils/api-gateway'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]; 

    const newItem = await createTodo(newTodo, jwtToken); 
    const response = { item: newItem }; 

    return formatJSONResponse(response, 201);

  }
)

handler.use(
  cors({
    credentials: true
  })
)
