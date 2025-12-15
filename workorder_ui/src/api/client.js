import axios from 'axios'
import { baseURL } from '@/store/constant'
import { getAccessToken } from '@/access'

const apiClient = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
        'Content-type': 'application/json'
    },
    timeout: 30000, // 30秒超时
})

apiClient.interceptors.request.use(function (config) {
    // 使用 token 认证而不是明文密码
    const accessToken = getAccessToken()
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
}, function (error) {
    return Promise.reject(error)
})

// 响应拦截器处理错误
apiClient.interceptors.response.use(
    function (response) {
        return response
    },
    function (error) {
        if (error.response?.status === 401) {
            // Token 过期，跳转登录页
            window.location.href = '/user/login'
        }
        return Promise.reject(error)
    }
)

export default apiClient
