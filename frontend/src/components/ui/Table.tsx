import clsx from "clsx";
import React, { ReactNode } from "react";

export interface TableProps {
  children: ReactNode;
  className?: string;
  striped?: boolean;
  /** When false, no horizontal scroll wrapper — use with table-fixed + wrapping cells so the table stays within the layout width. */
  scrollContainer?: boolean;
}

export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export interface TableRowProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export interface TableCellProps {
  children?: ReactNode;
  className?: string;
  header?: boolean;
  style?: React.CSSProperties;
  /** Body cells only: allow line breaks instead of forcing a single line (helps fixed-width tables fit the container). */
  allowWrap?: boolean;
}

const Table = ({
  children,
  className,
  striped = false,
  scrollContainer = true,
}: TableProps) => {
  const table = (
    <table
      className={clsx(
        "w-full border-collapse",
        striped && "table-auto",
        className
      )}
    >
      {children}
    </table>
  );
  if (!scrollContainer) return table;
  return <div className="overflow-x-auto">{table}</div>;
};

const TableHeader = ({ children, className }: TableHeaderProps) => {
  return <thead className={clsx("bg-gray-50 dark:bg-gray-900", className)}>{children}</thead>;
};

const TableBody = ({ children, className }: TableBodyProps) => {
  return <tbody className={clsx("divide-y divide-gray-200 dark:divide-gray-700", className)}>{children}</tbody>;
};

const TableRow = ({ children, className, hover = false, onClick }: TableRowProps) => {
  return (
    <tr
      className={clsx(
        "border-b border-gray-200 dark:border-gray-700",
        hover && "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

const TableCell = ({
  children,
  className,
  header = false,
  style,
  allowWrap = false,
}: TableCellProps) => {
  const Component = header ? "th" : "td";
  return (
    <Component
      className={clsx(
        header
          ? "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          : clsx(
              "px-6 py-4 text-sm text-text dark:text-text-dark align-top",
              allowWrap
                ? "whitespace-normal break-words min-w-0"
                : "whitespace-nowrap",
            ),
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;

