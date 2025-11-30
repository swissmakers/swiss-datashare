import { ReactNode, useState, createContext, useContext } from "react";
import clsx from "clsx";

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs");
  }
  return context;
};

export interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const Tabs = ({ children, defaultValue, value: controlledValue, onChange }: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div
      className={clsx(
        "flex border-b border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
};

export interface TabsTabProps {
  children: ReactNode;
  value: string;
  icon?: ReactNode;
  className?: string;
}

export const TabsTab = ({ children, value, icon, className }: TabsTabProps) => {
  const { value: currentValue, onChange } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={clsx(
        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
        "flex items-center gap-2",
        isActive
          ? "border-primary-500 text-primary-600 dark:text-primary-400"
          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-100",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export interface TabsPanelProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export const TabsPanel = ({ children, value, className }: TabsPanelProps) => {
  const { value: currentValue } = useTabsContext();

  if (currentValue !== value) {
    return null;
  }

  return <div className={clsx("pt-4", className)}>{children}</div>;
};

Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;

export default Tabs;

