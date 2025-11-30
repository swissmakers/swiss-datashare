import moment from "moment";
import { FormattedMessage } from "react-intl";
import { translateOutsideContext } from "../../hooks/useTranslate.hook";
import { MyShare } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import CopyTextField from "../upload/CopyTextField";
import { Progress } from "../ui";
import { ModalContextType } from "../../contexts/ModalContext";

const showShareInformationsModal = (
  modals: ModalContextType,
  share: MyShare,
  maxShareSize: number,
) => {
  const t = translateOutsideContext();
  const link = `${window.location.origin}/s/${share.id}`;

  const formattedShareSize = byteToHumanSizeString(share.size);
  const formattedMaxShareSize = byteToHumanSizeString(maxShareSize);
  const shareSizeProgress = (share.size / maxShareSize) * 100;

  const formattedCreatedAt = moment(share.createdAt).format("LLL");
  const formattedExpiration =
    moment(share.expiration).unix() === 0
      ? "Never"
      : moment(share.expiration).format("LLL");

  return modals.openModal({
    title: t("account.shares.modal.share-informations"),
    size: "lg",
    children: (
      <div className="space-y-4">
        <p className="text-sm">
          <b>
            <FormattedMessage id="account.shares.table.id" />:{" "}
          </b>
          {share.id}
        </p>
        <p className="text-sm">
          <b>
            <FormattedMessage id="account.shares.table.name" />:{" "}
          </b>
          {share.name || "-"}
        </p>

        <p className="text-sm">
          <b>
            <FormattedMessage id="account.shares.table.description" />:{" "}
          </b>
          {share.description || "-"}
        </p>

        <p className="text-sm">
          <b>
            <FormattedMessage id="account.shares.table.createdAt" />:{" "}
          </b>
          {formattedCreatedAt}
        </p>

        <p className="text-sm">
          <b>
            <FormattedMessage id="account.shares.table.expiresAt" />:{" "}
          </b>
          {formattedExpiration}
        </p>
        <hr className="border-gray-200 dark:border-gray-700" />
        <CopyTextField link={link} />
        <hr className="border-gray-200 dark:border-gray-700" />
        <p className="text-sm">
          <b>
            <FormattedMessage id="account.shares.table.size" />:{" "}
          </b>
          {formattedShareSize} / {formattedMaxShareSize} (
          {shareSizeProgress.toFixed(1)}%)
        </p>

        <div className="flex items-center justify-center gap-1">
          {share.size / maxShareSize < 0.1 && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {formattedShareSize}
            </span>
          )}
          <div className={share.size / maxShareSize < 0.1 ? "flex-1 max-w-[70%]" : "flex-1 max-w-[80%]"}>
            <Progress
              value={shareSizeProgress}
              label={share.size / maxShareSize >= 0.1 ? formattedShareSize : undefined}
              size="xl"
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {formattedMaxShareSize}
          </span>
        </div>
      </div>
    ),
  });
};

export default showShareInformationsModal;
