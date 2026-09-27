import { useState } from 'react'
import { generateResponse } from './lib/api.js'
import Diagram from './components/Diagram.jsx'
import Quiz from './components/Quiz.jsx'
import Practice from './components/Practice.jsx'

export default function App() {
  const [mode, setMode] = useState('explain')
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await generateResponse(prompt, mode)
      setAnswer(res)
    } catch(err){
      setAnswer('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Interview Learning Assistant</h1>
      <p className="text-sm text-gray-600 mb-6">BYOK - Ethical learning only. No stealth/hidden modes.</p>
      
      <div className="flex gap-2 mb-4">
        {['explain','concise','diagram','quiz','practice'].map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`px-3 py-1 rounded ${mode===m?'bg-black text-white':'bg-gray-200'}`}>{m}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Enter topic or question..." className="w-full border p-3 rounded mb-3" rows={4}/>
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading?'Generating...':'Generate'}</button>
      </form>

      <div className="prose max-w-none bg-white p-4 rounded border">
        {mode==='diagram' ? <Diagram code={answer} /> : <pre className="whitespace-pre-wrap">{answer}</pre>}
        {mode==='quiz' && answer && <Quiz data={answer} />}
        {mode==='practice' && answer && <Practice data={answer} />}
      </div>
    </div>
  )
}
