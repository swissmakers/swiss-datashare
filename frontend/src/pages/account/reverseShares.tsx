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
import { Button, Container, Table, Accordion, Tooltip } from "../../components/ui";
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text dark:text-text-dark">
              <FormattedMessage id="account.reverseShares.title" />
            </h2>
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
          <div className="flex flex-col items-center justify-center" style={{ height: "70vh" }}>
            <h3 className="text-xl font-bold mb-2 text-text dark:text-text-dark">
              <FormattedMessage id="account.reverseShares.title.empty" />
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              <FormattedMessage id="account.reverseShares.description.empty" />
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Cell header>
                    <FormattedMessage id="account.reverseShares.table.shares" />
                  </Table.Cell>
                  <Table.Cell header>
                    <FormattedMessage id="account.reverseShares.table.remaining" />
                  </Table.Cell>
                  <Table.Cell header>
                    <FormattedMessage id="account.reverseShares.table.max-size" />
                  </Table.Cell>
                  <Table.Cell header>
                    <FormattedMessage id="account.reverseShares.table.expires" />
                  </Table.Cell>
                  <Table.Cell header></Table.Cell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {reverseShares.map((reverseShare) => (
                  <Table.Row key={reverseShare.id}>
                    <Table.Cell style={{ width: 220 }}>
                      {reverseShare.shares.length == 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <FormattedMessage id="account.reverseShares.table.no-shares" />
                        </p>
                      ) : (
                        <Accordion defaultValue="customization">
                          <Accordion.Item value="customization">
                            <Accordion.Control>
                              <p className="text-sm">
                                {reverseShare.shares.length == 1
                                  ? `1 ${t(
                                      "account.reverseShares.table.count.singular",
                                    )}`
                                  : `${reverseShare.shares.length} ${t(
                                      "account.reverseShares.table.count.plural",
                                    )}`}
                              </p>
                            </Accordion.Control>
                            <Accordion.Panel>
                              <div className="space-y-2">
                                {reverseShare.shares.map((share) => (
                                  <div key={share.id} className="flex items-center gap-2">
                                    <Link
                                      href={`${window.location.origin}/share/${share.id}`}
                                      target="_blank"
                                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate max-w-[120px]"
                                    >
                                      {share.id}
                                    </Link>
                                    <button
                                      onClick={() => {
                                        if (typeof window !== "undefined" && window.isSecureContext) {
                                          clipboard.copy(
                                            `${window.location.origin}/s/${share.id}`,
                                          );
                                          toast.success(
                                            t("common.notify.copied-link"),
                                          );
                                        } else {
                                          showShareLinkModal(modals, share.id);
                                        }
                                      }}
                                      className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                      aria-label="Copy share link"
                                    >
                                      <TbLink size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}
                    </Table.Cell>
                    <Table.Cell>{reverseShare.remainingUses}</Table.Cell>
                    <Table.Cell>
                      {byteToHumanSizeString(parseInt(reverseShare.maxShareSize))}
                    </Table.Cell>
                    <Table.Cell>
                      {moment(reverseShare.shareExpiration).unix() === 0
                        ? "Never"
                        : moment(reverseShare.shareExpiration).format("LLL")}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined" && window.isSecureContext) {
                              clipboard.copy(
                                `${window.location.origin}/upload/${
                                  reverseShare.token
                                }`,
                              );
                              toast.success(t("common.notify.copied-link"));
                            } else {
                              showReverseShareLinkModal(
                                modals,
                                reverseShare.token,
                              );
                            }
                          }}
                          className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          aria-label="Copy reverse share link"
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
                          aria-label="Delete reverse share"
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
