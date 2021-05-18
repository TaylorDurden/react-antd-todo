import type { Request, Response } from 'express';
import type { Task, TaskStep } from './data.d';

const todoListDataSource:Task[] = [
  {
    id: "11111",
    title: '语雀的天空',
    status: 'InProgress',
    important: false,
    steps: [],
    startDate: new Date(),
  },
  {
    id: "22222",
    title: 'Ant Design',
    status: 'InProgress',
    important: false,
    steps: [],
    startDate: new Date(),
  },
  {
    id: "33333",
    title: '蚂蚁金服体验科技',
    status: 'InProgress',
    important: true,
    steps: [],
    startDate: new Date(),
  },
  {
    id: "44444",
    title: 'TechUI',
    status: 'Done',
    important: false,
    steps: [],
    startDate: new Date(),
  },
];

function getFakeTodoList(req: Request, res: Response){
  const params = req.query as any;

  const count = params.count * 1 || 20;
  const result = todoListDataSource;
  return res.json(result);
}

export default {
  'GET  /api/fake_todo_list': getFakeTodoList,
};