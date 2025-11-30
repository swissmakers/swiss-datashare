import { ReactNode, useState, createContext, useContext } from "react";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  isItemOpen: (value: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within Accordion");
  }
  return context;
};

export interface AccordionProps {
  children: ReactNode;
  defaultValue?: string | string[];
  multiple?: boolean;
  className?: string;
}

export const Accordion = ({ children, defaultValue, multiple = false, className }: AccordionProps) => {
  const initialOpen = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  const [openItems, setOpenItems] = useState<string[]>(initialOpen);

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return multiple ? [...prev, value] : [value];
      }
    });
  };

  const isItemOpen = (value: string) => {
    return openItems.includes(value);
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, isItemOpen }}>
      <div className={clsx("space-y-1", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

export interface AccordionItemProps {
  children: ReactNode;
  value: string;
  className?: string;
}

const AccordionItemContext = createContext<{ value: string } | undefined>(undefined);

export const AccordionItem = ({ children, value, className }: AccordionItemProps) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={clsx("border border-gray-200 dark:border-gray-700 rounded-lg", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

export interface AccordionControlProps {
  children: ReactNode;
  className?: string;
}

export const AccordionControl = ({ children, className }: AccordionControlProps) => {
  const { toggleItem, isItemOpen } = useAccordionContext();
  const itemContext = useContext(AccordionItemContext);
  
  if (!itemContext) {
    throw new Error("AccordionControl must be used within AccordionItem");
  }

  const { value } = itemContext;
  const isOpen = isItemOpen(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={clsx(
        "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        className
      )}
    >
      <span>{children}</span>
      <ChevronDownIcon
        className={clsx(
          "h-5 w-5 text-gray-500 transition-transform flex-shrink-0",
          isOpen && "transform rotate-180"
        )}
      />
    </button>
  );
};

export interface AccordionPanelProps {
  children: ReactNode;
  className?: string;
}

export const AccordionPanel = ({ children, className }: AccordionPanelProps) => {
  const { isItemOpen } = useAccordionContext();
  const itemContext = useContext(AccordionItemContext);
  
  if (!itemContext) {
    throw new Error("AccordionPanel must be used within AccordionItem");
  }

  const { value } = itemContext;
  const isOpen = isItemOpen(value);

  if (!isOpen) return null;

  return (
    <div className={clsx("p-4 pt-0", className)}>{children}</div>
  );
};

// Simplified version that works with the existing code
Accordion.Item = AccordionItem;
Accordion.Control = AccordionControl;
Accordion.Panel = AccordionPanel;

export default Accordion;
