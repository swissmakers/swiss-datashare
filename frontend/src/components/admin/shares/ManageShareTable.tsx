import { useClipboard } from "../../../hooks/useClipboard";
import moment from "moment";
import { TbLink, TbTrash } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../../hooks/useTranslate.hook";
import { MyShare } from "../../../types/share.type";
import { byteToHumanSizeString } from "../../../utils/fileSize.util";
import toast from "../../../utils/toast.util";
import showShareLinkModal from "../../account/showShareLinkModal";
import { Table } from "../../../components/ui";
import { useModals } from "../../../contexts/ModalContext";

const ManageShareTable = ({
  shares,
  deleteShare,
  isLoading,
}: {
  shares: MyShare[];
  deleteShare: (share: MyShare) => void;
  isLoading: boolean;
}) => {
  const modals = useModals();
  const clipboard = useClipboard();
  const t = useTranslate();

  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Cell header>
              <FormattedMessage id="account.shares.table.id" />
            </Table.Cell>
            <Table.Cell header>
              <FormattedMessage id="account.shares.table.name" />
            </Table.Cell>
            <Table.Cell header>
              <FormattedMessage id="admin.shares.table.username" />
            </Table.Cell>
            <Table.Cell header>
              <FormattedMessage id="account.shares.table.visitors" />
            </Table.Cell>
            <Table.Cell header>
              <FormattedMessage id="account.shares.table.size" />
            </Table.Cell>
            <Table.Cell header>
              <FormattedMessage id="account.shares.table.expiresAt" />
            </Table.Cell>
            <Table.Cell header>{null}</Table.Cell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading
            ? skeletonRows
            : shares.map((share) => (
                <Table.Row key={share.id}>
                  <Table.Cell>{share.id}</Table.Cell>
                  <Table.Cell>{share.name}</Table.Cell>
                  <Table.Cell>
                    {share.creator ? (
                      share.creator.username
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Anonymous</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>{share.views}</Table.Cell>
                  <Table.Cell>{byteToHumanSizeString(share.size)}</Table.Cell>
                  <Table.Cell>
                    {moment(share.expiration).unix() === 0
                      ? "Never"
                      : moment(share.expiration).format("LLL")}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          if (typeof window !== "undefined" && window.isSecureContext) {
                            clipboard.copy(
                              `${window.location.origin}/s/${share.id}`,
                            );
                            toast.success(t("common.notify.copied-link"));
                          } else {
                            showShareLinkModal(modals, share.id);
                          }
                        }}
                        className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        aria-label="Copy share link"
                      >
                        <TbLink size={18} />
                      </button>
                      <button
                        onClick={() => deleteShare(share)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete share"
                      >
                        <TbTrash size={18} />
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

const skeletonRows = [...Array(10)].map((v, i) => (
  <Table.Row key={i}>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </Table.Cell>
  </Table.Row>
));

export default ManageShareTable;
