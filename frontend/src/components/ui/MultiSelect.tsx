import React from "react";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";

export interface MultiSelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  data?: { value: string; label: string }[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  creatable?: boolean;
  getCreateLabel?: (query: string) => string;
  onCreate?: (query: string) => string | void;
  inputMode?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const MultiSelect = ({
  label,
  error,
  helperText,
  data = [],
  value = [],
  onChange,
  placeholder,
  className,
  searchable = false,
  creatable = false,
  getCreateLabel,
  onCreate,
  inputMode,
  onKeyDown,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // For creatable mode, treat value array as string array directly
  const selectedValues = creatable ? value : value;
  const dataItems = creatable 
    ? value.map(v => ({ value: v, label: v }))
    : data;

  const filteredData = searchable && searchValue
    ? dataItems.filter(item => 
        item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.value.toLowerCase().includes(searchValue.toLowerCase())
      )
    : dataItems;

  const selectedItems = creatable
    ? selectedValues.map(v => ({ value: v, label: v }))
    : dataItems.filter(item => value.includes(item.value));

  const toggleItem = (itemValue: string) => {
    const newValue = value.includes(itemValue)
      ? value.filter(v => v !== itemValue)
      : [...value, itemValue];
    onChange?.(newValue);
    setSearchValue("");
  };

  const handleCreate = (query: string) => {
    if (creatable && onCreate) {
      const result = onCreate(query);
      if (result) {
        const newValue = [...value, result];
        onChange?.(newValue);
      } else if (!value.includes(query)) {
        const newValue = [...value, query];
        onChange?.(newValue);
      }
      setInputValue("");
      setSearchValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (creatable && (e.key === "Enter" || e.key === "," || e.key === ";")) {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed) {
        handleCreate(trimmed);
        if (inputRef.current) {
          inputRef.current.value = "";
          setInputValue("");
        }
      }
    }
  };

  const removeItem = (itemValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(value.filter(v => v !== itemValue));
  };

  return (
    <div className={clsx("w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text mb-1.5 dark:text-text-dark">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "w-full px-4 py-2 text-base text-text bg-white border border-gray-300 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "dark:bg-gray-800 dark:text-text-dark dark:border-gray-600 dark:focus:ring-primary-400",
            error && "border-red-500 focus:ring-red-500 dark:border-red-400",
            "flex items-center justify-between min-h-[42px]"
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedItems.length > 0 ? (
              selectedItems.map(item => (
                <span
                  key={item.value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm dark:bg-primary-900/30 dark:text-primary-300"
                >
                  {item.label}
                  <button
                    type="button"
                    onClick={(e) => removeItem(item.value, e)}
                    className="hover:text-primary-600 dark:hover:text-primary-200"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400">{placeholder || "Select items..."}</span>
            )}
          </div>
          <svg
            className={clsx(
              "w-5 h-5 text-gray-400 transition-transform",
              isOpen && "transform rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            {(searchable || creatable) && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode={inputMode as any}
                  value={creatable ? inputValue : searchValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (creatable) {
                      setInputValue(val);
                      setSearchValue(val);
                    } else {
                      setSearchValue(val);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={creatable ? placeholder : "Search..."}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-text-dark"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="py-1">
              {creatable && searchValue && !filteredData.some(item => item.value === searchValue) && (
                <button
                  type="button"
                  onClick={() => handleCreate(searchValue)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-primary-600 dark:text-primary-400"
                >
                  {getCreateLabel ? getCreateLabel(searchValue) : `+ ${searchValue}`}
                </button>
              )}
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleItem(item.value)}
                    className={clsx(
                      "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                      value.includes(item.value) && "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value.includes(item.value)}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      {item.label}
                    </div>
                  </button>
                ))
              ) : !creatable && (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

export default MultiSelect;

