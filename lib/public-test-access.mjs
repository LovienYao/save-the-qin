export const PUBLIC_TEST_CODE = "ZJDQ-TEST";
export const PUBLIC_TEST_SESSION = "zjdq-public-test-session-v1";

export function isPublicTestCode(code) {
  const compact = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return compact === "ZJDQTEST" || compact === "QINZJDQTEST";
}

export function isPublicTestSession(token) {
  return token === PUBLIC_TEST_SESSION;
}
