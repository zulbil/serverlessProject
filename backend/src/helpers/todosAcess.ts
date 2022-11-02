import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.GROUPS_TABLE) {
  }

  async getTodos(): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient.scan({
      TableName: this.todosTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async updateTodo(id: string, group: Partial<TodoItem>): Promise<TodoItem> {
    const updated = await this.docClient
        .update({
            TableName: this.todosTable,
            Key: { id },
            UpdateExpression:
                "set #name = :name, #description = :description",
            ExpressionAttributeNames: {
                "#name": "name",
                "#description": "description"
            },
            ExpressionAttributeValues: {
                ":name": group.name,
                ":description": group.description
            },
            ReturnValues: "ALL_NEW",
        })
        .promise();
    return updated.Attributes as Group;
}

  async deleteTodo(id: string): Promise<any> {
    return await this.docClient.delete({
        TableName: this.todosTable,
        Key: { id }
    }).promise();
}
}

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