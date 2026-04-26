import { useCallback, useEffect, useState } from "react";
import { TbEdit, TbPlus, TbTrash } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import CenterLoader from "../../components/core/CenterLoader";
import {
  Button,
  Card,
  Container,
  Input,
  Modal,
  Select,
  Table,
  Textarea,
} from "../../components/ui";
import { useModals } from "../../contexts/ModalContext";
import useTranslate from "../../hooks/useTranslate.hook";
import contactService from "../../services/contact.service";
import type { ContactKind, UserContact } from "../../types/contact.type";
import toast from "../../utils/toast.util";

const CONTACT_KINDS: ContactKind[] = ["person", "company"];

const MyContacts = () => {
  const t = useTranslate();
  const modals = useModals();
  const [contacts, setContacts] = useState<UserContact[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserContact | null>(null);
  const [formKind, setFormKind] = useState<ContactKind>("person");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  const refresh = useCallback(async () => {
    try {
      const list = await contactService.list(debouncedSearch, 200);
      setContacts(list);
    } catch {
      setContacts([]);
      toast.error(t("contacts.load-error"));
    }
  }, [debouncedSearch, t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openAdd = () => {
    setEditing(null);
    setFormKind("person");
    setFormName("");
    setFormEmail("");
    setFormNotes("");
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (c: UserContact) => {
    setEditing(c);
    setFormKind(c.kind === "institution" ? "company" : c.kind);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormNotes(c.notes ?? "");
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const saveContact = async () => {
    setFormError(null);
    const name = formName.trim();
    const email = formEmail.trim();
    if (!name) {
      setFormError(t("contacts.error.name-required"));
      return;
    }
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setFormError(t("contacts.error.invalid-email"));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await contactService.update(editing.id, {
          kind: formKind,
          name,
          email,
          notes: formNotes.trim() || null,
        });
        toast.success(t("contacts.saved"));
      } else {
        await contactService.create({
          kind: formKind,
          name,
          email,
          notes: formNotes.trim() || undefined,
        });
        toast.success(t("contacts.created"));
      }
      closeModal();
      await refresh();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setFormError(
        typeof msg === "string" ? msg : t("contacts.error.save-failed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (c: UserContact) => {
    modals.openConfirmModal({
      title: t("contacts.delete.title"),
      children: (
        <p>
          <FormattedMessage
            id="contacts.delete.body"
            values={{ name: c.name, email: c.email }}
          />
        </p>
      ),
      labels: {
        confirm: t("contacts.delete.confirm"),
        cancel: t("common.button.cancel"),
      },
      confirmProps: { variant: "danger" },
      onConfirm: async () => {
        try {
          await contactService.remove(c.id);
          toast.success(t("contacts.deleted"));
          await refresh();
        } catch {
          toast.error(t("contacts.delete-error"));
        }
      },
    });
  };

  if (!contacts) return <CenterLoader />;

  const kindOptions = CONTACT_KINDS.map((k) => ({
    value: k,
    label: t(`contacts.kind.${k}`),
  }));

  return (
    <>
      <Meta title={t("contacts.page-title")} />
      <Container size="lg">
        <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <h1 className="page-title">
            <FormattedMessage id="contacts.title" />
          </h1>
          <Button type="button" onClick={openAdd}>
            <TbPlus className="mr-2" size={18} />
            <FormattedMessage id="contacts.add" />
          </Button>
        </div>

        <Card padding="none" className="mb-6 p-[1.3rem]">
          <Input
            label={t("contacts.search.label")}
            placeholder={t("contacts.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {contacts.length === 0 ? (
          <div className="flex h-[60vh] flex-col items-center justify-center">
            <h3 className="section-title mb-2 text-center">
              <FormattedMessage id="contacts.empty.title" />
            </h3>
            <p className="body-text max-w-md text-center">
              <FormattedMessage id="contacts.empty" />
            </p>
          </div>
        ) : (
          <Card padding="none" className="mb-6 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Cell header>
                      <FormattedMessage id="contacts.table.kind" />
                    </Table.Cell>
                    <Table.Cell header>
                      <FormattedMessage id="contacts.table.name" />
                    </Table.Cell>
                    <Table.Cell header>
                      <FormattedMessage id="contacts.table.email" />
                    </Table.Cell>
                    <Table.Cell header>
                      <FormattedMessage id="contacts.table.notes" />
                    </Table.Cell>
                    <Table.Cell header />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {contacts.map((c) => (
                    <Table.Row key={c.id}>
                      <Table.Cell>{t(`contacts.kind.${c.kind}`)}</Table.Cell>
                      <Table.Cell className="font-medium">{c.name}</Table.Cell>
                      <Table.Cell>
                        <a
                          className="text-primary-600 hover:underline dark:text-primary-400"
                          href={`mailto:${c.email}`}
                        >
                          {c.email}
                        </a>
                      </Table.Cell>
                      <Table.Cell className="min-w-[10rem] max-w-xl whitespace-normal break-words text-sm text-gray-600 dark:text-gray-400">
                        {c.notes || "—"}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={t("contacts.edit")}
                            onClick={() => openEdit(c)}
                          >
                            <TbEdit className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={t("contacts.delete")}
                            onClick={() => confirmDelete(c)}
                          >
                            <TbTrash className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Card>
        )}
      </Container>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editing ? t("contacts.modal.edit-title") : t("contacts.modal.add-title")
        }
        size="md"
      >
        <div className="space-y-4 text-left">
          <Select
            label={t("contacts.form.kind")}
            options={kindOptions}
            value={formKind}
            onChange={(e) => setFormKind(e.target.value as ContactKind)}
          />
          <Input
            label={t("contacts.form.name")}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Input
            label={t("contacts.form.email")}
            type="email"
            autoComplete="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />
          <Textarea
            label={t("contacts.form.notes")}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            rows={3}
          />
          {formError && (
            <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              <FormattedMessage id="common.button.cancel" />
            </Button>
            <Button type="button" onClick={() => void saveContact()} disabled={saving}>
              <FormattedMessage id="common.button.save" />
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MyContacts;
