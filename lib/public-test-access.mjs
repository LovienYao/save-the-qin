export const PUBLIC_TEST_CODE = "ZJDQ-TEST";
export const PUBLIC_TEST_SESSION = "zjdq-public-test-session-v1";

export function isPublicTestCode(code) {
  return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "") === "ZJDQTEST";
}

export function isPublicTestSession(token) {
  return token === PUBLIC_TEST_SESSION;
}
