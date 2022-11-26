import { todoRepository } from "../repositories";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import * as uuid from 'uuid';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate';
import { createLogger } from "../utils/logger";

export default class TodoService {

    private logger: any = createLogger('todoService')
    private bucketName: string = process.env.ATTACHMENT_S3_BUCKET;

    constructor() {}

    async getTodos(userId:string): Promise<TodoItem[]> {
        this.logger.info('Get todos for connected user');
        return await todoRepository.getTodos(userId);
    }

    async getTodo(userId:string, todoId:string): Promise<TodoItem> {
        this.logger.info('Get one todo for connected user');
        return await todoRepository.getTodo(userId, todoId);
    }
    
    async createTodo(
        createTodoRequest: CreateTodoRequest,
        jwtToken: string) : Promise<TodoItem> {
        
        try {

            const itemId            = uuid.v4();
            const userId            = jwtToken;

            this.logger.info('Creating new todo');

            const todoTocreate = {
                todoId: itemId,
                userId: userId,
                name: createTodoRequest.name,
                dueDate: createTodoRequest.dueDate,
                createdAt: new Date().toISOString(),
                attachmentUrl: '',
                done: false
            };

            if (!todoTocreate.name) {
                this.logger.info('Name property is invalid');
                throw new Error('Please provide a valid name');
            }
        
            return todoRepository.createTodo(todoTocreate);
        } catch (error: any) {
            this.logger.error(error.message);
            throw new Error(error.message);
        }
        
    }
    
    async updateTodo(
        id: string,
        userId: string,
        updateTodoRequest: UpdateTodoRequest
        ) : Promise<TodoUpdate> {
        
        try {
            this.logger.info('Updating todo');

            const todoItemToUpdate : Partial<TodoUpdate> = {
                name: updateTodoRequest.name,
                dueDate: updateTodoRequest.dueDate,
                done: updateTodoRequest.done
            };

            if (!todoItemToUpdate.name) {
                this.logger.info('Name property is invalid');
                throw new Error('Name property is invalid!');
            }
            return await todoRepository.updateTodo(id, userId, todoItemToUpdate);
        } catch (error:any) {
            this.logger.error(error.message);
            throw new Error(error.message);
        }
    }

    async updateTodoAttachmentUrl(
        id: string,
        userId: string
        ) : Promise<TodoUpdate> {
        
        try {
            this.logger.info('Updating todo');
            const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${id}`;
            return await todoRepository.updateTodoAttachment(id, userId, attachmentUrl);
        } catch (error:any) {
            this.logger.error(error.message);
            throw new Error(error.message);
        }
    }
    
    async deleteTodo(id: string, userId: string) {
        this.logger.info('Deleting todo');
        await todoRepository.deleteTodo(id, userId);
    }
}