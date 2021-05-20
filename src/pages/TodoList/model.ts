import type { Effect, Reducer } from 'umi';
import {  queryFakeTodoList } from './service';
import type { Task, TaskStep } from './data.d';

export interface StateType {
  list: Task[];
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
    appendFetch: Effect;
    addTodo: Effect;
    markItemStatus: Effect;
    markItemImportant: Effect;
    // submit: Effect;
  };
  reducers: {
    queryList: Reducer<StateType>;
    appendList: Reducer<StateType>;
    addTodoItem: Reducer<StateType>;
    markItemStatusReducer: Reducer<StateType>;
    markItemAsImportant: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'todoList',

  state: {
    list: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryFakeTodoList, payload);
      yield put({
        type: 'queryList',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *appendFetch({ payload }, { call, put }) {
      const response = yield call(queryFakeTodoList, payload);
      yield put({
        type: 'appendList',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *addTodo({ payload }, { call, put }) {
      yield put({
        type: 'addTodoItem',
        payload: payload
      });
    },
    *markItemStatus({ payload }, { call, put }) {
      yield put({
        type: 'markItemStatusReducer',
        payload: payload
      });
    },
    *markItemImportant({ payload }, { call, put }) {
      yield put({
        type: 'markItemAsImportant',
        payload: payload
      });
    },
    // *submit({ payload }, { call, put }) {
    //   let callback;
    //   if (payload.id) {
    //     callback = Object.keys(payload).length === 1 ? removeFakeList : updateFakeList;
    //   } else {
    //     callback = addFakeList;
    //   }
    //   const response = yield call(callback, payload); // post
    //   yield put({
    //     type: 'queryList',
    //     payload: response,
    //   });
    // },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    appendList(state = { list: [] }, action) {
      return {
        ...state,
        list: state.list.concat(action.payload),
      };
    },
    addTodoItem(state = { list: [] }, action) {
      state.list.splice(0, 0, action.payload);
      // const newList = state.list.splice(0, 0, action.payload);
      return {
        ...state,
        list: state.list,
      }
    },
    markItemStatusReducer(state = { list: [] }, action) {
      let marked = state.list.slice();
      marked[action.payload].status = marked[action.payload].status  === 'InProgress' ? 'Done' : 'InProgress';
      marked.sort((a, b) => b.status.length - a.status.length);
      return {
        ...state,
        list: marked
      }
    },
    markItemAsImportant(state = { list: []}, action) {
      let marked = state.list.slice();
      marked[action.payload].important = !marked[action.payload].important;
      return {
        ...state,
        list: marked
      }
    },
  },
};

export default Model;