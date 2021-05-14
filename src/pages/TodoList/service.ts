import request from 'umi-request';
import type { Task, TaskStep } from './data.d';

export async function queryFakeTodoList(params: any) {
  return request('/api/fake_todo_list', {
    params,
  });
}