export type ColumnId = 'todo' | 'in-progress' | 'done';

export interface Card {
  id: string;
  columnId: ColumnId;
  title: string;
}

export interface Column {
  id: ColumnId;
  title: string;
}
