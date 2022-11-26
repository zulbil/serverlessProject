import dynamoDBClient from "./database";
import TodoRepository from "./TodoRepository";

export const todoRepository = new TodoRepository(dynamoDBClient());