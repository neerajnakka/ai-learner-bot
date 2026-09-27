import { useEffect, useRef } from 'react'

export default function Diagram({code}){
  const ref = useRef(null)
  if(!code) return null
  const mermaid = code.match(/```mermaid\n([\s\S]*?)```/)?.[1] || code.match(/```\n([\s\S]*?)```/)?.[1] || code

  useEffect(()=>{
    if(window.mermaid && ref.current){
      try{
        window.mermaid.initialize({ startOnLoad:false, theme:'dark' })
        window.mermaid.render('mermaid-'+Math.random().toString(36).slice(2), mermaid).then(({svg})=>{
          ref.current.innerHTML = svg
        })
      }catch(e){ ref.current.textContent = mermaid }
    }
  }, [mermaid])

  return <div ref={ref} className="my-3 rounded-xl bg-white/5 border border-white/10 p-3 overflow-auto text-left"/>
}
