import * as core from '@actions/core';
import * as httpm from '@actions/http-client';

interface TokenResponse {
  access_token: string;
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const authentikUrl: string = core.getInput('authentik_url');
    const clientId: string = core.getInput('client_id');

    core.debug('Fetching GitHub Actions Token...');
    const idToken = await core.getIDToken();
    core.debug('Got GitHub Actions token');

    core.debug('Getting authentik token...');
    const http: httpm.HttpClient = new httpm.HttpClient('actions-authentik-auth');
    const resp: httpm.HttpClientResponse = await http.get(`${authentikUrl}/application/o/token/`, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: idToken
    });
    const body = await resp.readBody();
    const statusCode = resp.message.statusCode || 500;
    if (statusCode >= 400) {
      throw new Error(`Failed to get authentik token: ${body}`);
    }
    core.debug('Got authentik token...');
    const token = JSON.parse(body) as TokenResponse;

    core.setOutput('token', token.access_token);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
