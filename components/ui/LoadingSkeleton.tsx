export default function LoadingSkeleton({rows=5}:{rows?:number}){
 return <div className="skeleton-list" aria-label="Loading">{Array.from({length:rows}).map((_,i)=><div className="skeleton-row" key={i}><span/><span/><span/></div>)}</div>;
}
