export type ContactKind = "person" | "company" | "institution";

export type UserContact = {
  id: string;
  kind: ContactKind;
  name: string;
  email: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateContactPayload = {
  kind: ContactKind;
  name: string;
  email: string;
  notes?: string;
};

export type UpdateContactPayload = {
  kind?: ContactKind;
  name?: string;
  email?: string;
  notes?: string | null;
};
