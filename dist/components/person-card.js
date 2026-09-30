const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
export function personCard({key,name,status,body}){return `<article class="fate-card" data-person="${key}"><div class="fate-top"><span>${escapeHtml(name)}</span><b>${escapeHtml(status)}</b></div><p class="fate-body">${escapeHtml(body)}</p></article>`;}
