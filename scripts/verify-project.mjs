import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const required=[
  "package.json","tsconfig.json","next.config.ts","middleware.ts",
  "prisma/schema.prisma","auth.ts","lib/prisma.ts","app/layout.tsx"
];
const missing=required.filter(p=>!fs.existsSync(path.join(root,p)));
const schema=fs.readFileSync(path.join(root,"prisma/schema.prisma"),"utf8");
const checks=[
  ["Prisma User model",/model User\s*\{/.test(schema)],
  ["Student model",/model Student\s*\{/.test(schema)],
  ["PlacementDrive model",/model PlacementDrive\s*\{/.test(schema)],
  ["Notification model",/model Notification\s*\{/.test(schema)],
  ["FCM token model",/model FcmToken\s*\{/.test(schema)],
  ["CRM activity model",/model CrmActivity\s*\{/.test(schema)],
  ["Student document model",/model StudentDocument\s*\{/.test(schema)]
];
console.log("Student Placement CRM verification");
console.log("===============================");
console.log(`Missing required files: ${missing.length}`);
if(missing.length) console.log(missing.join("\n"));
for(const [name,ok] of checks) console.log(`${ok?"PASS":"FAIL"}  ${name}`);
process.exit(missing.length || checks.some(([,ok])=>!ok) ? 1 : 0);
