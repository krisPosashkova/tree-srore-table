import type { TItem } from '@/utils/TreeStore/types.ts'

export type TProcessedItem = {
  path: string[]
} & TItem


export type THistoryAction = {
  type: 'add' | 'remove' | 'edit';
  data?: TItem | TItem[];
  oldValue?: string;
  undo: () => void;
  redo: () => void;
}


export const TABLE_HEADER_HEIGHT = 50;
export const TABLE_ITEM_HEIGHT = 42.1;
export const TYPE_GROUP = 'Группа';
export const TYPE_ELEMENT = 'Элемент';
export const HEADER_NAME_LABEL = 'Наименование';
export const HEADER_NAME_CATEGORY = 'Категория';
export const ACTIONS_HEADER_NAME = 'Действия'

export const LABEL_FILED = 'label'
