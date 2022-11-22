import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk-core'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}


export class TodoAccess {

  private todosTable: string          = process.env.TODOS_TABLE; 
  private docClient: DocumentClient   = createDynamoDBClient(); 
  private indexName: string           = process.env.TODOS_CREATED_AT_INDEX; 

  constructor() {}

  async getTodos(userId: string): Promise<TodoItem[]> {

    // const result = await this.docClient.query({
    //   TableName: this.todosTable,
    //   IndexName: this.indexName,
    //   KeyConditionExpression: 'userId = :userId',
    //   ExpressionAttributeValues: {
    //     ':userId' : userId
    //   }
    // }).promise();

    const result = {
      Items: []
    };

    const items = result.Items

    logger.info('Get Todos API call' , { userId, indexName: this.indexName }); 

    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem;
  }

  async updateTodo(id: string, todoItem: Partial<TodoUpdate>): Promise<TodoUpdate> {
    const updated = await this.docClient
        .update({
            TableName: this.todosTable,
            Key: { id },
            UpdateExpression:
                "set #name = :name, #dueDate = :dueDate, #done = :done",
            ExpressionAttributeNames: {
                "#name": "name",
                "#dueDate": "dueDate",
                "#done": "done"
            },
            ExpressionAttributeValues: {
                ":name": todoItem.name,
                ":dueDate": todoItem.dueDate,
                ":done": todoItem.done
            },
            ReturnValues: "ALL_NEW",
        })
        .promise();
    return updated.Attributes as TodoUpdate;
  }

  async deleteTodo(id: string): Promise<any> {
      return await this.docClient.delete({
          TableName: this.todosTable,
          Key: { id }
      }).promise();
  }
}