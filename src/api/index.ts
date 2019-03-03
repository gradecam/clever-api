import Axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ListResponse } from './response';
import * as schema from './schema';

export const DEFAULT_TIMEOUT = 2000;

export function createClient(opts: Config): Client {
  const headers = {
    'Authorization': `Bearer ${opts.accessToken}`,
    'content-type': 'application/json',
  };
  const instance = Axios.create({
    baseURL: opts.baseUrl || 'https://api.clever.com/v2.0',
    headers,
    timeout: opts.timeout || DEFAULT_TIMEOUT,
  });
  instance.interceptors.response.use(
    async (res) => {
      // console.log(res.data);
      if (res.data && res.data.data) {
        if (Array.isArray(res.data.data)) {
          res.data.data = res.data.data.map((obj: any) => obj.data || obj);
        } else {
          res.data = Object.assign({_links: res.data.links}, res.data.data);
        }
      }
      return res;
    })
  ;
  const client: Client = {
    get: <T = any>(url: string): Promise<T> => {
      return client.request({url, method: 'GET'});
    },
    list: <T = any>(url: string): Promise<ListResponse<T>> => {
      return client.request({url, method: 'GET'});
    },
    request: <T = any>(config: RequestConfig): Promise<T> => {
      const cfg: AxiosRequestConfig = Object.assign({}, config);
      // console.log({cfg});
      return instance.request(cfg).then((result) => result.data);
    },
    getProfile: (): Promise<schema.Profile> => {
      return client.get('/me');
    },
    teachers: {
      get: (id: string): Promise<schema.Teacher> => client.get(`/teachers/${id}`),
      sections: (id: string): Promise<ListResponse<schema.Section>> =>
        client.list(`/teachers/${id}/sections`)
      ,
    },
    sections: {
      get: (id: string): Promise<schema.Section> => client.get(`/sections/${id}`),
      students: (id: string): Promise<ListResponse<schema.Student>> =>
        client.list(`/sections/${id}/students`)
      ,
    },
    _client: instance,
  };
  return client;
}

export default createClient;

export interface Client {
  get<T = any>(url: string): Promise<T>;
  getProfile(): Promise<schema.Profile>;
  teachers: {
    get(id: string): Promise<schema.Teacher>;
    sections(id: string): Promise<ListResponse<schema.Section>>;
  },
  sections: {
    get(id: string): Promise<schema.Section>;
    students(id: string): Promise<ListResponse<schema.Student>>;
  },
  list<T = any>(url: string): Promise<ListResponse<T>>;
  request<T = any>(config: RequestConfig): Promise<T>;
  _client: AxiosInstance;
}

export interface Config {
  accessToken: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RequestConfig {
  url: string;
  method?: string;
  data?: any;
  headers?: any;
  params?: any;
}
