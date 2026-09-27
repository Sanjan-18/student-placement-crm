export default function StatusBadge({value}:{value:string}){
 const label=value.replaceAll("_"," ");
 return <span className={`status-badge status-${value.toLowerCase()}`}>{label}</span>;
}
