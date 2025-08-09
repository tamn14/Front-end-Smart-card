// Utils/ensureAuth.ts
import { getAccessToken, getRefreshToken, clearTokens, setTokens } from "./auth";

export const ensureAuth = async (): Promise<boolean> => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) return false;

  // kiểm tra token còn hạn không?
  const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
  const now = Math.floor(Date.now() / 1000);

  if (tokenPayload.exp > now) {
    return true; // token còn hạn, không cần refresh
  }

  // nếu token hết hạn thì refresh
  try {
    const res = await fetch("http://localhost:8080/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh token failed");

    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch (err) {
    clearTokens();
    return false;
  }
};
