import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TbDownload, TbEye, TbLink } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { FileMetaData } from "../../types/File.type";
import { Share } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import { useClipboard } from "../../hooks/useClipboard";
import { useModals } from "../../contexts/ModalContext";
import TableSortIcon, { TableSort } from "../core/SortIcon";
import showFilePreviewModal from "./modals/showFilePreviewModal";
import { Table, Input } from "../ui";

const FileList = ({
  files,
  setShare,
  share,
  isLoading,
}: {
  files?: FileMetaData[];
  setShare: Dispatch<SetStateAction<Share | undefined>>;
  share: Share;
  isLoading: boolean;
}) => {
  const clipboard = useClipboard();
  const modals = useModals();
  const t = useTranslate();

  const [sort, setSort] = useState<TableSort>({
    property: "name",
    direction: "desc",
  });

  const sortFiles = () => {
    if (files && sort.property) {
      const sortedFiles = [...files].sort((a: any, b: any) => {
        if (sort.direction === "asc") {
          return b[sort.property!].localeCompare(a[sort.property!], undefined, {
            numeric: true,
          });
        } else {
          return a[sort.property!].localeCompare(b[sort.property!], undefined, {
            numeric: true,
          });
        }
      });

      setShare({
        ...share,
        files: sortedFiles,
      });
    }
  };

  const copyFileLink = (file: FileMetaData) => {
    const link = `${window.location.origin}/api/shares/${
      share.id
    }/files/${file.id}`;

    if (typeof window !== "undefined" && window.isSecureContext) {
      clipboard.copy(link);
      toast.success(t("common.notify.copied"));
    } else {
      modals.openModal({
        title: t("share.modal.file-link"),
        children: (
          <div className="space-y-4">
            <Input value={link} readOnly />
          </div>
        ),
      });
    }
  };

  useEffect(sortFiles, [sort]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <Table scrollContainer={false} className="min-w-[480px]">
        <Table.Header>
          <Table.Row>
            <Table.Cell header className="min-w-[12rem]">
              <div className="flex items-center gap-2">
                <FormattedMessage id="share.table.name" />
                <TableSortIcon sort={sort} setSort={setSort} property="name" />
              </div>
            </Table.Cell>
            <Table.Cell header className="min-w-[6rem]">
              <div className="flex items-center gap-2">
                <FormattedMessage id="share.table.size" />
                <TableSortIcon sort={sort} setSort={setSort} property="size" />
              </div>
            </Table.Cell>
            <Table.Cell header className="w-px text-right" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading
            ? skeletonRows
            : files!.map((file) => (
                <Table.Row key={file.id} hover>
                  <Table.Cell allowWrap className="font-medium text-text dark:text-text-dark">
                    {file.name}
                  </Table.Cell>
                  <Table.Cell className="text-gray-700 dark:text-gray-300">
                    {byteToHumanSizeString(parseInt(file.size))}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-1 shrink-0">
                      {shareService.doesFileSupportPreview(file.name) && (
                        <button
                          type="button"
                          onClick={() =>
                            showFilePreviewModal(share.id, file, modals)
                          }
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          aria-label="Preview file"
                        >
                          <TbEye size={18} />
                        </button>
                      )}
                      {!share.hasPassword && (
                        <button
                          type="button"
                          onClick={() => copyFileLink(file)}
                          className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          aria-label="Copy file link"
                        >
                          <TbLink size={18} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          await shareService.downloadFile(share.id, file.id);
                        }}
                        className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        aria-label="Download file"
                      >
                        <TbDownload size={18} />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
        </Table.Body>
      </Table>
    </div>
  );
};

const skeletonRows = [...Array(5)].map((c, i) => (
  <Table.Row key={i}>
    <Table.Cell>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </Table.Cell>
  </Table.Row>
));

export default FileList;
