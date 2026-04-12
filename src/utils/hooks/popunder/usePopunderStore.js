import { create } from 'zustand';

const usePopunderStore = create((set) => ({
  isVisible: false,
  show: () => set({ isVisible: true }),
  consumeClick: () => set({ isVisible: false }),
  hide: () => set({ isVisible: false }),
  reset: () => set({ isVisible: false }),
}));

export default usePopunderStore;