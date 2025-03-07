<template>
  <div class="table-controls">
    <div class="table-controls__mode-selector">
      <button
        class="table-controls__mode-btn"
        @click="toggleEditMode"
      >
        {{ isEditMode ? 'Вернуться к просмотру' : 'Перейти в режим редактирования' }}
      </button>
    </div>

    <div v-if="isEditMode" class="table-controls__history-controls">
      <button
        class="table-controls__history-btn"
        :disabled="!canUndo"
        @click="undo"
      >
        <span class="table-controls__arrow table-controls__arrow--left">⬅️</span>
      </button>
      <button
        class="table-controls__history-btn"
        :disabled="!canRedo"
        @click="redo"
      >
        <span class="table-controls__arrow table-controls__arrow--right">➡️</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>

defineProps<{
  isEditMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleEditMode'): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
}>();

const toggleEditMode = () => emit('toggleEditMode');
const undo = () => emit('undo');
const redo = () => emit('redo');
</script>

<style scoped>
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-controls__mode-selector {
  display: flex;
  align-items: center;
}

.table-controls__mode-btn {
  background: #f0f0f0;
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 5px;
  color: #0066cc;
  transition: background-color 0.3s ease;
}

.table-controls__mode-btn:hover {
  background-color: #e0e0e0;
}

.table-controls__history-controls {
  display: flex;
  gap: 5px;
}

.table-controls__history-btn {
  background: #f0f0f0;
  border: 1px solid #ccc;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.table-controls__history-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-controls__history-btn:not(:disabled):hover {
  background-color: #e0e0e0;
}

.table-controls__arrow {
  font-size: 16px;
  font-weight: bold;
}

.table-controls__arrow--left {
  color: #0066cc;
}

.table-controls__arrow--right {
  color: #0066cc;
}
</style>
