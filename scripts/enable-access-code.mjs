import { changeAccessCode } from "./manage-access-code.mjs";
await changeAccessCode("enable", process.argv[2]);
console.log("兑换码已恢复为未使用状态，可以重新激活。");
