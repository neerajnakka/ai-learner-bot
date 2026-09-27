export default function Diagram({code}){
  if(!code) return null
  const mermaid = code.match(/```mermaid\n([\s\S]*?)```/)?.[1] || code
  return <pre className="bg-gray-100 p-3 rounded overflow-auto">{mermaid}</pre>
}
