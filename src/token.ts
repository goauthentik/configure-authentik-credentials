import * as httpm from "@actions/http-client";

interface TokenResponse {
  access_token: string;
}

export async function getAuthentikToken(authentikUrl: string, clientId: string, idToken: string): Promise<TokenResponse> {
  const http: httpm.HttpClient = new httpm.HttpClient("actions-authentik-auth");
  const resp: httpm.HttpClientResponse = await http.get(`${authentikUrl}/application/o/token/`, {
    grant_type: "client_credentials",
    client_id: clientId,
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: idToken
  });
  const body = await resp.readBody();
  const statusCode = resp.message.statusCode || 500;
  if (statusCode >= 400) {
    throw new Error(`Failed to get authentik token: ${body}`);
  }
  return JSON.parse(body) as TokenResponse;
}
