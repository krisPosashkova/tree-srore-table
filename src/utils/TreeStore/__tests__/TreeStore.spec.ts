import { describe, it, expect, beforeEach } from 'vitest'


import Index from '../index'
import { TEST_DATA_ITEMS } from './testData'

describe('TreeStore', () => {
  let storeInstance: Index

  beforeEach(() => {
    storeInstance = new Index(TEST_DATA_ITEMS)
  })

  describe('getAll', () => {
    it('should return the initial array of elements', () => {
      expect(storeInstance.getAll()).toEqual(TEST_DATA_ITEMS)
    })
  })

  describe('getItem', () => {
    it('should return the item with the specified id', () => {
      expect(storeInstance.getItem(7)).toEqual({ id: 7, parent: 4, label: 'Айтем 7' })
    })

    it('should return null for non-existent id', () => {
      expect(storeInstance.getItem(100)).toBeNull()
    })
  })

  describe('getChildren', () => {
    it('should return an array of children for the specified id', () => {
      expect(storeInstance.getChildren(4)).toEqual([
        { id: 7, parent: 4, label: 'Айтем 7' },
        { id: 8, parent: 4, label: 'Айтем 8' }
      ])
    })

    it('should return an empty array for id with no children', () => {
      expect(storeInstance.getChildren(8)).toEqual([])
    })
  })

  describe('getAllChildren', () => {
    it('should return an array of all children for the specified id', () => {
      expect(storeInstance.getAllChildren('2')).toEqual([
        { id: 6, parent: '2', label: 'Айтем 6' },
        { id: 5, parent: '2', label: 'Айтем 5' },
        { id: 4, parent: '2', label: 'Айтем 4' },
        { id: 8, parent: 4, label: 'Айтем 8' },
        { id: 7, parent: 4, label: 'Айтем 7' }
      ])
    })

    it('should return an empty array for id with no children', () => {
      expect(storeInstance.getAllChildren(7)).toEqual([])
    })
  })

  describe('getAllParents', () => {
    it('should return an array of all parents for the specified id', () => {
      expect(storeInstance.getAllParents(7)).toEqual([
        { id: 1, parent: null, label: 'Айтем 1' },
        { id: '2', parent: 1, label: 'Айтем 2' },
        { id: 4, parent: '2', label: 'Айтем 4' },
        { id: 7, label: 'Айтем 7', parent: 4 }
      ])
    })

    it('should return an empty array for id with no parents', () => {
      expect(storeInstance.getAllParents(1)).toEqual(
        [
          { id: 1, label: 'Айтем 1', parent: null }
        ]
      )
    })
  })

  describe('addItem', () => {
    it('should add a new item', () => {
      const newItem = { id: 9, parent: 4, label: 'Айтем 9' }
      storeInstance.addItem(newItem)
      expect(storeInstance.getItem(9)).toEqual(newItem)
      expect(storeInstance.getChildren(4)).toContainEqual(newItem)
    })
  })

  describe('removeItem', () => {
    it('should remove an item and its children', () => {
      storeInstance.removeItem(4)
      expect(storeInstance.getItem(4)).toBeNull()
      expect(storeInstance.getItem(7)).toBeNull()
      expect(storeInstance.getItem(8)).toBeNull()
    })
  })

  describe('updateItem', () => {
    it('should update an existing item', () => {
      const updatedItem = { id: 7, parent: 4, label: 'Обновленный Айтем 7' }
      storeInstance.updateItem(updatedItem)
      expect(storeInstance.getItem(7)).toEqual(updatedItem)
    })

    it('should not update a non-existent item', () => {
      const nonExistentItem = { id: 100, parent: 4, label: 'Несуществующий' }
      storeInstance.updateItem(nonExistentItem)
      expect(storeInstance.getItem(100)).toBeNull()
    })
  })
})
