import { PrismaClient } from "@prisma/client";



type Input = {
  email?: string;
  phoneNumber?: string;
};

type Contact = Awaited<ReturnType<PrismaClient['contact']['findFirst']>>;

export const handleIdentify = async (prisma: PrismaClient, input: Input) => {
  const { email, phoneNumber } = input;

  if (!email && !phoneNumber) {
    throw new Error('At least email or phoneNumber must be provided');
  }

  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  if (contacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      },
    });

    return {
      primaryContatctId: newContact.id,
      emails: [newContact.email].filter(Boolean),
      phoneNumbers: [newContact.phoneNumber].filter(Boolean),
      secondaryContactIds: [],
    };
  }

  const allLinked = await getAllLinkedContacts(prisma, contacts as Contact[]);
  const primary = allLinked.find((c: Contact) => c.linkPrecedence === 'primary')!;
  const secondary = allLinked.filter((c: Contact) => c.id !== primary.id);

  const existingEmails = new Set(
    allLinked.map((c: Contact) => c.email!).filter(Boolean)
  );
  const existingPhones = new Set(
    allLinked.map((c: Contact) => c.phoneNumber!).filter(Boolean)
  );

  const isNewEmail = email && !existingEmails.has(email);
  const isNewPhone = phoneNumber && !existingPhones.has(phoneNumber);

  if (isNewEmail || isNewPhone) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primary.id,
      },
    });
    secondary.push(newContact as Contact);
    if (email) existingEmails.add(email);
    if (phoneNumber) existingPhones.add(phoneNumber);
  }

  return {
    primaryContatctId: primary.id,
    emails: [
      primary.email!,
      ...[...existingEmails].filter((e) => e !== primary.email),
    ],
    phoneNumbers: [
      primary.phoneNumber!,
      ...[...existingPhones].filter((p) => p !== primary.phoneNumber),
    ],
    secondaryContactIds: secondary.map((s: Contact) => s.id),
  };
};

const getAllLinkedContacts = async (
  prisma: PrismaClient,
  contacts: Contact[]
): Promise<Contact[]> => {
  const primaryCandidates = contacts.filter(
    (c: Contact) => c.linkPrecedence === 'primary'
  );
  const oldestPrimary =
    primaryCandidates.sort(
      (a: Contact, b: Contact) =>
        a.createdAt.getTime() - b.createdAt.getTime()
    )[0] || contacts[0];

  for (const other of primaryCandidates) {
    if (other.id !== oldestPrimary.id) {
      await prisma.contact.update({
        where: { id: other.id },
        data: {
          linkPrecedence: 'secondary',
          linkedId: oldestPrimary.id,
        },
      });
    }
  }

  return await prisma.contact.findMany({
    where: {
      OR: [{ id: oldestPrimary.id }, { linkedId: oldestPrimary.id }],
    },
    orderBy: { createdAt: 'asc' },
  });
};
