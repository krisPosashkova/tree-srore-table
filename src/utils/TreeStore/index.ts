import type { TItem } from '@/utils/TreeStore/types.ts'

export default class Index {
  private _items: TItem[] = [];
  private readonly itemsMapping: Map<number | string, TItem> = new Map();

  constructor(items: TItem[]) {
    this.actualWorkData = items;
  }

  private buildIdMap(): void {
    this.itemsMapping.clear();
    for (const item of this.actualWorkData) {
      this.itemsMapping.set(item.id, item);
    }
  }

  private get actualWorkData(): TItem[] {
    return this._items;
  }

  private set actualWorkData(newItems: TItem[]) {
    this._items = newItems;
    this.buildIdMap();
  }

  public getAll(): TItem[] {
    return this.actualWorkData;
  }

  public getItem(id: number | string): TItem | null {
    return this.itemsMapping.get(id) || null;
  }

  public getChildren(id: number | string): TItem[] {
    return this.actualWorkData.reduce<TItem[]>((acc, item) => {
      if (item.parent === id) acc.push(item);
      return acc;
    }, []);
  }

  public getAllChildren(id: number | string): TItem[] {
    const allChildren: TItem[] = [];
    const stack: TItem[] = this.getChildren(id);

    while (stack.length) {
      const child = stack.pop();

      if (child) {
        allChildren.push(child);
        const grandchildren = this.getChildren(child.id);
        stack.push(...grandchildren);
      }
    }

    return allChildren;
  }

  public getAllParents(id: number | string): TItem[] {
    const result: TItem[] = [];
    let currentItem = this.getItem(id);

    if (!currentItem) {
      return [];
    }

    // Add the current item itself to the result
    result.push(currentItem);

    while (currentItem.parent !== null) {
      const parentItem = this.getItem(currentItem.parent);
      if (!parentItem) {
        break;
      }

      // Add each parent to the beginning of the result array
      result.unshift(parentItem);
      currentItem = parentItem;
    }

    return result;
  }
  public addItem(item: TItem): void {
    this.actualWorkData = [...this.actualWorkData, item]
  }

  public removeItem(id: number | string): void {
    const itemsToRemove = [this.getItem(id), ...this.getAllChildren(id)]

    const idsToRemove = new Set(itemsToRemove.reduce<(number | string)[]>((acc, item) => {
      if (item?.id !== undefined) {
        acc.push(item.id);
      }

      return acc;
    }, []));

    if (!idsToRemove.size) return

    this.actualWorkData = this.actualWorkData.filter(item => !idsToRemove.has(item.id));
  }

  public updateItem(updatedItem: TItem): void {
    const index = this.actualWorkData.findIndex(item => item.id === updatedItem.id);

    if (index !== -1) {
      const newItems = [...this.actualWorkData]
      newItems[index] = updatedItem;


      this.actualWorkData = newItems
    }
  }
}
