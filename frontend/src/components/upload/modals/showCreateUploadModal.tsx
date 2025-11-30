import moment from "moment";
import React, { useState } from "react";
import { TbAlertCircle } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useTranslate, {
  translateOutsideContext,
} from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { FileUpload } from "../../../types/File.type";
import { CreateShare } from "../../../types/share.type";
import { getExpirationPreview } from "../../../utils/date.util";
import toast from "../../../utils/toast.util";
import { Timespan } from "../../../types/timespan.type";
import { Alert, Button, Input, PasswordInput, NumberInput, Select, Textarea, Checkbox, Accordion, MultiSelect } from "../../../components/ui";
import { useForm } from "../../../hooks/useForm";
import { ModalContextType } from "../../../contexts/ModalContext";
import clsx from "clsx";

const showCreateUploadModal = (
  modals: ModalContextType,
  options: {
    isUserSignedIn: boolean;
    isReverseShare: boolean;
    allowUnauthenticatedShares: boolean;
    enableEmailRecepients: boolean;
    maxExpiration: Timespan;
    shareIdLength: number;
    simplified: boolean;
  },
  files: FileUpload[],
  uploadCallback: (createShare: CreateShare, files: FileUpload[]) => void,
) => {
  const t = translateOutsideContext();

  if (options.simplified) {
    return modals.openModal({
      title: t("upload.modal.title"),
      children: (
        <SimplifiedCreateUploadModalModal
          options={options}
          files={files}
          uploadCallback={uploadCallback}
          modals={modals}
        />
      ),
    });
  }

  return modals.openModal({
    title: t("upload.modal.title"),
    size: "lg",
    children: (
      <CreateUploadModalBody
        options={options}
        files={files}
        uploadCallback={uploadCallback}
        modals={modals}
      />
    ),
  });
};

const generateShareId = (length: number = 16) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomArray = new Uint8Array(length >= 3 ? length : 3);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });
  return result;
};

const generateAvailableLink = async (
  shareIdLength: number,
  times: number = 10,
): Promise<string> => {
  if (times <= 0) {
    throw new Error("Could not generate available link");
  }
  const _link = generateShareId(shareIdLength);
  if (!(await shareService.isShareIdAvailable(_link))) {
    return await generateAvailableLink(shareIdLength, times - 1);
  } else {
    return _link;
  }
};

const CreateUploadModalBody = ({
  uploadCallback,
  files,
  options,
  modals,
}: {
  files: FileUpload[];
  uploadCallback: (createShare: CreateShare, files: FileUpload[]) => void;
  options: {
    isUserSignedIn: boolean;
    isReverseShare: boolean;
    allowUnauthenticatedShares: boolean;
    enableEmailRecepients: boolean;
    maxExpiration: Timespan;
    shareIdLength: number;
  };
  modals: ModalContextType;
}) => {
  const t = useTranslate();

  const generatedLink = generateShareId(options.shareIdLength);

  const [showNotSignedInAlert, setShowNotSignedInAlert] = useState(true);

  const validationSchema = yup.object().shape({
    link: yup
      .string()
      .required(t("common.error.field-required"))
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(50, t("common.error.too-long", { length: 50 }))
      .matches(new RegExp("^[a-zA-Z0-9_-]*$"), {
        message: t("upload.modal.link.error.invalid"),
      }),
    name: yup
      .string()
      .transform((value) => value || undefined)
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(30, t("common.error.too-long", { length: 30 })),
    password: yup
      .string()
      .transform((value) => value || undefined)
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(30, t("common.error.too-long", { length: 30 })),
    maxViews: yup
      .number()
      .transform((value) => value || undefined)
      .min(1),
  });

  const form = useForm({
    initialValues: {
      name: undefined,
      link: generatedLink,
      recipients: [] as string[],
      password: undefined,
      maxViews: undefined,
      description: undefined,
      expiration_num: 1,
      expiration_unit: "-days",
      never_expires: false,
    },
    validationSchema,
  });

  const onSubmit = form.onSubmit(async (values) => {
    if (!(await shareService.isShareIdAvailable(values.link))) {
      form.setErrors({ link: t("upload.modal.link.error.taken") });
    } else {
      const expirationString = form.values.never_expires
        ? "never"
        : form.values.expiration_num + form.values.expiration_unit;

      const expirationDate = moment().add(
        form.values.expiration_num,
        form.values.expiration_unit.replace(
          "-",
          "",
        ) as moment.unitOfTime.DurationConstructor,
      );

      if (
        options.maxExpiration.value != 0 &&
        (form.values.never_expires ||
          expirationDate.isAfter(
            moment().add(
              options.maxExpiration.value,
              options.maxExpiration.unit,
            ),
          ))
      ) {
        form.setErrors({
          expiration_num: t("upload.modal.expires.error.too-long", {
            max: moment
              .duration(options.maxExpiration.value, options.maxExpiration.unit)
              .humanize(),
          }),
        });
        return;
      }

      uploadCallback(
        {
          id: values.link,
          name: values.name,
          expiration: expirationString,
          recipients: values.recipients,
          description: values.description,
          security: {
            password: values.password || undefined,
            maxViews: values.maxViews || undefined,
          },
        },
        files,
      );
      modals.closeAll();
    }
  });

  return (
    <>
      {showNotSignedInAlert && !options.isUserSignedIn && (
        <Alert
          withCloseButton
          onClose={() => setShowNotSignedInAlert(false)}
          icon={<TbAlertCircle size={16} />}
          title={t("upload.modal.not-signed-in")}
          color="yellow"
          className="mb-4"
        >
          <FormattedMessage id="upload.modal.not-signed-in-description" />
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className={clsx("flex gap-2", form.errors.link && "items-center")}>
          <div className="flex-1">
            <Input
              label={t("upload.modal.link.label")}
              placeholder="myAwesomeShare"
              value={form.values.link as string}
              onChange={(e) => form.setValue("link", e.target.value)}
              error={form.errors.link}
            />
          </div>
          <Button
            variant="outline"
            onClick={() =>
              form.setValue(
                "link",
                generateShareId(options.shareIdLength),
              )
            }
            type="button"
            className="mt-6"
          >
            <FormattedMessage id="common.button.generate" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 truncate italic">
          {`${window.location.origin}/s/${form.values.link}`}
        </p>
        {!options.isReverseShare && (
          <>
            <div className={clsx("grid grid-cols-2 gap-4", form.errors.expiration_num && "items-center")}>
              <NumberInput
                min={1}
                max={99999}
                precision={0}
                label={t("upload.modal.expires.label")}
                disabled={form.values.never_expires}
                value={form.values.expiration_num}
                onChange={(value) => form.setValue("expiration_num", value || 1)}
                error={form.errors.expiration_num}
              />
              <Select
                disabled={form.values.never_expires}
                value={form.values.expiration_unit}
                onChange={(e) => form.setValue("expiration_unit", e.target.value)}
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
            {options.maxExpiration.value == 0 && (
              <Checkbox
                label={t("upload.modal.expires.never-long")}
                checked={form.values.never_expires}
                onChange={(e) => form.setValue("never_expires", e.target.checked)}
              />
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {getExpirationPreview(
                {
                  neverExpires: t("upload.modal.completed.never-expires"),
                  expiresOn: t("upload.modal.completed.expires-on"),
                },
                form,
              )}
            </p>
          </>
        )}
        <Accordion>
          <Accordion.Item value="description">
            <Accordion.Control>
              <FormattedMessage id="upload.modal.accordion.name-and-description.title" />
            </Accordion.Control>
            <Accordion.Panel>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder={t(
                    "upload.modal.accordion.name-and-description.name.placeholder",
                  )}
                  value={typeof form.values.name === "string" ? form.values.name : ""}
                  onChange={(e) => form.setValue("name", e.target.value)}
                  error={form.errors.name}
                />
                <Textarea
                  placeholder={t(
                    "upload.modal.accordion.name-and-description.description.placeholder",
                  )}
                  value={typeof form.values.description === "string" ? form.values.description : ""}
                  onChange={(e) => form.setValue("description", e.target.value)}
                  error={form.errors.description}
                />
              </div>
            </Accordion.Panel>
          </Accordion.Item>
          {options.enableEmailRecepients && (
            <Accordion.Item value="recipients">
              <Accordion.Control>
                <FormattedMessage id="upload.modal.accordion.email.title" />
              </Accordion.Control>
              <Accordion.Panel>
                <div className="pt-4">
                  <MultiSelect
                    value={form.values.recipients}
                    onChange={(value) => form.setValue("recipients", value)}
                    placeholder={t("upload.modal.accordion.email.placeholder")}
                    searchable
                    creatable
                    getCreateLabel={(query) => `+ ${query}`}
                    onCreate={(query) => {
                      if (!query.match(/^\S+@\S+\.\S+$/)) {
                        form.setErrors({
                          recipients: t("upload.modal.accordion.email.invalid-email"),
                        });
                      } else {
                        form.setErrors({ recipients: undefined });
                        const newRecipients = [...form.values.recipients, query];
                        form.setValue("recipients", newRecipients);
                        return query;
                      }
                    }}
                    inputMode="email"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      // Add email on comma or semicolon
                      if (e.key === "Enter" || e.key === "," || e.key === ";") {
                        e.preventDefault();
                        const inputValue = (
                          e.target as HTMLInputElement
                        ).value.trim();
                        if (inputValue.match(/^\S+@\S+\.\S+$/)) {
                          const newRecipients = [...form.values.recipients, inputValue];
                          form.setValue("recipients", newRecipients);
                          (e.target as HTMLInputElement).value = "";
                        }
                      } else if (e.key === " ") {
                        e.preventDefault();
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          )}

          <Accordion.Item value="security">
            <Accordion.Control>
              <FormattedMessage id="upload.modal.accordion.security.title" />
            </Accordion.Control>
            <Accordion.Panel>
              <div className="space-y-4 pt-4">
                <PasswordInput
                  placeholder={t(
                    "upload.modal.accordion.security.password.placeholder",
                  )}
                  label={t("upload.modal.accordion.security.password.label")}
                  autoComplete="new-password"
                  value={typeof form.values.password === "string" ? form.values.password : ""}
                  onChange={(e) => form.setValue("password", e.target.value)}
                  error={form.errors.password}
                />
                <NumberInput
                  min={1}
                  placeholder={t(
                    "upload.modal.accordion.security.max-views.placeholder",
                  )}
                  label={t("upload.modal.accordion.security.max-views.label")}
                  value={typeof form.values.maxViews === "number" ? form.values.maxViews : undefined}
                  onChange={(value) => form.setValue("maxViews", value || undefined)}
                />
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Button type="submit" fullWidth>
          <FormattedMessage id="common.button.share" />
        </Button>
      </form>
    </>
  );
};

const SimplifiedCreateUploadModalModal = ({
  uploadCallback,
  files,
  options,
  modals,
}: {
  files: FileUpload[];
  uploadCallback: (createShare: CreateShare, files: FileUpload[]) => void;
  options: {
    isUserSignedIn: boolean;
    isReverseShare: boolean;
    allowUnauthenticatedShares: boolean;
    enableEmailRecepients: boolean;
    maxExpiration: Timespan;
    shareIdLength: number;
  };
  modals: ModalContextType;
}) => {
  const t = useTranslate();

  const [showNotSignedInAlert, setShowNotSignedInAlert] = useState(true);

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .transform((value) => value || undefined)
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(30, t("common.error.too-long", { length: 30 })),
  });

  const form = useForm({
    initialValues: {
      name: undefined,
      description: undefined,
    },
    validationSchema,
  });

  const onSubmit = form.onSubmit(async (values) => {
    const link = await generateAvailableLink(options.shareIdLength).catch(
      () => {
        toast.error(t("upload.modal.link.error.taken"));
        return undefined;
      },
    );

    if (!link) {
      return;
    }

    uploadCallback(
      {
        id: link,
        name: values.name,
        expiration: "never",
        recipients: [],
        description: values.description,
        security: {
          password: undefined,
          maxViews: undefined,
        },
      },
      files,
    );
    modals.closeAll();
  });

  return (
    <div className="space-y-4">
      {showNotSignedInAlert && !options.isUserSignedIn && (
        <Alert
          withCloseButton
          onClose={() => setShowNotSignedInAlert(false)}
          icon={<TbAlertCircle size={16} />}
          title={t("upload.modal.not-signed-in")}
          color="yellow"
        >
          <FormattedMessage id="upload.modal.not-signed-in-description" />
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-4">
          <Input
            placeholder={t(
              "upload.modal.accordion.name-and-description.name.placeholder",
            )}
            value={typeof form.values.name === "string" ? form.values.name : ""}
            onChange={(e) => form.setValue("name", e.target.value)}
            error={form.errors.name}
          />
          <Textarea
            placeholder={t(
              "upload.modal.accordion.name-and-description.description.placeholder",
            )}
            value={typeof form.values.description === "string" ? form.values.description : ""}
            onChange={(e) => form.setValue("description", e.target.value)}
            error={form.errors.description}
          />
        </div>
        <Button type="submit" fullWidth>
          <FormattedMessage id="common.button.share" />
        </Button>
      </form>
    </div>
  );
};

export default showCreateUploadModal;
