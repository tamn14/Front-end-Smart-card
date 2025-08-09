import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";

export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let token = getAccessToken() || "";
  const BASE_URL = "http://localhost:8080";

  const isFormData = options.body instanceof FormData;

  const makeRequest = async (accessToken: string): Promise<Response> => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers as Record<string, string>),
    };

    // ❌ Không set Content-Type nếu là FormData (browser sẽ tự tạo boundary)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    return await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
    }

    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });
    // Thêm dòng này để ghi log
    console.log("Refresh Token Response Status:", refreshRes.status);
    if (!refreshRes.ok) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Refresh token không hợp lệ");
    }

    const refreshData = await refreshRes.json();
    setTokens(refreshData.accessToken, refreshData.refreshToken);
    response = await makeRequest(refreshData.accessToken);

    if (response.status === 401) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Không xác thực được sau khi làm mới token");
    }
  }

  if (response.status === 403) {
    throw new Error("Không có quyền truy cập tài nguyên này");
  }

  return response;
};
