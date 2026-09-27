const BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.openai.com/v1'
const KEY = import.meta.env.VITE_API_KEY || ''
const MODEL = import.meta.env.VITE_MODEL || 'gpt-4o-mini'

export async function generateResponse(prompt, mode){
  if(!KEY) throw new Error('Set VITE_API_KEY in .env')
  
  let system = ''
  if(mode==='explain') system = 'You are a technical learning assistant. Explain concepts in detail with examples.'
  if(mode==='concise') system = 'You are a technical coach. Give a short, natural, concise answer a human can speak in 30-60 seconds.'
  if(mode==='diagram') system = 'Return a Mermaid diagram code block only describing the architecture for the prompt. Wrap in ```mermaid.'
  if(mode==='quiz') system = 'Generate a JSON array of 5 quiz questions with question, options, answer_index for the topic. Return JSON only.'
  if(mode==='practice') system = 'Ask a progressive interview question on the topic, then provide a model answer.'

  const res = await fetch(`${BASE}/chat/completions`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, messages:[{role:'system',content:system},{role:'user',content:prompt}], temperature:0.7 })
  })
  if(!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.choices[0].message.content
}
