const esc=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
export const SHORT_FATES={
 fusu:{"仍处于危险线":"仍处危险","命运出现明显转机":"命运转机","成功保全":"成功保全","成功保全，并进入更稳定的权力交接":"稳定继承"},
 mengtian:{"仍可能卷入原本结局":"仍有风险","命运发生变化":"命运改变","成功保全":"成功保全","本人保全，且军权交接更加稳定":"军权稳接"},
 zhaogao:{"权力仍可能继续扩张":"仍可扩权","权力受到明显限制":"权力受限","提前失势":"提前失势","基本无缘帝国核心权力":"远离核心"},
 lisi:{"仍可能陷入原本的权力困局":"仍陷困局","命运发生改变":"命运改变","能力被有效使用，同时受到制衡":"有效制衡","能力得到保留，并安全避开最危险的权斗":"安全任用"},
 huhai:{"仍有较大机会进入最高继承核心":"仍近核心","命运仍不确定":"命运未定","对最高继承的影响明显受限":"继承受限","基本远离最高权力交接":"远离继承核心"}
};
export function buildShareModel({ending,score,isEarly,route,people}){return{eyebrow:"穿越大秦 · 历史命运测试",scoreLabel:isEarly?"潜在救秦能力":"我的大秦拯救度",score,ending:`《${ending.name}》`,route,fates:people.map(p=>({...p,status:SHORT_FATES[p.key]?.[p.status]||p.status})),quote:ending.emphasis.replace(/\n+/g," "),footer:"24道题，看看你能把大秦救到哪里。"};}
export function shareCardMarkup(model){return `<article class="poster-card"><p class="poster-eyebrow">${esc(model.eyebrow)}</p><div class="poster-score"><span>${esc(model.scoreLabel)}</span><strong>${model.score}<b>%</b></strong></div><h3>${esc(model.ending)}</h3><p class="poster-route">${esc(model.route)}</p><ul>${model.fates.map(x=>`<li><span>${esc(x.name)}</span><b>${esc(x.status)}</b></li>`).join("")}</ul><blockquote>“${esc(model.quote)}”</blockquote><footer>${esc(model.footer)}</footer></article>`;}
function wrap(ctx,text,maxWidth){const lines=[];let line="";for(const char of text){if(ctx.measureText(line+char).width>maxWidth&&line){lines.push(line);line=char}else line+=char}if(line)lines.push(line);return lines;}
function drawLines(ctx,text,x,y,maxWidth,lineHeight,maxLines=99){const lines=wrap(ctx,text,maxWidth).slice(0,maxLines);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;}
export function generateShareCardPng(model){const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1440;const c=canvas.getContext("2d");const serif='"Noto Serif SC","Microsoft YaHei",serif';
 const gradient=c.createLinearGradient(0,0,1080,1440);gradient.addColorStop(0,"#17130f");gradient.addColorStop(.55,"#0d0d0c");gradient.addColorStop(1,"#15100e");c.fillStyle=gradient;c.fillRect(0,0,1080,1440);c.strokeStyle="#715b37";c.lineWidth=2;c.strokeRect(54,54,972,1332);c.fillStyle="#8f2722";c.fillRect(54,54,972,8);
 c.fillStyle="#a78a58";c.font=`28px ${serif}`;c.letterSpacing="3px";c.fillText(model.eyebrow,96,125);
 c.fillStyle="#9f9689";c.font=`28px ${serif}`;c.fillText(model.scoreLabel,96,210);c.fillStyle="#e3c88f";c.font=`112px Georgia,serif`;c.fillText(String(model.score),92,330);const sw=c.measureText(String(model.score)).width;c.font=`38px Georgia,serif`;c.fillStyle="#b79860";c.fillText("%",105+sw,326);
 c.strokeStyle="#4f4332";c.lineWidth=1;c.beginPath();c.moveTo(96,374);c.lineTo(984,374);c.stroke();
 c.fillStyle="#eee2cd";c.font=`bold 54px ${serif}`;let y=drawLines(c,model.ending,96,455,888,72,3);c.fillStyle="#b79860";c.font=`32px ${serif}`;c.fillText(model.route,96,y+18);y+=84;
 c.fillStyle="#8f8679";c.font=`24px ${serif}`;c.fillText("人物命运",96,y);y+=48;for(const item of model.fates){c.fillStyle="#d8cbb5";c.font=`30px ${serif}`;c.fillText(item.name,96,y);c.fillStyle="#bca06d";c.textAlign="right";c.fillText(item.status,984,y);c.textAlign="left";y+=58;}
 y+=12;c.strokeStyle="#3d352b";c.beginPath();c.moveTo(96,y);c.lineTo(984,y);c.stroke();y+=60;c.fillStyle="#d4c19e";c.font=`30px ${serif}`;y=drawLines(c,`“${model.quote}”`,96,y,888,48,4);
 c.fillStyle="#756d62";c.font=`24px ${serif}`;c.fillText(model.footer,96,1350);c.fillStyle="#8f2722";c.fillRect(912,1288,72,72);c.fillStyle="#e0c58d";c.font=`44px ${serif}`;c.textAlign="center";c.fillText("秦",948,1341);return canvas.toDataURL("image/png",1);}
