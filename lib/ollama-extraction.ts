const DEFAULT_OLLAMA_URL='http://127.0.0.1:11434';

export async function extractWithOllama(text:string,schema:Record<string,unknown>){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),120_000);
  try{
    const response=await fetch(`${process.env.OLLAMA_BASE_URL||DEFAULT_OLLAMA_URL}/api/chat`,{
      method:'POST',
      headers:{'content-type':'application/json'},
      signal:controller.signal,
      body:JSON.stringify({
        model:process.env.OLLAMA_MODEL||'qwen2.5:3b',
        stream:false,
        format:schema,
        options:{temperature:0},
        messages:[{
          role:'user',
          content:`Extract life-management information from the text below. Return only data matching the supplied JSON schema. Dates must use YYYY-MM-DD. Currency must use an ISO-4217 code. Do not invent facts that are absent. Use GENERAL_REMINDER when no more specific category fits. Confidence values must be between 0 and 1.\n\n${text.slice(0,30000)}`,
        }],
      }),
    });
    if(!response.ok)throw new Error(`Local AI returned HTTP ${response.status}.`);
    const result=await response.json();
    if(!result.message?.content)throw new Error('Local AI returned no extraction.');
    return JSON.parse(result.message.content);
  }finally{clearTimeout(timeout);}
}
