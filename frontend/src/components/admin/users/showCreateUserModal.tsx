import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useTranslate from "../../../hooks/useTranslate.hook";
import userService from "../../../services/user.service";
import toast from "../../../utils/toast.util";
import { Button, Input, PasswordInput, Switch } from "../../../components/ui";
import { useForm } from "../../../hooks/useForm";
import { ModalContextType } from "../../../contexts/ModalContext";

const showCreateUserModal = (
  modals: ModalContextType,
  smtpEnabled: boolean,
  getUsers: () => void,
) => {
  return modals.openModal({
    title: "Create user",
    children: (
      <Body modals={modals} smtpEnabled={smtpEnabled} getUsers={getUsers} />
    ),
  });
};

const Body = ({
  modals,
  smtpEnabled,
  getUsers,
}: {
  modals: ModalContextType;
  smtpEnabled: boolean;
  getUsers: () => void;
}) => {
  const t = useTranslate();
  
  const validationSchema = yup.object().shape({
    email: yup.string().email(t("common.error.invalid-email")),
    username: yup
      .string()
      .min(3, t("common.error.too-short", { length: 3 })),
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .optional(),
  });

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: undefined,
      isAdmin: false,
      setPasswordManually: false,
    },
    validationSchema,
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        userService
          .create(values)
          .then(() => {
            getUsers();
            modals.closeAll();
          })
          .catch(toast.axiosError);
      })}
      className="space-y-4"
    >
      <Input
        label={t("admin.users.modal.create.username")}
        value={form.values.username}
        onChange={(e) => form.setValue("username", e.target.value)}
        error={(form.errors as any).username}
      />
      <Input
        label={t("admin.users.modal.create.email")}
        type="email"
        value={form.values.email}
        onChange={(e) => form.setValue("email", e.target.value)}
        error={(form.errors as any).email}
      />
      {smtpEnabled && (
        <Switch
          label={t("admin.users.modal.create.manual-password")}
          helperText={t("admin.users.modal.create.manual-password.description")}
          checked={form.values.setPasswordManually}
          onChange={(checked) => form.setValue("setPasswordManually", checked)}
        />
      )}
      {(form.values.setPasswordManually || !smtpEnabled) && (
        <PasswordInput
          label={t("admin.users.modal.create.password")}
          value={form.values.password || ""}
          onChange={(e) => form.setValue("password", e.target.value)}
          error={(form.errors as any).password}
        />
      )}
      <Switch
        label={t("admin.users.modal.create.admin")}
        helperText={t("admin.users.modal.create.admin.description")}
        checked={form.values.isAdmin}
        onChange={(checked) => form.setValue("isAdmin", checked)}
      />
      <div className="flex justify-end">
        <Button type="submit">
          <FormattedMessage id="common.button.create" />
        </Button>
      </div>
    </form>
  );
};

export default showCreateUserModal;
