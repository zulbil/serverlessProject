import { todoRepository } from "../repositories";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import * as uuid from 'uuid';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate';


export default class TodoService {
    private bucketName: string = process.env.ATTACHMENT_S3_BUCKET;

    constructor() {}

    async getTodos(userId:string): Promise<TodoItem[]> {
        return await todoRepository.getTodos(userId);
    }
    
    async createTodo(
        createTodoRequest: CreateTodoRequest,
        jwtToken: string) : Promise<TodoItem> {
    
            const itemId            = uuid.v4();
            const userId            = jwtToken;
            const attachmentUrl     = `https://${this.bucketName}.s3.amazonaws.com/${itemId}`;
    
        return todoRepository.createTodo({
            todoId: itemId,
            userId: userId,
            name: createTodoRequest.name,
            dueDate: createTodoRequest.dueDate,
            createdAt: new Date().toISOString(),
            attachmentUrl,
            done: true
        })
    }
    
    async updateTodo(
        id: string,
        userId: string,
        updateTodoRequest: UpdateTodoRequest
        ) : Promise<TodoUpdate> {
        
            const todoItemToUpdate : Partial<TodoUpdate> = {
                name: updateTodoRequest.name,
                dueDate: updateTodoRequest.dueDate,
                done: updateTodoRequest.done
            };
    
        return await todoRepository.updateTodo(id, userId, todoItemToUpdate);
    }
    
    async deleteTodo(id: string, userId: string) {
        await todoRepository.deleteTodo(id, userId);
    }
}