export default function Quiz({data}){
  let questions=[]
  try{ questions = JSON.parse(data) }catch{}
  if(!questions.length) return <pre>{data}</pre>
  return <ul>{questions.map((q,i)=>(
    <li key={i} className="mb-4"><strong>Q{i+1}:</strong> {q.question}<br/>Options: {q.options?.join(', ')}</li>
  ))}</ul>
}
