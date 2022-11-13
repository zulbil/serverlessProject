import { TodoAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todoAccess = new TodoAccess();

export async function getTodos(): Promise<TodoItem[]> {
    return todoAccess.getTodos();
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string) : Promise<TodoItem> {

        const itemId = uuid.v4();
        //const userId = getUserId(jwtToken);
        const userId = ''

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