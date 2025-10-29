import { create } from "zustand";

type ModalStore = {
  createReportModalOpen: boolean;
  locationDetailsModalOpen: boolean;
  noLocationAlertOpen: boolean;
  fabOpen: boolean;
  setCreateReportModalOpen: (val: boolean) => void;
  setLocationDetailsModalOpen: (val: boolean) => void;
  setNoLocationAlertOpen: (val: boolean) => void;
  setFabOpen: (val: boolean) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  createReportModalOpen: false,
  locationDetailsModalOpen: false,
  noLocationAlertOpen: false,
  fabOpen: false,
  setCreateReportModalOpen: (isOpen) => set({ createReportModalOpen: isOpen }),
  setLocationDetailsModalOpen: (isOpen) =>
    set({
      locationDetailsModalOpen: isOpen,
    }),
  setNoLocationAlertOpen: (isOpen) => set({ noLocationAlertOpen: isOpen }),
  setFabOpen: (isOpen) => set({ fabOpen: isOpen }),
}));
