import { TodoAccess } from './todosAcess'
//import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
//import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todoAccess = new TodoAccess();

export async function getTodos(userId:string): Promise<TodoItem[]> {
    //return await todoAccess.getTodos(userId);
    console.log(userId);
    return [];
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string) : Promise<TodoItem> {

        const itemId = uuid.v4();
        const userId = parseUserId(jwtToken);

    return todoAccess.createTodo({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        attachmentUrl: '',
        done: true
    })
}

export async function updateTodo(
    id: string,
    updateTodoRequest: UpdateTodoRequest
    ) : Promise<TodoUpdate> {
    
        const todoItemToUpdate : Partial<TodoUpdate> = {
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done
        };

    return await todoAccess.updateTodo(id, todoItemToUpdate);
}

export async function deleteTodo(id: string) {
    await todoAccess.deleteTodo(id);
}