const API_BASE = process.env.API_BASE || "http://localhost:5000/api";

const log = (label, passed, details = "") => {
  const status = passed ? "PASS" : "FAIL";
  console.log(`${status} ${label}${details ? ` - ${details}` : ""}`);
};

const postJson = async (url, body, headers = {}) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
};

const run = async () => {
  const wrongLogin = await postJson(`${API_BASE}/auth/login`, {
    email: "wrong@example.com",
    password: "WrongPassword1!",
  });
  log(
    "T01 login invalid credentials",
    wrongLogin.response.status === 401 &&
      wrongLogin.data.error === "Invalid credentials",
  );

  let lastResponse;
  for (let i = 0; i < 11; i += 1) {
    lastResponse = await postJson(`${API_BASE}/auth/login`, {
      email: "wrong@example.com",
      password: "WrongPassword1!",
    });
  }
  log("T02 login rate limit", lastResponse.response.status === 429);

  const register = await postJson(`${API_BASE}/auth/register`, {
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "ValidPass1!",
    role: "ADMIN",
    isAdmin: true,
  });
  const roleIsStudent = register.data?.data?.isAdmin === false;
  log("T03 register admin role ignored", roleIsStudent);

  const studentLogin = await postJson(`${API_BASE}/auth/login`, {
    email: register.data?.data?.email || "",
    password: "ValidPass1!",
  });
  const accessToken =
    studentLogin.data?.token || studentLogin.data?.accessToken;

  const unauthorizedAdmin = await fetch(
    `${API_BASE}/admin/users/${register.data?.data?._id || ""}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ role: "ADMIN" }),
    },
  );
  log("T04 student role change forbidden", unauthorizedAdmin.status === 403);

  const forbiddenAuditLog = await fetch(`${API_BASE}/admin/audit-log`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  log(
    "T05 student audit log access forbidden",
    forbiddenAuditLog.status === 403,
  );

  const materialAccess = await fetch(
    `${API_BASE}/resources/${register.data?.data?._id || ""}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  log(
    "T06 unauthorized material access",
    [403, 404].includes(materialAccess.status),
  );

  const nosqlAttempt = await postJson(`${API_BASE}/auth/login`, {
    email: { $gt: "" },
    password: "anything",
  });
  log(
    "T07 NoSQL injection blocked",
    [400, 401].includes(nosqlAttempt.response.status),
  );

  const registerInjection = await postJson(`${API_BASE}/auth/register`, {
    name: { $gt: "" },
    email: `inject_${Date.now()}@example.com`,
    password: "ValidPass1!",
  });
  log(
    "T08 register NoSQL injection blocked",
    registerInjection.response.status === 400,
  );
};

run().catch((error) => {
  console.error("Security tests failed", error);
  process.exit(1);
});
