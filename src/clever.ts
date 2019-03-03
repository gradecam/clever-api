import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { createClient, Config as ClientConfig, Client } from './api';

export function createClever(clientId: string, clientSecret: string = ''): Clever {
  const auth = {username: clientId, password: clientSecret};
  const clever = {
    getAccessToken: async ({code, redirectUri}: AccessTokenOpts): Promise<string> => {
      const data= {
        client_id: clientId,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      };
      const url = 'https://clever.com/oauth/tokens';
      const requestConfig: AxiosRequestConfig = {
        auth, data,
        method: 'POST',
        url,
      };
      return axios(requestConfig)
        .then((result: AxiosResponse<{access_token: string;}>) => result.data.access_token)
      ;
    },
    getAuthorizationUrl: (opts: AuthUrlOpts = {}): string => {
      const params = [
        `client_id=${clientId}`,
        'response_type=code',
      ];
      if (opts.redirectUri) {
          params.push(`redirect_uri=${opts.redirectUri}`);
      }
      if (opts.state) {
          let stateStr = '';
          if (typeof opts.state === 'object') {
              stateStr = Buffer.from(JSON.stringify(opts.state)).toString('base64');
          } else {
              stateStr = opts.state;
          }
          params.push(`state=${stateStr}`);
      }
      if (opts.districtId) { params.push(`district_id=${opts.districtId}`); }
      return 'https://clever.com/oauth/authorize?' + params.join('&');
    },
    getClient: createClient,
  };
  return clever;
}

export interface Clever {
  getAccessToken(opts: AccessTokenOpts): Promise<string>;
  getAuthorizationUrl(opts: AuthUrlOpts): string;
  getClient(opts: ClientConfig): Client;
}

export interface AccessTokenOpts {
  code: string;
  redirectUri?: string;
}

export interface AuthUrlOpts {
  districtId?: string;
  redirectUri?: string;
  state?: object | string;
}
