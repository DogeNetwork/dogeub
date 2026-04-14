import { create } from 'zustand';

const usePopunderStore = create((set) => ({
  isVisible: false,
  adKeyPassed: false,
  show: () => set({ isVisible: true }),
  consumeClick: () => set({ isVisible: false }),
  hide: () => set({ isVisible: false }),
  reset: () => set({ isVisible: false }),
  setAdKeyPassed: (value) => set({ adKeyPassed: !!value }),
}));

export default usePopunderStore;