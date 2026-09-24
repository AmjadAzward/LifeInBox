export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#142357"/><path d="M18 17h28v30H18z" fill="none" stroke="#fff" stroke-width="5"/><path d="M24 27h16M24 36h12" stroke="#b8915b" stroke-width="4" stroke-linecap="round"/></svg>`;
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' } });
}
