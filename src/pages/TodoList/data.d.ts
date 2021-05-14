export interface Task {
  title: string;
  steps?: TaskStep[];
  status: 'InProgress' | 'Done';
  important: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface TaskStep {
  title: string;
  status: 'InProgress' | 'Done';
}