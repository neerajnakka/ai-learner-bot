import { useState, useRef, useEffect } from 'react'
import { generateResponse } from './lib/api.js'
import Diagram from './components/Diagram.jsx'
import Quiz from './components/Quiz.jsx'
import Practice from './components/Practice.jsx'

const modes = [
  { id:'explain', label:'Explain', icon:'🧠' },
  { id:'concise', label:'Concise', icon:'⚡' },
  { id:'diagram', label:'Diagram', icon:'🔀' },
  { id:'quiz', label:'Quiz', icon:'❓' },
  { id:'practice', label:'Practice', icon:'🎯' },
]

export default function App(){
  const [mode, setMode] = useState('explain')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { id:1, role:'assistant', content:'Hi! I’m your AI Learner Bot. Pick a mode and ask anything. All learning, transparent, BYOK.', mode:'explain' }
  ])
  const [chats, setChats] = useState([{ id:1, name:'New Conversation', messages }])
  const [activeChat, setActiveChat] = useState(1)
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages, loading])

  const currentChat = chats.find(c=>c.id===activeChat) || chats[0]

  const handleSubmit = async (e)=>{
    e.preventDefault()
    if(!input.trim() || loading) return
    const userMsg = { id:Date.now(), role:'user', content:input, mode }
    const updatedMsgs = [...currentChat.messages, userMsg, { id:Date.now()+1, role:'assistant', content:'', mode }]
    setChats(cs=>cs.map(c=>c.id===activeChat?{...c, messages:updatedMsgs}:c))
    setInput('')
    setLoading(true)
    try{
      const res = await generateResponse(input, mode)
      setChats(cs=>cs.map(c=>{
        if(c.id!==activeChat) return c
        const msgs = [...c.messages]
        msgs[msgs.length-1].content = res
        return {...c, messages:msgs, name: input.slice(0,40)}
      }))
    }catch(err){
      setChats(cs=>cs.map(c=>c.id===activeChat?{...c, messages:[...c.messages.slice(0,-1), {role:'assistant', content:'Error: '+err.message, mode}]:c))
    }
    setLoading(false)
  }

  const newChat = ()=>{
    const id = Date.now()
    const chat = { id, name:'New Conversation', messages:[{ id:Date.now(), role:'assistant', content:'Start chatting…', mode }] }
    setChats(cs=>[chat, ...cs])
    setActiveChat(id)
  }

  return (
    <div className="h-screen bg-[#f7f7f8] text-zinc-900 flex">
      {/* Sidebar */}
      <aside className="w-[300px] border-r border-zinc-200 bg-white flex flex-col">
        <div className="p-3 border-b border-zinc-200">
          <button onClick={newChat} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-medium">+ New chat</button>
        </div>
        <div className="p-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Recent</div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chats.map(c=>(
            <button key={c.id} onClick={()=>setActiveChat(c.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${activeChat===c.id?'bg-zinc-100':'hover:bg-zinc-50'}`}>{c.name}</button>
          ))}
        </div>
        <div className="p-3 border-t border-zinc-200 text-[11px] text-zinc-500">BYOK • Ethical learning • No stealth</div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-zinc-200 bg-white/80 backdrop-blur flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 grid place-items-center text-white font-bold text-xs">AL</div>
            <span className="font-semibold">AI Learner Bot</span>
            <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">Bring Your Own Key</span>
          </div>
          <div className="flex items-center gap-1">
            {modes.map(m=>(
              <button key={m.id} onClick={()=>setMode(m.id)} className={`px-3 py-1.5 rounded-full text-xs border transition ${mode===m.id?'bg-zinc-900 text-white border-zinc-900':'border-zinc-300 hover:bg-zinc-100'}`}>{m.icon} {m.label}</button>
            ))}
          </div>
        </header>

        {/* Chat */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
            {currentChat.messages.map((m,i)=>{
              const isUser = m.role==='user'
              return (
                <div key={m.id||i} className={`flex gap-3 ${isUser?'justify-end':''}`}>
                  {!isUser && <img src="https://i.pravatar.cc/32?img=5" className="w-8 h-8 rounded-full mt-1"/>}
                  <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${isUser?'bg-zinc-900 text-white rounded-br-sm':'bg-white border border-zinc-200 shadow-sm rounded-bl-sm'}`}>
                    <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">{isUser?'You':`Assistant • ${modes.find(x=>x.id===m.mode)?.label}`}</div>
                    <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                      {m.mode==='diagram' ? <Diagram code={m.content}/> : <div>{m.content}</div>}
                    </div>
                    {m.mode==='quiz' && m.content && <Quiz data={m.content}/>}
                    {m.mode==='practice' && m.content && <Practice data={m.content}/>}
                  </div>
                  {isUser && <img src="https://i.pravatar.cc/32?img=12" className="w-8 h-8 rounded-full mt-1"/>}
                </div>
              )
            })}
            {loading && (
              <div className="flex gap-3">
                <img src="https://i.pravatar.cc/32?img=5" className="w-8 h-8 rounded-full"/>
                <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
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
              <div className="rounded-3xl border border-zinc-300 bg-white shadow-sm focus-within:ring-2 ring-violet-500/30">
                <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSubmit(e) } }} placeholder={`Message AI Learner Bot — ${modes.find(m=>m.id===mode)?.label} mode`} rows={1} className="w-full bg-transparent outline-none resize-none p-4 pr-20 max-h-40"/>
                <button disabled={loading || !input.trim()} className="absolute right-2 bottom-2 bg-zinc-900 text-white rounded-2xl px-4 py-2 text-sm font-medium disabled:opacity-40">Send</button>
              </div>
              <div className="text-center text-[11px] text-zinc-500 mt-2">Shift+Enter for newline • Transparent learning only</div>
            </form>
          </div>
        </footer>
      </div>
    </div>
  )
}
