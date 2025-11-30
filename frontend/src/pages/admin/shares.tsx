import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import ManageShareTable from "../../components/admin/shares/ManageShareTable";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyShare } from "../../types/share.type";
import toast from "../../utils/toast.util";
import { Container } from "../../components/ui";
import { useModals } from "../../contexts/ModalContext";

const Shares = () => {
  const [shares, setShares] = useState<MyShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const modals = useModals();
  const t = useTranslate();

  const getShares = () => {
    setIsLoading(true);
    shareService.list().then((shares) => {
      setShares(shares);
      setIsLoading(false);
    });
  };

  const deleteShare = (share: MyShare) => {
    modals.openConfirmModal({
      title: t("admin.shares.edit.delete.title", {
        id: share.id,
      }),
      children: (
        <p className="text-sm">
          <FormattedMessage id="admin.shares.edit.delete.description" />
        </p>
      ),
      labels: {
        confirm: t("common.button.delete"),
        cancel: t("common.button.cancel"),
      },
      confirmProps: { variant: "danger" },
      onConfirm: async () => {
        shareService
          .remove(share.id)
          .then(() => setShares(shares.filter((v) => v.id != share.id)))
          .catch(toast.axiosError);
      },
    });
  };

  useEffect(() => {
    getShares();
  }, []);

  return (
    <>
      <Meta title={t("admin.shares.title")} />
      <Container>
        <h2 className="text-2xl font-bold mb-8 text-text dark:text-text-dark">
          <FormattedMessage id="admin.shares.title" />
        </h2>

        <ManageShareTable
          shares={shares}
          deleteShare={deleteShare}
          isLoading={isLoading}
        />
      </Container>
    </>
  );
};

export default Shares;
