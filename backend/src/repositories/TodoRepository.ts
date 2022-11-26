import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { createLogger } from "../utils/logger";

export default class TodoRepository {
    private todosTable: string           =  process.env.TODOS_TABLE;
    private indexName: string            =  process.env.TODOS_CREATED_AT_INDEX; 
    private logger: any               =  createLogger('TodoRepository'); 

    constructor(private docClient: DocumentClient) {}

    async getTodos(userId: string): Promise<TodoItem[]> {
        this.logger.info('Performing query operation on todo table index');
        const result = await this.docClient.query({
          TableName: this.todosTable,
          IndexName: this.indexName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId' : userId
          }
        }).promise();
    
        const items = result.Items
    
        return items as TodoItem[]
    }

    async getTodo(userId: string, todoId: string): Promise<TodoItem> {
      this.logger.info('Performing query operation on todo table index');
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId, todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId' : userId,
          ':todoId' : todoId
        }
      }).promise();
  
      const item = result.Items[0]
  
      return item as TodoItem
  }
    
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      this.logger.info('Performing put operation on todo table');
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise()
  
      return todoItem;
    }
    
    async updateTodo(todoId: string, userId: string, todoItem: Partial<TodoUpdate>): Promise<TodoUpdate> {
      this.logger.info('Performing update operation on todo table');
      const updated = await this.docClient
          .update({
              TableName: this.todosTable,
              Key: { 
                userId,
                todoId 
              },
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

    async updateTodoAttachment(todoId: string, userId: string, attachmentUrl: string): Promise<any> {
      this.logger.info('Performing update attachment operation on todo table');
      const updated = await this.docClient
          .update({
              TableName: this.todosTable,
              Key: { userId, todoId },
              UpdateExpression: "set #attachmentUrl = :attachmentUrl",
              ExpressionAttributeNames: { "#attachmentUrl": "attachmentUrl" },
              ExpressionAttributeValues: {
                  ":attachmentUrl": attachmentUrl
              },
              ReturnValues: "ALL_NEW",
          })
          .promise();
      return updated.Attributes as any;
    }
  
    async deleteTodo(todoId: string, userId: string): Promise<any> {
      this.logger.info('Performing delete operation on todo table');
        return await this.docClient.delete({
            TableName: this.todosTable,
            Key: { 
              userId,
              todoId
            }
        }).promise();
    }
}