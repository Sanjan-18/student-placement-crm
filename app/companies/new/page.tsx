import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CompanyForm from "@/components/companies/CompanyForm";

export default async function NewCompanyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/dashboard");
  return <section className="company-editor-page"><CompanyForm /></section>;
}
