import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Modal } from "../components/ui";
import { createConfirmModalBody, ConfirmModalOptions } from "../components/ui/ConfirmModal";

export interface ModalOptions {
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  onClose?: () => void;
}

export interface ModalContextType {
  openModal: (options: ModalOptions) => string;
  openConfirmModal: (options: ConfirmModalOptions) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
};

interface ModalState extends ModalOptions {
  id: string;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modals, setModals] = useState<ModalState[]>([]);

  const openModal = useCallback((options: ModalOptions): string => {
    const id = Math.random().toString(36).substr(2, 9);
    setModals((prev) => [...prev, { ...options, id }]);
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals((prev) => {
      const modal = prev.find((m) => m.id === id);
      if (modal?.onClose) {
        modal.onClose();
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const closeAll = useCallback(() => {
    setModals((prev) => {
      prev.forEach((modal) => {
        if (modal.onClose) {
          modal.onClose();
        }
      });
      return [];
    });
  }, []);

  const openConfirmModal = useCallback((options: ConfirmModalOptions) => {
    return openModal({
      title: options.title,
      children: createConfirmModalBody(options),
      closeOnClickOutside: options.closeOnClickOutside ?? true,
      closeOnEscape: options.closeOnEscape ?? true,
      showCloseButton: options.showCloseButton ?? true,
    });
  }, [openModal]);

  return (
    <ModalContext.Provider value={{ openModal, openConfirmModal, closeModal, closeAll }}>
      {children}
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => closeModal(modal.id)}
          title={modal.title}
          size={modal.size}
          showCloseButton={modal.showCloseButton !== false}
          closeOnClickOutside={modal.closeOnClickOutside !== false}
          closeOnEscape={modal.closeOnEscape !== false}
        >
          {modal.children}
        </Modal>
      ))}
    </ModalContext.Provider>
  );
};

