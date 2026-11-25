import axios, { AxiosInstance } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Session } from '@/utils/storage';
import qs from 'qs';
import { buildSignHeaders, needsSign } from './signature';

declare module 'axios' {
	interface AxiosRequestConfig<D = any> {
		keepResponseEnvelope?: boolean;
		localErrorHandling?: boolean;
	}
}

export class LocalRequestError extends Error {
	constructor(readonly code?: number) {
		super('请求未完成');
	}
}

function handleExpiredSession() {
	Session.clear();
	window.location.href = '/';
	ElMessageBox.alert('你已被登出，请重新登录', '提示', {}).catch(() => {});
}

// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
	baseURL: '/yi',
	timeout: 50000,
	headers: { 'Content-Type': 'application/json' },
	paramsSerializer: {
		serialize(params) {
			return qs.stringify(params, { allowDots: true });
		},
	},
});
// 添加请求拦截器
service.interceptors.request.use(
	(config) => {
		// 添加签名请求头（防重放攻击）
		if (needsSign(config.url)) {
			const signHeaders = buildSignHeaders();
			Object.assign(config.headers, signHeaders);
		}
		return config;
	},
	(error) => {
		// 对请求错误做些什么
		return Promise.reject(error);
	}
);

// 添加响应拦截器
service.interceptors.response.use(
	(response) => {
		// debugger
		const res = response.data;
		if (response.config.localErrorHandling) {
			const code = res?.code;
			if (code === 200 || code === 0)
				return response.config.keepResponseEnvelope ? res : res.data;
			if (code === 401 || code === 4001) handleExpiredSession();
			throw new LocalRequestError(typeof code === 'number' ? code : undefined);
		}
		if (res.code && res.code !== 0) {
			// `token` 过期或者账号已在别处登录
			if (res.code === 401 || res.code === 4001) {
				handleExpiredSession();
			}else if (res.code === 200) {
				return Promise.resolve(response.config.keepResponseEnvelope ? res : res.data);
			} else if (res.code === 840) {
				// 打印机被其他流转卡占用：不弹错误提示，交由调用方弹确认框处理
				return Promise.reject({ code: res.code, message: res.message });
			} else {
				ElMessage.error(res.message);
				return Promise.reject(res.message);
			}
		}
		return res;
	},
	(error) => {
		// 对响应错误做点什么
		if (error.config?.localErrorHandling) {
			const status = error.response?.status;
			if (status === 401) handleExpiredSession();
			throw new LocalRequestError(status);
		}
		if (error.message.indexOf('timeout') != -1) {
			ElMessage.error('网络超时');
		} else if (error.message == 'Network Error') {
			ElMessage.error('网络连接错误');
		} else {
			// 签名相关错误码处理
			if (error.response?.data?.code) {
				const code = error.response.data.code;
				if (code === 781) {
					ElMessage.error('缺少签名参数');
				} else if (code === 782) {
					ElMessage.error('请求已过期，请检查系统时间');
				} else if (code === 783) {
					ElMessage.error('检测到重复请求，请稍后重试');
				} else if (code === 784) {
					ElMessage.error('签名验证失败');
				} else if (code === 429) {
					ElMessage.error('操作过于频繁，请稍后再试');
				} else {
					ElMessage.error(error.response.data.message || error.response.statusText);
				}
			} else if (error.response.data) {
				ElMessage.error(error.response.statusText);
			} else {
				ElMessage.error('接口路径找不到');
			}
		}
		return Promise.reject(error);
	}
);

// 处理文件下载响应
export function handleBlobResponse(response: any): { blob: Blob; fileName: string } {
	const blob = response.data || response;
	const disposition = response.headers?.['content-disposition'] || '';
	const match = disposition.match(/filename\*?=["']?(?:UTF-\d['"]*)?([^;\r\n"']*)["']?/i);
	const fileName = match?.[1] ? decodeURIComponent(match[1]) : `download_${new Date().toISOString().split('T')[0]}.xlsx`;
	return { blob, fileName };
}

// 导出 axios 实例
export default service;
