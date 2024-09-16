import * as httpm from "@actions/http-client";

interface TokenResponse {
  access_token: string;
}

export async function getAuthentikToken(
  authentikUrl: string,
  clientId: string,
  idToken: string
): Promise<TokenResponse> {
  const data = new FormData();
  data.set("grant_type", "client_credentials");
  data.set("client_id", clientId);
  data.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
  data.set("client_assertion", idToken);
  const http: httpm.HttpClient = new httpm.HttpClient("actions-authentik-auth");
  const resp: httpm.HttpClientResponse = await http.request(
    "POST",
    `${authentikUrl}/application/o/token/`,
    new URLSearchParams(data as unknown as Record<string, string>).toString()
  );
  const body = await resp.readBody();
  const statusCode = resp.message.statusCode || 500;
  if (statusCode >= 400) {
    throw new Error(`Failed to get authentik token: ${statusCode} ${body}`);
  }
  return JSON.parse(body) as TokenResponse;
}
