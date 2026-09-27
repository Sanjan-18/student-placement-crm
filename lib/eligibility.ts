import { Student, PlacementDrive } from "@prisma/client";

export type EligibilityResult = { eligible: boolean; reasons: string[] };

/**
 * Checks academic/drive rules plus the placement upgrade rule.
 * A placed student may apply only when the new drive package is at least
 * twice the package of their currently accepted offer.
 */
export function checkEligibility(
  student: Student,
  drive: PlacementDrive,
  currentAcceptedPackageLpa?: number | null,
): EligibilityResult {
  const reasons: string[] = [];
  if (drive.minCgpa != null && (student.cgpa == null || student.cgpa < drive.minCgpa))
    reasons.push(`Minimum CGPA required: ${drive.minCgpa}`);
  if (drive.maxBacklogs != null && student.backlogs > drive.maxBacklogs)
    reasons.push(`Maximum backlogs allowed: ${drive.maxBacklogs}`);
  if (drive.graduationYear != null && student.graduationYear !== drive.graduationYear)
    reasons.push(`Graduation year must be ${drive.graduationYear}`);
  if (drive.allowedDepartments?.trim()) {
    const allowed = drive.allowedDepartments.split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
    if (!student.department || !allowed.includes(student.department.trim().toLowerCase()))
      reasons.push(`Allowed departments: ${drive.allowedDepartments}`);
  }

  if (student.placementStatus === "PLACED" && currentAcceptedPackageLpa !== undefined && currentAcceptedPackageLpa != null) {
    if (drive.packageLpa == null) {
      reasons.push("This drive does not specify a package, so it cannot replace your current offer.");
    } else if (drive.packageLpa < currentAcceptedPackageLpa * 2) {
      reasons.push(`Package must be at least ${currentAcceptedPackageLpa * 2} LPA (2× your current accepted offer of ${currentAcceptedPackageLpa} LPA).`);
    }
  } else if (student.placementStatus === "PLACED" && currentAcceptedPackageLpa !== undefined && currentAcceptedPackageLpa == null) {
    reasons.push("Your current accepted offer has no package, so this drive cannot replace it.");
  }

  return { eligible: reasons.length === 0, reasons };
}
