import { redirect } from "next/navigation";

export default async function DepartmentsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}?tab=specialities`);
}
