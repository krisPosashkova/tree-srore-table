import { mount, VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import TreeTable from '@/components/TreeTable/TreeTable.vue';
import TableControls from '@/components/TableControls/TableControls.vue';
import { AgGridVue } from 'ag-grid-vue3';

type TComponentContext = Partial<{
  isEditMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
}>;

const createWrapper = (): VueWrapper<TComponentContext> => {
  return mount(TreeTable);
};

let wrapper: ReturnType<typeof createWrapper>;

describe('TreeTable', () => {
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render the component', () => {
    wrapper = createWrapper();
    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(AgGridVue).exists()).toBe(true);
    expect(wrapper.findComponent(TableControls).exists()).toBe(true);
  });

  it('should have initial state', () => {
    wrapper = createWrapper();
    expect(wrapper.vm.isEditMode).toBe(false);
    expect(wrapper.vm.canUndo).toBe(false);
    expect(wrapper.vm.canRedo).toBe(false);
  });

  it('should toggle edit mode', async () => {
    wrapper = createWrapper();
    const tableControls = wrapper.findComponent(TableControls);
    await tableControls.vm.$emit('toggleEditMode');
    expect(wrapper.vm.isEditMode).toBe(true);
    await tableControls.vm.$emit('toggleEditMode');
    expect(wrapper.vm.isEditMode).toBe(false);
  });
});
