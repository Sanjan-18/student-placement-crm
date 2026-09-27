export function isStaff(role?:string|null){return role==="ADMIN"||role==="PLACEMENT_OFFICER";}
export function isAdmin(role?:string|null){return role==="ADMIN";}
export function canManageStudent(role?:string|null){return isStaff(role);}
export function canManageCompany(role?:string|null){return isStaff(role);}
export function canManageDrive(role?:string|null){return isStaff(role);}
