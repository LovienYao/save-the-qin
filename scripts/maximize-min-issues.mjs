import {QUESTIONS,ISSUES} from "../dist/config.js";
import {calculate,ISSUE_RANGES,normalize} from "../dist/scoring.js";

const RANDOM_STARTS=250000,RESTARTS=500,TOP_SEEDS=100,MAX_PASSES=24;
const randomAnswers=()=>QUESTIONS.map(()=>Math.floor(Math.random()*4));
const cache=new Map(),evaluate=a=>{const key=a.join("");let r=cache.get(key);if(!r){r=calculate(a);cache.set(key,r)}return r;};
const signature=r=>Object.values(r.issues).sort((a,b)=>a-b);
const better=(a,b)=>{const aa=signature(a),bb=signature(b);for(let i=0;i<aa.length;i++){if(aa[i]!==bb[i])return aa[i]>bb[i]}return a.D>b.D;};
function hill(seed){let answers=[...seed],result=evaluate(answers);for(let pass=0;pass<MAX_PASSES;pass++){let best=result,bestAnswers=null;for(let q=0;q<24;q++){for(let x=0;x<4;x++){if(x===answers[q])continue;const next=[...answers];next[q]=x;const candidate=evaluate(next);if(better(candidate,best)){best=candidate;bestAnswers=next;}}}if(!bestAnswers)break;answers=bestAnswers;result=best;}return{answers,result};}

const seeds=[];for(let i=0;i<RANDOM_STARTS;i++){const answers=randomAnswers(),result=evaluate(answers);if(seeds.length<TOP_SEEDS||better(result,seeds.at(-1).result)){seeds.push({answers,result});seeds.sort((a,b)=>better(a.result,b.result)?-1:1);seeds.length=Math.min(TOP_SEEDS,seeds.length);}}
let heuristic=seeds[0];for(const seed of [...seeds.map(x=>x.answers),...Array.from({length:RESTARTS-TOP_SEEDS},randomAnswers)]){const found=hill(seed);if(better(found.result,heuristic.result))heuristic=found;}

// 精确复核：枚举所有可达的五病灶原始分向量，同分向量只保留一条答案路径。
const issueKeys=Object.keys(ISSUES);let states=new Map([["0,0,0,0,0",""]]);
for(const q of QUESTIONS){const next=new Map();for(const [key,path] of states){const base=key.split(",").map(Number);q.options.forEach((o,index)=>{const vector=issueKeys.map((k,i)=>base[i]+o.issues[k]),vectorKey=vector.join(",");if(!next.has(vectorKey))next.set(vectorKey,path+index);});}states=next;}
let exact=null;for(const [key,path] of states){const raw=key.split(",").map(Number),issues=Object.fromEntries(issueKeys.map((k,i)=>[k,normalize(raw[i],ISSUE_RANGES[k])]));const sorted=Object.values(issues).sort((a,b)=>a-b),candidate={path,issues,sorted};if(!exact||sorted.some((v,i)=>v!==exact.sorted[i]&&(v>exact.sorted[i])&&sorted.slice(0,i).every((x,j)=>x===exact.sorted[j])))exact=candidate;}
const exactAnswers=[...exact.path].map(Number),exactResult=calculate(exactAnswers);
const format=x=>({minimum:Math.min(...Object.values(x.result.issues)),issues:x.result.issues,answers:x.answers.map(n=>"ABCD"[n]).join(""),answerList:x.answers.map((n,i)=>`Q${i+1}${"ABCD"[n]}`).join(" "),displayRescue:x.result.displayRescue,ending:x.result.ending.name});
console.log(JSON.stringify({method:{randomStarts:RANDOM_STARTS,restarts:RESTARTS,topSeeds:TOP_SEEDS,maxHillPasses:MAX_PASSES,cachedHeuristicEvaluations:cache.size,exactReachableIssueVectors:states.size},heuristic:format(heuristic),exactVerification:format({answers:exactAnswers,result:exactResult}),allAtLeast70Possible:Math.min(...Object.values(exactResult.issues))>=70},null,2));
