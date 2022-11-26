import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

export default class TodoRepository {
    private todosTable: string           = process.env.TODOS_TABLE;
    private indexName: string            = process.env.TODOS_CREATED_AT_INDEX; 

    constructor(private docClient: DocumentClient) {}

    async getTodos(userId: string): Promise<TodoItem[]> {

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
    
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise()
  
      return todoItem;
    }
    
    async updateTodo(todoId: string, userId: string, todoItem: Partial<TodoUpdate>): Promise<TodoUpdate> {
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
  
    async deleteTodo(todoId: string, userId: string): Promise<any> {
        return await this.docClient.delete({
            TableName: this.todosTable,
            Key: { 
              userId,
              todoId
            }
        }).promise();
    }
}