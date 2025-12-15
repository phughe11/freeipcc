/**
 * 统一 API 服务层
 * 提供标准化的 API 请求处理、错误处理和响应转换
 */

import request from '@/utils/request';
import { message, notification } from 'antd';
import { history } from '@umijs/max';
import { AUTH_CONFIG, API_CONFIG } from '@/config/env.config';
import { getAccessToken, clearSessionToken } from '@/access';

// 响应数据结构
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
  success?: boolean;
}

// 分页数据结构
export interface PageData<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// 请求配置
export interface RequestOptions {
  showError?: boolean;       // 是否显示错误提示
  showSuccess?: boolean;     // 是否显示成功提示
  successMessage?: string;   // 成功提示消息
  skipAuth?: boolean;        // 是否跳过认证
  timeout?: number;          // 请求超时时间
}

/**
 * 统一请求处理
 */
async function apiRequest<T>(
  url: string,
  options: any = {},
  requestOptions: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    showError = true,
    showSuccess = false,
    successMessage = '操作成功',
    skipAuth = false,
    timeout = API_CONFIG.TIMEOUT,
  } = requestOptions;

  try {
    // 添加认证头
    if (!skipAuth) {
      const token = getAccessToken();
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    // 添加超时
    options.timeout = timeout;

    const response = await request(url, options) as ApiResponse<T>;

    // 检查业务状态码
    if (response && response.code === 200) {
      if (showSuccess) {
        message.success(successMessage);
      }
      return response;
    }

    // 处理特定状态码
    if (response?.code === 401) {
      clearSessionToken();
      history.push(AUTH_CONFIG.LOGIN_PATH);
      return response;
    }

    // 显示错误信息
    if (showError && response?.msg) {
      message.error(response.msg);
    }

    return response;
  } catch (error: any) {
    // 网络错误处理
    if (showError) {
      notification.error({
        message: '请求失败',
        description: error.message || '网络异常，请稍后重试',
      });
    }
    throw error;
  }
}

/**
 * GET 请求
 */
export async function get<T>(
  url: string,
  params?: Record<string, any>,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'GET',
    params,
  }, options);
}

/**
 * POST 请求
 */
export async function post<T>(
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  }, options);
}

/**
 * PUT 请求
 */
export async function put<T>(
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PUT',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  }, options);
}

/**
 * DELETE 请求
 */
export async function del<T>(
  url: string,
  params?: Record<string, any>,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'DELETE',
    params,
  }, options);
}

/**
 * 文件上传
 */
export async function upload<T>(
  url: string,
  file: File | Blob,
  fieldName: string = 'file',
  extraData?: Record<string, any>,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  if (extraData) {
    Object.entries(extraData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return apiRequest<T>(url, {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }, options);
}

/**
 * 文件下载
 */
export async function download(
  url: string,
  params?: Record<string, any>,
  filename?: string
): Promise<void> {
  try {
    const token = getAccessToken();
    const response = await fetch(url + (params ? '?' + new URLSearchParams(params).toString() : ''), {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('下载失败');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error: any) {
    message.error(error.message || '下载失败');
    throw error;
  }
}

export default {
  get,
  post,
  put,
  del,
  upload,
  download,
};
