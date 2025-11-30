import { useModals } from "../../contexts/ModalContext";
import { useClipboard } from "../../hooks/useClipboard";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TbEdit, TbInfoCircle, TbLink, TbLock, TbTrash } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import showShareInformationsModal from "../../components/account/showShareInformationsModal";
import showShareLinkModal from "../../components/account/showShareLinkModal";
import CenterLoader from "../../components/core/CenterLoader";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyShare } from "../../types/share.type";
import toast from "../../utils/toast.util";
import { Button, Container, Table } from "../../components/ui";

const MyShares = () => {
  const modals = useModals();
  const clipboard = useClipboard();
  const config = useConfig();
  const t = useTranslate();

  const [shares, setShares] = useState<MyShare[]>();

  useEffect(() => {
    shareService.getMyShares().then((shares) => setShares(shares));
  }, []);

  if (!shares) return <CenterLoader />;

  return (
    <>
      <Meta title={t("account.shares.title")} />
      <Container>
        <h2 className="text-2xl font-bold mb-8 text-text dark:text-text-dark">
          <FormattedMessage id="account.shares.title" />
        </h2>
        {shares.length == 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ height: "70vh" }}>
            <h3 className="text-xl font-bold mb-2 text-text dark:text-text-dark">
              <FormattedMessage id="account.shares.title.empty" />
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <FormattedMessage id="account.shares.description.empty" />
            </p>
            <Button as={Link} href="/upload" variant="outline">
              <FormattedMessage id="account.shares.button.create" />
            </Button>
          </div>
        ) : (
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
                    <FormattedMessage id="account.shares.table.visitors" />
                  </Table.Cell>
                  <Table.Cell header>
                    <FormattedMessage id="account.shares.table.expiresAt" />
                  </Table.Cell>
                  <Table.Cell header></Table.Cell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {shares.map((share) => (
                  <Table.Row key={share.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        {share.id}{" "}
                        {share.security.passwordProtected && (
                          <TbLock
                            className="text-orange-500"
                            title={t("account.shares.table.password-protected")}
                            size={16}
                          />
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{share.name}</Table.Cell>
                    <Table.Cell>
                      {share.security.maxViews ? (
                        <FormattedMessage
                          id="account.shares.table.visitor-count"
                          values={{
                            count: share.views,
                            max: share.security.maxViews,
                          }}
                        />
                      ) : (
                        share.views
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {moment(share.expiration).unix() === 0 ? (
                        <FormattedMessage id="account.shares.table.expiry-never" />
                      ) : (
                        moment(share.expiration).format("LLL")
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/share/${share.id}/edit`}>
                          <button
                            className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            aria-label="Edit share"
                          >
                            <TbEdit size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            showShareInformationsModal(
                              modals,
                              share,
                              parseInt(config.get("share.maxSize")),
                            );
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          aria-label="Share information"
                        >
                          <TbInfoCircle size={18} />
                        </button>
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
                          onClick={() => {
                            modals.openConfirmModal({
                              title: t("account.shares.modal.delete.title", {
                                share: share.id,
                              }),
                              children: (
                                <p className="text-sm">
                                  <FormattedMessage id="account.shares.modal.delete.description" />
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
                                shareService.remove(share.id);
                                setShares(
                                  shares.filter((item) => item.id !== share.id),
                                );
                              },
                            });
                          }}
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
        )}
      </Container>
    </>
  );
};

export default MyShares;
