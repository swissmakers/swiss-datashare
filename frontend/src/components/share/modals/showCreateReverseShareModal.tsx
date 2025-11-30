import { getCookie, setCookie } from "cookies-next";
import moment from "moment";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useTranslate, {
  translateOutsideContext,
} from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { Timespan } from "../../../types/timespan.type";
import { getExpirationPreview } from "../../../utils/date.util";
import toast from "../../../utils/toast.util";
import FileSizeInput from "../../core/FileSizeInput";
import showCompletedReverseShareModal from "./showCompletedReverseShareModal";
import { Button, NumberInput, Select, Switch } from "../../../components/ui";
import { useForm } from "../../../hooks/useForm";
import { ModalContextType } from "../../../contexts/ModalContext";
import clsx from "clsx";

const showCreateReverseShareModal = (
  modals: ModalContextType,
  showSendEmailNotificationOption: boolean,
  maxExpiration: Timespan,
  getReverseShares: () => void,
) => {
  const t = translateOutsideContext();
  return modals.openModal({
    title: t("account.reverseShares.modal.title"),
    size: "lg",
    children: (
      <Body
        showSendEmailNotificationOption={showSendEmailNotificationOption}
        getReverseShares={getReverseShares}
        maxExpiration={maxExpiration}
        modals={modals}
      />
    ),
  });
};

const Body = ({
  getReverseShares,
  showSendEmailNotificationOption,
  maxExpiration,
  modals,
}: {
  getReverseShares: () => void;
  showSendEmailNotificationOption: boolean;
  maxExpiration: Timespan;
  modals: ModalContextType;
}) => {
  const t = useTranslate();

  const validationSchema = yup.object().shape({
    maxUseCount: yup
      .number()
      .typeError(t("common.error.invalid-number"))
      .min(1, t("common.error.number-too-small", { min: 1 }))
      .max(1000, t("common.error.number-too-large", { max: 1000 }))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      maxShareSize: 104857600,
      maxUseCount: 1,
      sendEmailNotification: false,
      expiration_num: 1,
      expiration_unit: "-days",
      simplified: !!(getCookie("reverse-share.simplified") ?? false),
      publicAccess: !!(getCookie("reverse-share.public-access") ?? true),
    },
    validationSchema,
  });

  const onSubmit = form.onSubmit(async (values) => {
    // remember simplified and publicAccess in cookies
    setCookie("reverse-share.simplified", values.simplified);
    setCookie("reverse-share.public-access", values.publicAccess);

    const expirationDate = moment().add(
      form.values.expiration_num,
      form.values.expiration_unit.replace(
        "-",
        "",
      ) as moment.unitOfTime.DurationConstructor,
    );
    if (
      maxExpiration.value != 0 &&
      expirationDate.isAfter(
        moment().add(maxExpiration.value, maxExpiration.unit),
      )
    ) {
      form.setErrors({
        expiration_num: t("upload.modal.expires.error.too-long", {
          max: moment
            .duration(maxExpiration.value, maxExpiration.unit)
            .humanize(),
        }),
      });
      return;
    }

    shareService
      .createReverseShare(
        values.expiration_num + values.expiration_unit,
        values.maxShareSize,
        values.maxUseCount,
        values.sendEmailNotification,
        values.simplified,
        values.publicAccess,
      )
      .then(({ link }) => {
        modals.closeAll();
        showCompletedReverseShareModal(modals, link, getReverseShares);
      })
      .catch(toast.axiosError);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <div className={clsx("grid grid-cols-2 gap-4", form.errors.expiration_num && "items-center")}>
          <NumberInput
            min={1}
            max={99999}
            precision={0}
            label={t("account.reverseShares.modal.expiration.label")}
            value={form.values.expiration_num}
            onChange={(value) => form.setValue("expiration_num", value || 1)}
            error={form.errors.expiration_num}
          />
          <Select
            value={form.values.expiration_unit}
            onChange={(e) => {
              if (e) form.setValue("expiration_unit", e.target.value);
            }}
            options={[
              {
                value: "-minutes",
                label:
                  form.values.expiration_num == 1
                    ? t("upload.modal.expires.minute-singular")
                    : t("upload.modal.expires.minute-plural"),
              },
              {
                value: "-hours",
                label:
                  form.values.expiration_num == 1
                    ? t("upload.modal.expires.hour-singular")
                    : t("upload.modal.expires.hour-plural"),
              },
              {
                value: "-days",
                label:
                  form.values.expiration_num == 1
                    ? t("upload.modal.expires.day-singular")
                    : t("upload.modal.expires.day-plural"),
              },
              {
                value: "-weeks",
                label:
                  form.values.expiration_num == 1
                    ? t("upload.modal.expires.week-singular")
                    : t("upload.modal.expires.week-plural"),
              },
              {
                value: "-months",
                label:
                  form.values.expiration_num == 1
                    ? t("upload.modal.expires.month-singular")
                    : t("upload.modal.expires.month-plural"),
              },
              {
                value: "-years",
                label:
                  form.values.expiration_num == 1
                    ? t("upload.modal.expires.year-singular")
                    : t("upload.modal.expires.year-plural"),
              },
            ]}
            className="mt-6"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
          {getExpirationPreview(
            {
              expiresOn: t("account.reverseShare.expires-on"),
              neverExpires: t("account.reverseShare.never-expires"),
            },
            form,
          )}
        </p>
      </div>
      <FileSizeInput
        label={t("account.reverseShares.modal.max-size.label")}
        value={form.values.maxShareSize}
        onChange={(number) => form.setValue("maxShareSize", number)}
      />
      <NumberInput
        min={1}
        max={1000}
        precision={0}
        label={t("account.reverseShares.modal.max-use.label")}
        helperText={t("account.reverseShares.modal.max-use.description")}
        value={form.values.maxUseCount}
        onChange={(value) => form.setValue("maxUseCount", value || 1)}
      />
      {showSendEmailNotificationOption && (
        <Switch
          label={t("account.reverseShares.modal.send-email")}
          helperText={t("account.reverseShares.modal.send-email.description")}
          checked={form.values.sendEmailNotification}
          onChange={(checked) => form.setValue("sendEmailNotification", checked)}
        />
      )}
      <Switch
        label={t("account.reverseShares.modal.simplified")}
        helperText={t("account.reverseShares.modal.simplified.description")}
        checked={form.values.simplified}
        onChange={(checked) => form.setValue("simplified", checked)}
      />
      <Switch
        label={t("account.reverseShares.modal.public-access")}
        helperText={t("account.reverseShares.modal.public-access.description")}
        checked={form.values.publicAccess}
        onChange={(checked) => form.setValue("publicAccess", checked)}
      />
      <Button type="submit" fullWidth className="mt-4">
        <FormattedMessage id="common.button.create" />
      </Button>
    </form>
  );
};

export default showCreateReverseShareModal;
