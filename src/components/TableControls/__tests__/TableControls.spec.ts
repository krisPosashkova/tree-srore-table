import { mount, VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import TableControls from '@/components/TableControls/TableControls.vue';

type TComponentProps = {
  isEditMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

const createWrapper = (props: TComponentProps): VueWrapper => {
  return mount(TableControls, {
    props,
  });
};

let wrapper: ReturnType<typeof createWrapper>;

describe('TableControls', () => {
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render the component', () => {
    wrapper = createWrapper({ isEditMode: false, canUndo: false, canRedo: false });
    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.find('.table-controls__mode-btn').exists()).toBe(true);
  });

  it('should display correct button text based on edit mode', () => {
    wrapper = createWrapper({ isEditMode: false, canUndo: false, canRedo: false });
    expect(wrapper.find('.table-controls__mode-btn').text()).toBe('Перейти в режим редактирования');

    wrapper = createWrapper({ isEditMode: true, canUndo: false, canRedo: false });
    expect(wrapper.find('.table-controls__mode-btn').text()).toBe('Вернуться к просмотру');
  });

  it('should emit toggleEditMode event when mode button is clicked', async () => {
    wrapper = createWrapper({ isEditMode: false, canUndo: false, canRedo: false });
    await wrapper.find('.table-controls__mode-btn').trigger('click');
    expect(wrapper.emitted('toggleEditMode')).toBeTruthy();
  });

  it('should disable undo and redo buttons based on props', () => {
    wrapper = createWrapper({ isEditMode: true, canUndo: false, canRedo: false });
    expect(wrapper.find('.table-controls__history-btn:disabled').exists()).toBe(true);

    wrapper = createWrapper({ isEditMode: true, canUndo: true, canRedo: false });
    expect(wrapper.find('.table-controls__history-btn:disabled').exists()).toBe(true);

    wrapper = createWrapper({ isEditMode: true, canUndo: true, canRedo: true });
    expect(wrapper.find('.table-controls__history-btn:disabled').exists()).toBe(false);
  });

  it('should emit undo event when undo button is clicked', async () => {
    wrapper = createWrapper({ isEditMode: true, canUndo: true, canRedo: false });
    await wrapper.find('.table-controls__arrow--left').trigger('click');
    expect(wrapper.emitted('undo')).toBeTruthy();
  });

  it('should emit redo event when redo button is clicked', async () => {
    wrapper = createWrapper({ isEditMode: true, canUndo: false, canRedo: true });
    await wrapper.find('.table-controls__arrow--right').trigger('click');
    expect(wrapper.emitted('redo')).toBeTruthy();
  });
});
