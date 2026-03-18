import { create } from "zustand";

interface LoadingStore {
  count: number;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  count: 0,

  startLoading: () =>
    set((state) => ({ count: state.count + 1 })),

  stopLoading: () =>
    set((state) => ({ count: Math.max(0, state.count - 1) })),
}));
