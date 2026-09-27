export default function EligibilityReasons({reasons}:{reasons:string[]}){
 return <div className="reason-list">{reasons.length?reasons.map((r,i)=><div className="reason-item" key={i}><span>×</span>{r}</div>):<div className="reason-item success"><span>✓</span>Eligible for this drive</div>}</div>
}