import { useState, useRef, useEffect } from 'react'
import { generateResponse } from './lib/api.js'
import Diagram from './components/Diagram.jsx'
import Quiz from './components/Quiz.jsx'
import Practice from './components/Practice.jsx'

const modes = [
  { id:'explain', label:'Explain', desc:'Detailed learning' },
  { id:'concise', label:'Concise', desc:'Speak-ready short answers' },
  { id:'diagram', label:'Diagram', desc:'Architecture Mermaid' },
  { id:'quiz', label:'Quiz', desc:'Generate tests' },
  { id:'practice', label:'Practice', desc:'Q&A drill' },
]

export default function App(){
  const [mode, setMode] = useState('explain')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages, loading])

  const handleSubmit = async (e)=>{
    e.preventDefault()
    if(!input.trim()) return
    const userMsg = { role:'user', content:input, mode }
    setMessages(m=>[...m, userMsg])
    setInput('')
    setLoading(true)
    try{
      const res = await generateResponse(userMsg.content, mode)
      setMessages(m=>[...m, { role:'assistant', content:res, mode }])
    }catch(err){
      setMessages(m=>[...m, { role:'assistant', content:'Error: '+err.message, mode }])
    }
    setLoading(false)
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f1115] text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">IL</div>
          <div>
            <h1 className="font-semibold leading-tight">Interview Learning Assistant</h1>
            <p className="text-xs text-zinc-400">BYOK • Ethical learning only</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {modes.map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)} className={`px-3 py-1.5 rounded-full text-sm border ${mode===m.id?'bg-indigo-600 border-indigo-500':'border-zinc-700 hover:bg-zinc-800'}`}>{m.label}</button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        <aside className="w-64 border-r border-zinc-800 p-4 hidden md:block">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Modes</h2>
          <ul className="space-y-2">
            {modes.map(m=>(
              <li key={m.id}>
                <button onClick={()=>setMode(m.id)} className={`w-full text-left px-3 py-2 rounded-lg ${mode===m.id?'bg-zinc-800':'hover:bg-zinc-900'}`}>
                  <div className="font-medium">{m.label}</div>
                  <div className="text-xs text-zinc-400">{m.desc}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.length===0 && (
              <div className="max-w-2xl mx-auto text-center pt-24">
                <h2 className="text-2xl font-semibold mb-2">What do you want to learn today?</h2>
                <p className="text-zinc-400">Pick a mode and ask a question. Get detailed explanations, concise answers, diagrams, quizzes and practice drills.</p>
              </div>
            )}
            {messages.map((msg,i)=>(
              <div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-3xl rounded-2xl px-5 py-4 ${msg.role==='user'?'bg-indigo-600':'bg-zinc-900 border border-zinc-800'}`}>
                  <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">{msg.role==='user'?'You': 'Assistant • '+modes.find(m=>m.id===msg.mode)?.label}</div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.mode==='diagram' ? <Diagram code={msg.content}/> : <span>{msg.content}</span>}
                  </div>
                  {msg.mode==='quiz' && <Quiz data={msg.content}/>}
                  {msg.mode==='practice' && <Practice data={msg.content}/>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-4">
            <div className="max-w-3xl mx-auto flex items-end gap-2 bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 focus-within:ring-2 ring-indigo-600">
              <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSubmit(e) }}} placeholder={`Ask about ${modes.find(m=>m.id===mode)?.label.toLowerCase()}...`} rows={1} className="flex-1 bg-transparent outline-none resize-none py-2"/>
              <button disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-medium">Send</button>
            </div>
            <p className="text-center text-xs text-zinc-500 mt-2">Shift+Enter for newline</p>
          </form>
        </main>
      </div>
    </div>
  )
}
