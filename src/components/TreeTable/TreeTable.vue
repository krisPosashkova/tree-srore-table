<template>
  <div class="tree-table">
    <TableControls
      :isEditMode="isEditMode"
      :canUndo="canUndo"
      :canRedo="canRedo"
      @toggleEditMode="toggleEditMode"
      @undo="undo"
      @redo="redo"
    />

    <ag-grid-vue
      class="ag-theme-alpine"
      :row-data="rowData"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :get-data-path="getDataPath"
      :group-default-expanded="1"
      :row-numbers="rowNumbersOptions"
      :auto-group-column-def="autoGroupColumnDef"
      :style="{ height: calculateGridHeight() + 'px', width: '100%' }"
      :editable="isEditMode"
      :modules="modules"
      suppress-context-menu
      tree-data
      animate-rows
      @grid-ready="onGridReady"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import {
  type ColDef,
  type GridApi,
  type GetDataPath,
  type GridReadyEvent,
  type ICellRendererParams
} from 'ag-grid-community'
import type { TItem } from '@/utils/TreeStore/types.ts'
import type { RowNumbersOptions } from 'ag-grid-community/dist/types/src/interfaces/rowNumbers'
import TreeStore from '@/utils/TreeStore'
import { TEST_DATA_ITEMS } from '@/utils/TreeStore/__tests__/testData.ts'
import TableControls from '@/components/TableControls/TableControls.vue'
import {
  HEADER_NAME_CATEGORY,
  HEADER_NAME_LABEL,
  LABEL_FILED,
  TABLE_HEADER_HEIGHT,
  TABLE_ITEM_HEIGHT,
  type THistoryAction,
  TYPE_ELEMENT,
  ACTIONS_HEADER_NAME,
  TYPE_GROUP, type TProcessedItem
} from '@/components/TreeTable/models.ts'

import { ClientSideRowModelModule } from 'ag-grid-community';

const modules = [ClientSideRowModelModule];

const isEditMode = ref(false)
const gridApi = ref<GridApi | null>(null)

const treeStoreInstance = ref<TreeStore>(new TreeStore(TEST_DATA_ITEMS))

const history = ref<THistoryAction[]>([])
const historyIndex = ref(-1)
const canUndo = computed(() => historyIndex.value >= 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)


const columnDefs = computed<ColDef[]>(() => {
  const baseCols: ColDef[] = [
    {
      field: LABEL_FILED,
      headerName: HEADER_NAME_LABEL,
      editable: isEditMode.value,
      flex: 1
    }
  ]

  if (isEditMode.value) {
    baseCols.push({
      headerName: ACTIONS_HEADER_NAME,
      field: 'actions',
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        const container = document.createElement('div')
        container.className = 'tree-table__actions'

        // Add button
        const addBtn = document.createElement('button')
        addBtn.innerHTML = '+'
        addBtn.className = 'tree-table__action-btn tree-table__action-btn--add'
        addBtn.onclick = () => addChildItem(params.data)

        // Edit button
        const editBtn = document.createElement('button')
        editBtn.innerHTML = '✎'
        editBtn.className = 'tree-table__action-btn tree-table__action-btn--edit'
        editBtn.onclick = () => editItemLabel(params.data)

        // Remove button
        const removeBtn = document.createElement('button')
        removeBtn.innerHTML = 'x'
        removeBtn.className = 'tree-table__action-btn tree-table__action-btn--remove'
        removeBtn.onclick = () => removeItem(params.data)

        container.appendChild(addBtn)
        container.appendChild(editBtn)
        container.appendChild(removeBtn)

        return container
      }
    })
  }

  return baseCols
})

const autoGroupColumnDef = computed<ColDef>(() => ({
  headerName: HEADER_NAME_CATEGORY,
  width: 210,
  field: 'type',
  cellRendererParams: {
    suppressCount: true
  }
}))

const defaultColDef: ColDef = {
  sortable: false,
  resizable: true,
  suppressHeaderMenuButton: true,
  suppressHeaderContextMenu: true
}

const rowNumbersOptions: RowNumbersOptions = {
  width: 80
}

const getAll = computed(() => treeStoreInstance.value.getAll())

const processedItems = computed<TProcessedItem[]>(() => {
  const hasChildren = new Set<number | string>()
  getAll.value.forEach(item => {
    if (item.parent !== null) {
      hasChildren.add(item.parent)
    }
  })

  return getAll.value.map((item) => {
    const path: string[] = treeStoreInstance.value.getAllParents(item.id).map(it => it.label)


    return {
      ...item,
      path,
      type: hasChildren.has(item.id) ? TYPE_GROUP : TYPE_ELEMENT
    }
  })
})

const rowData = computed(() => processedItems.value)

const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api
}

const editItemLabel = (item: TItem) => {
  const currentLabel = item.label
  const newLabel = prompt('Enter new label:', currentLabel)

  if (newLabel !== currentLabel) {
    const itemToUpdate = treeStoreInstance.value.getItem(item.id)
    if (itemToUpdate) {
      const updatedItem = { ...itemToUpdate, label: newLabel }

      addToHistory({
        type: 'edit',
        data: { id: item.id, oldValue: currentLabel, newValue: newLabel },
        undo: () => {
          const itemToRestore = treeStoreInstance.value.getItem(item.id)
          if (itemToRestore) {
            treeStoreInstance.value.updateItem({ ...itemToRestore, label: currentLabel })
          }
        },
        redo: () => {
          const itemToUpdate = treeStoreInstance.value.getItem(item.id)
          if (itemToUpdate) {
            treeStoreInstance.value.updateItem({ ...itemToUpdate, label: newLabel })
          }
        }
      })

      treeStoreInstance.value.updateItem(updatedItem)
    }
  }
}

const addChildItem = (parentItem: TProcessedItem) => {
  const newId = Date.now()

  const label = prompt('Enter label for the new item:', 'New Item') || String(newId)

  const newItem: TItem = {
    id: newId,
    label: label,
    parent: parentItem.id
  }

  treeStoreInstance.value.addItem(newItem)

  addToHistory({
    type: 'add',
    data: newItem,
    undo: () => {
      treeStoreInstance.value.removeItem(newId)
    },
    redo: () => {
      treeStoreInstance.value.addItem(newItem)
    }
  })

  if (gridApi.value) {
    const node = gridApi.value.getRowNode(parentItem.path.join('/'))
    if (node && !node.expanded) {
      node.setExpanded(true)
    }
  }
}

const removeItem = (item: TItem) => {
  const itemToRemove = treeStoreInstance.value.getItem(item.id)
  if (!itemToRemove) return

  const affectedItems = [itemToRemove, ...treeStoreInstance.value.getAllChildren(item.id)]

  addToHistory({
    type: 'remove',
    data: affectedItems,
    undo: () => {
      const sortedItems = [...affectedItems].sort((a, b) => {
        const aDepth = treeStoreInstance.value.getAllParents(a.id).length
        const bDepth = treeStoreInstance.value.getAllParents(b.id).length
        return aDepth - bDepth
      })

      sortedItems.forEach(item => {
        treeStoreInstance.value.addItem(item)
      })
    },
    redo: () => {
      treeStoreInstance.value.removeItem(item.id)
    }
  })

  treeStoreInstance.value.removeItem(item.id)
}

const addToHistory = (action: THistoryAction) => {
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  history.value.push(action)
  historyIndex.value = history.value.length - 1
}

const undo = () => {
  if (historyIndex.value >= 0) {
    const action = history.value[historyIndex.value]
    action.undo()
    historyIndex.value--
  }
}

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    const action = history.value[historyIndex.value]
    action.redo()
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (gridApi.value) {
    gridApi.value.refreshCells()
  }
}

const getDataPath: GetDataPath = (data: TProcessedItem) => data.path

const calculateGridHeight = () => {
  const numberOfItems = rowData.value.length || 1
  return TABLE_HEADER_HEIGHT + (numberOfItems * TABLE_ITEM_HEIGHT)
}
</script>

<style scoped>
.tree-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px;
}

.tree-table :deep(.tree-table__actions) {
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.tree-table :deep(.tree-table__action-btn) {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
}

.tree-table :deep(.tree-table__action-btn):hover {
  opacity: 0.5;
}

.tree-table :deep(.tree-table__action-btn--add) {
  background-color: #2196F3;
  color: white;
}

.tree-table :deep(.tree-table__action-btn--remove) {
  background-color: #F44336;
  color: white;
}

.tree-table :deep(.tree-table__action-btn--edit) {
  background-color: #FFC107;
  color: white;
}

.tree-table :deep([aria-label="Row Number"]) .ag-header-cell-text:before {
  content: '№ п/п';
}

.tree-table :deep(.ag-pinned-left-cols-container) .ag-cell {
  text-align: center;
}
</style>

