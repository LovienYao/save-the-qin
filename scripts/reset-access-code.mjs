import { changeAccessCode } from "./manage-access-code.mjs";
await changeAccessCode("reset", process.argv[2]);
console.log("兑换码已重置，可以重新激活。");
