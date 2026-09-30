import { changeAccessCode } from "./manage-access-code.mjs";
await changeAccessCode("disable", process.argv[2]);
console.log("兑换码已禁用。");
