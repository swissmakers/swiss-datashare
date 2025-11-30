import { Dispatch, SetStateAction } from "react";
import { TbChevronDown, TbChevronUp, TbSelector } from "react-icons/tb";

export type TableSort = {
  property?: string;
  direction: "asc" | "desc";
};

const TableSortIcon = ({
  sort,
  setSort,
  property,
}: {
  sort: TableSort;
  setSort: Dispatch<SetStateAction<TableSort>>;
  property: string;
}) => {
  if (sort.property === property) {
    return (
      <button
        onClick={() =>
          setSort({
            property,
            direction: sort.direction === "asc" ? "desc" : "asc",
          })
        }
        className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded transition-colors"
        aria-label={`Sort by ${property}`}
      >
        {sort.direction === "asc" ? (
          <TbChevronDown size={16} />
        ) : (
          <TbChevronUp size={16} />
        )}
      </button>
    );
  } else {
    return (
      <button
        onClick={() => setSort({ property, direction: "asc" })}
        className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 rounded transition-colors"
        aria-label={`Sort by ${property}`}
      >
        <TbSelector size={16} />
      </button>
    );
  }
};

export default TableSortIcon;
