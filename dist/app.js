import {QUESTIONS,DIMENSIONS,ROUTES,PEOPLE,ISSUES} from "./config.js";
import {calculate} from "./scoring.js";
import {ENDINGS,PERSON_CONTENT,ISSUE_TIERS,ISSUE_STATUS,issueTier,LOWEST_PRIORITY,lowestContent} from "./result-content.js";
import {dimensionComment} from "./dimension-comments.js";
import {personCard} from "./components/person-card.js";
import {issueBar} from "./components/issue-bar.js";
import {buildShareModel,shareCardMarkup,generateShareCardPng} from "./components/share-card.js";

const $=s=>document.querySelector(s),screens=[...document.querySelectorAll(".screen")];let current=0,answers=[],activeShareModel=null;
const params=new URLSearchParams(location.search),debug=params.has("debug")||localStorage.getItem("qinDebug")==="1";
const ROUTE_COPY={institution:"你更相信规则，而不是押注某一个正确的人。",talent:"你习惯先判断谁值得用、谁必须防。",action:"你更关注什么能真正落地，而不是理论上最漂亮的答案。",strategy:"你习惯先判断什么最致命、什么必须优先处理。"};
function show(id){screens.forEach(s=>s.classList.toggle("active",s.id===id));scrollTo({top:0,behavior:"smooth"});}
function start(){current=0;answers=[];renderQuestion();show("quiz");}
function renderQuestion(){const q=QUESTIONS[current],saved=answers[current];$("#counter").textContent=`${String(current+1).padStart(2,"0")} / 24`;$("#progress-fill").style.width=`${(current+1)/24*100}%`;$("#chapter").textContent=q.chapter;$("#question-title").textContent=q.title;$("#scene").textContent=q.scene;const box=$("#options");box.innerHTML="";q.options.forEach((o,i)=>{const b=document.createElement("button");b.className=`option${saved===i?" previously-selected":""}`;b.setAttribute("aria-pressed",String(saved===i));b.innerHTML=`<span class="option-key">${o.key}</span><span>${o.text}</span>`;b.onclick=()=>choose(i,b);box.appendChild(b)});$("#back").disabled=current===0;}
function finishQuiz(){const transition=$("#timeline-transition");transition.hidden=false;setTimeout(()=>{renderResult(calculate(answers,{debug}));transition.hidden=true;show("result")},800);}
function choose(i,el){document.querySelectorAll(".option").forEach(b=>{b.disabled=true;b.classList.remove("previously-selected")});el.classList.add("selected");answers[current]=i;if(debug)console.log(`Q${current+1} → ${QUESTIONS[current].options[i].key}`,QUESTIONS[current].options[i]);setTimeout(()=>{if(current<23){current++;renderQuestion()}else finishQuiz()},210);}
function metric(name,value,key){return `<div class="metric"><div><span>${key}</span><label>${name}</label><b>${value}</b></div><i><em style="width:${value}%"></em></i><p class="metric-comment">${dimensionComment(key,value)}</p></div>`;}
function lowestIssue(issues){const min=Math.min(...Object.values(issues));return LOWEST_PRIORITY.find(k=>issues[k]===min);}
export function renderResult(r){const ending=ENDINGS[r.ending.number],isEarly=r.ending.number===1,route=r.routeKeys.map(k=>ROUTES[k]).join(" × ");
 $("#ending").textContent=`《${ending.name}》`;$("#score").textContent=r.displayRescue;$("#score-label").textContent=isEarly?"潜在救秦能力":"大秦拯救度";$("#score-note").textContent=isEarly?"你的大秦拯救计划：未启动":"";$("#score-block").classList.toggle("plan-failed",isEarly);$("#result-copy").textContent=ending.body;$("#result-emphasis").textContent=`“${ending.emphasis}”`;$("#route-name").textContent=route;$("#route-quote").innerHTML=r.routeKeys.map(k=>`<span>${ROUTE_COPY[k]}</span>`).join("");
 $("#dimensions").innerHTML=Object.entries(DIMENSIONS).map(([k,n])=>metric(n,r.normalized[k],k)).join("");
 const fateData=Object.entries(PEOPLE).map(([k,n])=>{const status=r.personFates[k],content=PERSON_CONTENT[k][status];return{key:k,name:n,status,body:content.body}});$("#fates").innerHTML=fateData.map(personCard).join("");
 $("#illnesses").innerHTML=Object.entries(ISSUES).map(([k,n])=>{const score=r.issues[k],tier=issueTier(score);return issueBar({key:k,name:n,score,tier,status:ISSUE_STATUS[tier],body:ISSUE_TIERS[k][tier]})}).join("");
 const low=lowestIssue(r.issues),lowCopy=lowestContent(low,r.issues[low]);$("#issue-title").textContent=lowCopy.title;$("#issue-summary").textContent=lowCopy.body;
 activeShareModel=buildShareModel({ending,score:r.displayRescue,isEarly,route,people:fateData});$("#share-card").innerHTML=shareCardMarkup(activeShareModel);
}
function openShare(){if(!activeShareModel)return;const button=$("#save-image");button.disabled=true;button.textContent="正在生成高清档案…";requestAnimationFrame(()=>setTimeout(()=>{try{const dataUrl=generateShareCardPng(activeShareModel);$("#share-preview").src=dataUrl;$("#download-share").href=dataUrl;document.body.dataset.exportBytes=String(dataUrl.length);$("#share-modal").hidden=false;document.body.classList.add("modal-open");}finally{button.disabled=false;button.textContent="生成我的大秦档案";}},30));}
function closeShare(){$("#share-modal").hidden=true;document.body.classList.remove("modal-open");}
$("#start").onclick=start;$("#restart").onclick=start;$("#back").onclick=()=>{if(current>0){current--;renderQuestion()}};$("#save-image").onclick=openShare;$("#close-share").onclick=closeShare;$("#share-modal").onclick=e=>{if(e.target.id==="share-modal")closeShare()};document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#share-modal").hidden)closeShare()});
if(debug)console.info("大秦测试调试模式已开启。完成答题后将输出完整计分过程。");
if(debug&&params.has("qa")){
 const qa=params.get("qa"),sequences={"1":"DDDDDDDDDDDDDDDDDDDDDDDD","10":"ADABAAAABBADBCBADDBBDABA","11":"ADAAAAAABBADBBBADDBADABA","12":"ADAAAAAABBABACBADDBDDABC"};
 if(qa==="flow")void(async()=>{const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));start();let restored=false;for(let i=0;i<24;i++){document.querySelectorAll(".option")[0].click();await wait(235);if(i===4){$("#back").click();restored=!!document.querySelector(".option.previously-selected");document.querySelectorAll(".option")[1].click();await wait(235);}}await wait(900);document.body.dataset.qaFlowComplete=String($("#result").classList.contains("active"));document.body.dataset.qaBackRestored=String(restored);document.body.dataset.qaAnswerChanged=String(answers[4]===1);})();
 else{const sequence=sequences[qa]||sequences["10"],qaAnswers=[...sequence].map(x=>"ABCD".indexOf(x)),result=calculate(qaAnswers,{debug:true});renderResult(result);show("result");document.body.dataset.qaEnding=String(result.ending.number);setTimeout(()=>{document.body.dataset.layoutOverflow=String(document.documentElement.scrollWidth>document.documentElement.clientWidth);const card=$("#share-card .poster-card")?.getBoundingClientRect();if(card)document.body.dataset.shareRatio=(card.width/card.height).toFixed(3);},50);if(params.has("export"))setTimeout(openShare,100);}
}
