export const PUBLIC_TEST_CODE = "ZJDQ-TEST";
export const PUBLIC_TEST_SESSION = "zjdq-public-test-session-v1";

export function isPublicTestCode(code) {
  return code === PUBLIC_TEST_CODE;
}

export function isPublicTestSession(token) {
  return token === PUBLIC_TEST_SESSION;
}
