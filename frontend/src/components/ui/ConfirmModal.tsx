import { ReactNode } from "react";
import Button from "./Button";
import { useModals } from "../../contexts/ModalContext";

export interface ConfirmModalOptions {
  title: string;
  children: ReactNode;
  labels?: {
    confirm: string;
    cancel: string;
  };
  confirmProps?: {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    color?: string;
  };
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const createConfirmModalBody = (options: ConfirmModalOptions) => {
  return <ConfirmModalBody options={options} />;
};

const ConfirmModalBody = ({ options }: { options: ConfirmModalOptions }) => {
  const modals = useModals();

  const handleConfirm = async () => {
    await options.onConfirm();
    modals.closeAll();
  };

  const handleCancel = () => {
    options.onCancel?.();
    modals.closeAll();
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {options.children}
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleCancel}>
          {options.labels?.cancel || "Cancel"}
        </Button>
        <Button
          variant={options.confirmProps?.variant || "danger"}
          onClick={handleConfirm}
        >
          {options.labels?.confirm || "Confirm"}
        </Button>
      </div>
    </div>
  );
};

