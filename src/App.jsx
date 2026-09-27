import { useState, useRef, useEffect } from 'react'
import { generateResponse } from './lib/api.js'
import Diagram from './components/Diagram.jsx'
import Quiz from './components/Quiz.jsx'
import Practice from './components/Practice.jsx'

const modes = [
  { id:'explain', label:'Explain', desc:'Deep concept breakdown', icon:'🧠' },
  { id:'concise', label:'Concise', desc:'Speak-ready 30-60s', icon:'🎯' },
  { id:'diagram', label:'Diagram', desc:'Mermaid architecture', icon:'🗺️' },
  { id:'quiz', label:'Quiz', desc:'Test generation', icon:'✏️' },
  { id:'practice', label:'Practice', desc:'Drill questions', icon:'🎙️' },
]

export default function App(){
  const [mode, setMode] = useState('explain')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Welcome to AI Learner Bot. Pick a mode and ask anything. All learning, fully transparent, BYOK.', mode:'explain' }
  ])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const endRef = useRef(null)

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages, loading])

  const handleSubmit = async (e)=>{
    e.preventDefault()
    if(!input.trim() || loading) return
    const userMsg = { role:'user', content:input, mode, ts:Date.now() }
    setMessages(m=>[...m, userMsg])
    setInput('')
    setLoading(true)
    try{
      const res = await generateResponse(userMsg.content, mode)
      setMessages(m=>[...m, { role:'assistant', content:res, mode, ts:Date.now() }])
    }catch(err){
      setMessages(m=>[...m, { role:'assistant', content:'Error: '+err.message, mode, ts:Date.now() }])
    }
    setLoading(false)
  }

  const copy = async (text)=>{ await navigator.clipboard.writeText(text); }

  return (
    <div className="h-screen bg-[#07090f] text-zinc-100 flex overflow-hidden selection:bg-violet-500/30">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/20 blur-[150px] rounded-full"/>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full"/>
      </div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen?'w-72':'w-0'} transition-all duration-300 border-r border-white/10 bg-black/40 backdrop-blur-xl hidden md:flex flex-col`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center font-bold shadow-lg shadow-violet-900/30">AL</div>
            <div>
              <div className="font-semibold tracking-tight">AI Learner Bot</div>
              <div className="text-xs text-zinc-400">BYOK • Ethical Learning</div>
            </div>
          </div>
        </div>
        <div className="p-3">
          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-sm font-medium transition">+ New Chat</button>
        </div>
        <div className="px-4 py-2 text-[11px] uppercase tracking-widest text-zinc-500">Recent</div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1 text-sm">
          {['System Design Basics','React Interview Prep','DB Indexing'].map(t=>(
            <div key={t} className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-zinc-300">{t}</div>
          ))}
        </div>
        <div className="p-3 border-t border-white/10 text-xs text-zinc-500">No stealth mode. Transparent learning only.</div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-white/10 bg-black/30 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(s=>!s)} className="md:hidden p-2 rounded-lg hover:bg-white/10">☰</button>
            <div className="hidden sm:flex items-center gap-2">
              {modes.map(m=>(
                <button key={m.id} onClick={()=>setMode(m.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${mode===m.id?'bg-white/10 border-white/20':'border-white/10 hover:bg-white/5 text-zinc-300'}`}>
                  <span className="mr-1">{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-xs text-zinc-400">Mode: <span className="text-zinc-200 font-medium">{modes.find(m=>m.id===mode)?.desc}</span></div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-xs font-bold">U</div>
          </div>
        </header>

        {/* Chat */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {messages.map((msg,i)=>{
              const isUser = msg.role==='user'
              return (
                <div key={i} className={`flex gap-3 ${isUser?'justify-end':''}`}>
                  {!isUser && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-sm font-bold mt-1">AI</div>}
                  <div className={`max-w-[78%] rounded-[20px] px-5 py-4 ${isUser?'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm':'bg-white/[0.06] border border-white/10 backdrop-blur rounded-bl-sm'}`}>
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">{isUser?'You':`Assistant • ${modes.find(m=>m.id===msg.mode)?.label}`}</div>
                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed whitespace-pre-wrap">
                      {msg.mode==='diagram' ? <Diagram code={msg.content}/> : <span>{msg.content}</span>}
                    </div>
                    {msg.mode==='quiz' && <Quiz data={msg.content}/>}
                    {msg.mode==='practice' && <Practice data={msg.content}/>}
                    <div className="flex items-center gap-3 mt-3 text-[11px] opacity-70">
                      <button onClick={()=>copy(msg.content)} className="hover:opacity-100 transition">Copy</button>
                      <button className="hover:opacity-100 transition">Regenerate</button>
                    </div>
                  </div>
                  {isUser && <div className="w-8 h-8 rounded-full bg-zinc-700 grid place-items-center text-sm font-bold mt-1">U</div>}
                </div>
              )
            })}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center">AI</div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[20px] px-5 py-4">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>
        </main>

        {/* Composer */}
        <footer className="p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="rounded-[24px] border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-2xl shadow-black/40 focus-within:border-violet-500/50 transition">
                <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSubmit(e) }}} placeholder={`Ask for ${modes.find(m=>m.id===mode)?.label.toLowerCase()}...`} rows={1} className="w-full bg-transparent outline-none resize-none p-4 pr-16 placeholder-zinc-500"/>
                <button disabled={loading || !input.trim()} className="absolute right-2 bottom-2 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg shadow-violet-900/30 transition">Send</button>
              </div>
              <div className="text-center text-[11px] text-zinc-500 mt-2">Shift+Enter for new line • Transparent learning, no hidden overlays</div>
            </form>
          </div>
        </footer>
      </div>
    </div>
  )
}
