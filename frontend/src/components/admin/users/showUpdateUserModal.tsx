import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useTranslate, {
  translateOutsideContext,
} from "../../../hooks/useTranslate.hook";
import userService from "../../../services/user.service";
import User from "../../../types/user.type";
import toast from "../../../utils/toast.util";
import { Button, Input, PasswordInput, Switch, Accordion } from "../../../components/ui";
import { useForm } from "../../../hooks/useForm";
import { ModalContextType } from "../../../contexts/ModalContext";

const showUpdateUserModal = (
  modals: ModalContextType,
  user: User,
  getUsers: () => void,
) => {
  const t = translateOutsideContext();
  return modals.openModal({
    title: t("admin.users.edit.update.title", { username: user.username }),
    size: "lg",
    children: <Body user={user} modals={modals} getUsers={getUsers} />,
  });
};

const Body = ({
  user,
  modals,
  getUsers,
}: {
  modals: ModalContextType;
  user: User;
  getUsers: () => void;
}) => {
  const t = useTranslate();

  const accountValidationSchema = yup.object().shape({
    email: yup.string().email(t("common.error.invalid-email")),
    username: yup
      .string()
      .min(3, t("common.error.too-short", { length: 3 })),
  });

  const accountForm = useForm({
    initialValues: {
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    validationSchema: accountValidationSchema,
  });

  const passwordValidationSchema = yup.object().shape({
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 })),
  });

  const passwordForm = useForm({
    initialValues: {
      password: "",
    },
    validationSchema: passwordValidationSchema,
  });

  return (
    <div className="space-y-4">
      <form
        id="accountForm"
        onSubmit={accountForm.onSubmit(async (values) => {
          userService
            .update(user.id, values)
            .then(() => {
              getUsers();
              modals.closeAll();
            })
            .catch(toast.axiosError);
        })}
        className="space-y-4"
      >
        <Input
          label={t("admin.users.table.username")}
          value={accountForm.values.username}
          onChange={(e) => accountForm.setValue("username", e.target.value)}
          error={(accountForm.errors as any).username}
        />
        <Input
          label={t("admin.users.table.email")}
          type="email"
          value={accountForm.values.email}
          onChange={(e) => accountForm.setValue("email", e.target.value)}
          error={(accountForm.errors as any).email}
        />
        <Switch
          label={t("admin.users.edit.update.admin-privileges")}
          checked={accountForm.values.isAdmin}
          onChange={(checked) => accountForm.setValue("isAdmin", checked)}
        />
      </form>
      <Accordion>
        <Accordion.Item value="changePassword">
          <Accordion.Control>
            <FormattedMessage id="admin.users.edit.update.change-password.title" />
          </Accordion.Control>
          <Accordion.Panel>
            <form
              onSubmit={passwordForm.onSubmit(async (values) => {
                userService
                  .update(user.id, {
                    password: values.password,
                  })
                  .then(() =>
                    toast.success(
                      t("admin.users.edit.update.notify.password.success"),
                    ),
                  )
                  .catch(toast.axiosError);
              })}
              className="space-y-4 pt-4"
            >
              <PasswordInput
                label={t("admin.users.edit.update.change-password.field")}
                {...passwordForm.getInputProps("password")}
              />
              <Button variant="outline" type="submit">
                <FormattedMessage id="admin.users.edit.update.change-password.button" />
              </Button>
            </form>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <div className="flex justify-end">
        <Button type="submit" form="accountForm">
          <FormattedMessage id="common.button.save" />
        </Button>
      </div>
    </div>
  );
};

export default showUpdateUserModal;
