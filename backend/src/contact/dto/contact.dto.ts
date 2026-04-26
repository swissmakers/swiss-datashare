export type ContactEntity = {
  id: string;
  kind: string;
  name: string;
  email: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ContactDTO {
  id!: string;
  kind!: string;
  name!: string;
  email!: string;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  from(contact: ContactEntity): ContactDTO {
    this.id = contact.id;
    this.kind = contact.kind;
    this.name = contact.name;
    this.email = contact.email;
    this.notes = contact.notes ?? null;
    this.createdAt = contact.createdAt;
    this.updatedAt = contact.updatedAt;
    return this;
  }

  fromList(contacts: ContactEntity[]): ContactDTO[] {
    return contacts.map((c) => new ContactDTO().from(c));
  }
}
