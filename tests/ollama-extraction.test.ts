import {afterEach,describe,expect,it,vi} from 'vitest';
import {extractWithOllama} from '@/lib/ollama-extraction';

describe('local Ollama extraction',()=>{
  afterEach(()=>{
    vi.restoreAllMocks();
  });
  it('requests structured output and parses the response',async()=>{
    const fetchMock=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({message:{content:JSON.stringify({title:'Water bill'})}}),{status:200,headers:{'content-type':'application/json'}}));
    await expect(extractWithOllama('Water bill due tomorrow',{type:'object'})).resolves.toEqual({title:'Water bill'});
    const request=JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(request.stream).toBe(false);
    expect(request.format).toEqual({type:'object'});
    expect(request.messages[0].content).toContain('Water bill due tomorrow');
  });
  it('reports unavailable local AI',async()=>{
    vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('',{status:503}));
    await expect(extractWithOllama('test',{type:'object'})).rejects.toThrow('HTTP 503');
  });
});
