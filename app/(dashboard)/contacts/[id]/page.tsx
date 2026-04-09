import { ContactDetail } from "@/features/contacts/components/contact-detail";

type ContactDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  return <ContactDetail contactId={id} />;
}
