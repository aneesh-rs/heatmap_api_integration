import { create } from 'zustand';

type ModalStore = {
  createReportModalOpen: boolean;
  locationDetailsModalOpen: boolean;
  fabOpen: boolean;
  setCreateReportModalOpen: (val: boolean) => void;
  setLocationDetailsModalOpen: (val: boolean) => void;
  setFabOpen: (val: boolean) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  createReportModalOpen: false,
  locationDetailsModalOpen: false,
  fabOpen: false,
  setCreateReportModalOpen: (isOpen) => set({ createReportModalOpen: isOpen }),
  setLocationDetailsModalOpen: (isOpen) =>
    set({
      locationDetailsModalOpen: isOpen,
    }),
  setFabOpen: (isOpen) => set({ fabOpen: isOpen }),
}));
