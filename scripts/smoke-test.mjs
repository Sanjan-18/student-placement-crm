const base=process.env.BASE_URL||"http://localhost:3000";
const checks=[
  ["health",`${base}/api/health`,200],
  ["login page",`${base}/login`,200],
];
let failed=0;
for(const [name,url,expected] of checks){
  try{
    const r=await fetch(url,{redirect:"manual"});
    const ok=r.status===expected;
    console.log(`${ok?"PASS":"FAIL"}  ${name} (${r.status})`);
    if(!ok)failed++;
  }catch(e){
    console.log(`FAIL  ${name} (${e.message})`);
    failed++;
  }
}
console.log(`\nSmoke tests: ${failed?"FAILED":"PASSED"}`);
process.exit(failed?1:0);
