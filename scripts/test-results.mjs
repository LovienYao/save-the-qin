import assert from "node:assert/strict";
import {QUESTIONS,PEOPLE,ISSUES} from "../dist/config.js";
import {calculate} from "../dist/scoring.js";
import {ENDINGS,PERSON_CONTENT,ISSUE_TIERS,issueTier,LOWEST_PRIORITY,LOWEST_CONTENT,lowestContent} from "../dist/result-content.js";

assert.equal(Object.keys(ENDINGS).length,12);
for(const [person,key] of Object.entries(PEOPLE)){assert.ok(PERSON_CONTENT[person],`${key}缺少文案`);assert.equal(Object.keys(PERSON_CONTENT[person]).length,4);}
for(const [issue,key] of Object.entries(ISSUES)){assert.ok(ISSUE_TIERS[issue],`${key}缺少文案`);assert.deepEqual(Object.keys(ISSUE_TIERS[issue]),["danger","unstable","improved","stable"]);assert.deepEqual(Object.keys(LOWEST_CONTENT[issue]),["risk","improved"]);assert.match(lowestContent(issue,49).title,/最大隐患/);assert.match(lowestContent(issue,50).title,/相对薄弱的一环/);assert.doesNotMatch(lowestContent(issue,50).body,/危险|严重漏洞|隐患/);}
assert.deepEqual([0,29,30,49,50,69,70,100].map(issueTier),["danger","danger","unstable","unstable","improved","improved","stable","stable"]);
assert.deepEqual(LOWEST_PRIORITY,["succession","court","military","people","local"]);

const samples=[Array(24).fill(0),Array(24).fill(2),Array(24).fill(3)];
for(const answers of samples){const r=calculate(answers);assert.ok(ENDINGS[r.ending.number]);for(const k of Object.keys(PEOPLE))assert.ok(PERSON_CONTENT[k][r.personFates[k]],`${k}状态文案未映射`);for(const k of Object.keys(ISSUES))assert.ok(ISSUE_TIERS[k][issueTier(r.issues[k])]);console.log(JSON.stringify({ending:r.ending.name,score:r.displayRescue,people:r.personFates,issueTiers:Object.fromEntries(Object.entries(r.issues).map(([k,v])=>[k,issueTier(v)]))}));}
console.log("通过：12结局、20个人物状态、20种病灶档位、最低病灶文案与3组完整结果映射。");
for(const [expected,sequence] of Object.entries({10:"ADABAAAABBADBCBADDBBDABA",11:"ADAAAAAABBADBBBADDBADABA",12:"ADAAAAAABBABACBADDBDDABC"})){const r=calculate([...sequence].map(x=>"ABCD".indexOf(x)));assert.equal(r.ending.number,Number(expected),`定向答案应触发结局${expected}`);}
console.log("通过：已知定向答案仍分别触发结局10、11、12。");
