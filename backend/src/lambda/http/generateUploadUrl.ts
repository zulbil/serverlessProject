import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { createAttachmentPresignedUrl } from '../../helpers/attachmentUtils'
import { formatJSONResponse } from '../../utils/api-gateway'
import { getUserId } from '../utils'
import { todoService } from '../../services'

const logger = createLogger('generatedUpload')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const attachmentUrl = createAttachmentPresignedUrl(todoId); 
      const userId = getUserId(event);
      await todoService.updateTodoAttachmentUrl(todoId, userId);
      logger.info('Generating presigned url'); 
      return formatJSONResponse({ uploadUrl : attachmentUrl });
    } catch (error: any) {
      logger.error('Generating presign url failed', {error}); 
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
