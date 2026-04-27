import { useModals } from "../../contexts/ModalContext";
import { useClipboard } from "../../hooks/useClipboard";
import moment from "moment";
import { useEffect, useState } from "react";
import { TbInfoCircle, TbLink, TbPlus, TbTrash } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import showReverseShareLinkModal from "../../components/account/showReverseShareLinkModal";
import showShareLinkModal from "../../components/account/showShareLinkModal";
import CenterLoader from "../../components/core/CenterLoader";
import showCreateReverseShareModal from "../../components/share/modals/showCreateReverseShareModal";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyReverseShare } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import { Button, Container, Table, Tooltip } from "../../components/ui";
import Link from "next/link";

const MyShares = () => {
  const modals = useModals();
  const clipboard = useClipboard();
  const t = useTranslate();

  const config = useConfig();

  const [reverseShares, setReverseShares] = useState<MyReverseShare[]>();

  const getReverseShares = () => {
    shareService
      .getMyReverseShares()
      .then((shares) => setReverseShares(shares));
  };

  useEffect(() => {
    getReverseShares();
  }, []);

  if (!reverseShares) return <CenterLoader />;
  return (
    <>
      <Meta title={t("account.reverseShares.title")} />
      <Container>
        <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-center gap-2">
            <h1 className="page-title">
              <FormattedMessage id="account.reverseShares.title" />
            </h1>
            <Tooltip
              position="bottom"
              multiline
              width={220}
              label={t("account.reverseShares.description")}
            >
              <button className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded transition-colors">
                <TbInfoCircle size={18} />
              </button>
            </Tooltip>
          </div>
          <Button
            onClick={() =>
              showCreateReverseShareModal(
                modals,
                config.get("smtp.enabled"),
                config.get("share.maxExpiration"),
                getReverseShares,
              )
            }
          >
            <TbPlus className="mr-2" size={18} />
            <FormattedMessage id="common.button.create" />
          </Button>
        </div>
        {reverseShares.length == 0 ? (
          <div className="flex h-[60vh] flex-col items-center justify-center">
            <h3 className="section-title mb-2 text-center">
              <FormattedMessage id="account.reverseShares.title.empty" />
            </h3>
            <p className="body-text text-center">
              <FormattedMessage id="account.reverseShares.description.empty" />
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <Table scrollContainer={false} className="min-w-[720px]">
              <Table.Header>
                <Table.Row>
                  <Table.Cell header className="min-w-[10rem]">
                    <FormattedMessage id="account.reverseShares.table.name" />
                  </Table.Cell>
                  <Table.Cell header className="min-w-[12rem]">
                    <FormattedMessage id="account.reverseShares.table.shares" />
                  </Table.Cell>
                  <Table.Cell header className="min-w-[5rem]">
                    <FormattedMessage id="account.reverseShares.table.remaining" />
                  </Table.Cell>
                  <Table.Cell header className="min-w-[7rem]">
                    <FormattedMessage id="account.reverseShares.table.max-size" />
                  </Table.Cell>
                  <Table.Cell header className="min-w-[10rem]">
                    <FormattedMessage id="account.reverseShares.table.expires" />
                  </Table.Cell>
                  <Table.Cell header className="w-px text-right" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {reverseShares.map((reverseShare) => (
                  <Table.Row key={reverseShare.id} hover>
                    <Table.Cell allowWrap className="font-medium text-text dark:text-text-dark">
                      {reverseShare.name?.trim() ? reverseShare.name : "—"}
                    </Table.Cell>
                    <Table.Cell allowWrap>
                      {reverseShare.shares.length == 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <FormattedMessage id="account.reverseShares.table.no-shares" />
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {reverseShare.shares.map((share) => (
                            <div
                              key={share.id}
                              className="flex items-center gap-2 min-w-0"
                            >
                              <Link
                                href={`/s/${share.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate min-w-0"
                                title={share.id}
                              >
                                {share.id}
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof window !== "undefined" && window.isSecureContext) {
                                    clipboard.copy(`${window.location.origin}/s/${share.id}`);
                                    toast.success(t("common.notify.copied"));
                                  } else {
                                    showShareLinkModal(modals, share.id);
                                  }
                                }}
                                className="shrink-0 p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                aria-label={t("common.aria.copy-share-link")}
                              >
                                <TbLink size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>{reverseShare.remainingUses}</Table.Cell>
                    <Table.Cell className="text-gray-700 dark:text-gray-300">
                      {byteToHumanSizeString(parseInt(reverseShare.maxShareSize))}
                    </Table.Cell>
                    <Table.Cell className="text-gray-600 dark:text-gray-400">
                      {moment(reverseShare.shareExpiration).unix() === 0
                        ? t("account.shares.table.expiry-never")
                        : moment(reverseShare.shareExpiration).format("LLL")}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-1 shrink-0">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined" && window.isSecureContext) {
                              clipboard.copy(
                                `${window.location.origin}/upload/${
                                  reverseShare.token
                                }`,
                              );
                              toast.success(t("common.notify.copied"));
                            } else {
                              showReverseShareLinkModal(
                                modals,
                                reverseShare.token,
                              );
                            }
                          }}
                          className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          aria-label={t("common.aria.copy-request-link")}
                        >
                          <TbLink size={18} />
                        </button>
                        <button
                          onClick={() => {
                            modals.openConfirmModal({
                              title: t(
                                "account.reverseShares.modal.delete.title",
                              ),
                              children: (
                                <p className="text-sm">
                                  <FormattedMessage id="account.reverseShares.modal.delete.description" />
                                </p>
                              ),
                              confirmProps: {
                                variant: "danger",
                              },
                              labels: {
                                confirm: t("common.button.delete"),
                                cancel: t("common.button.cancel"),
                              },
                              onConfirm: () => {
                                shareService.removeReverseShare(reverseShare.id);
                                setReverseShares(
                                  reverseShares.filter(
                                    (item) => item.id !== reverseShare.id,
                                  ),
                                );
                              },
                            });
                          }}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label={t("common.aria.delete-request-link")}
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
        )}
      </Container>
    </>
  );
};

export default MyShares;
