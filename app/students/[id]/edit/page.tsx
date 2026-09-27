import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import StudentForm from "@/components/students/StudentForm";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/dashboard");
  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
  if (!student) notFound();
  return (
    <section className="student-editor">
      <div className="editor-back"><Link href={`/students/${id}`}>← Back to student profile</Link></div>
      <StudentForm initial={{ id: student.id, name: student.user.name, email: student.user.email, phone: student.phone, usn: student.usn, department: student.department, graduationYear: student.graduationYear, cgpa: student.cgpa, tenthPercentage: student.tenthPercentage, twelfthPercentage: student.twelfthPercentage, backlogs: student.backlogs, resumeUrl: student.resumeUrl, placementStatus: student.placementStatus }} />
    </section>
  );
}
