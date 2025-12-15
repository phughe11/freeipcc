package com.sxx.jcc.core.intereptor;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.interceptor.AbstractInterceptor;
import com.sxx.jcc.common.utils.XKDataContext;


@SuppressWarnings("serial")
public class AuthorityInterceptor extends AbstractInterceptor {

	// 安全的 API 密钥验证方法
	private boolean isValidApiKey(String apiKey) {
		if (apiKey == null || apiKey.isEmpty()) {
			return false;
		}
		// 从环境变量获取 API 密钥进行验证
		String expectedKey = System.getenv("IVR_API_KEY");
		if (expectedKey == null || expectedKey.isEmpty()) {
			// 如果未配置 API 密钥，禁止 API 访问
			return false;
		}
		return expectedKey.equals(apiKey);
	}

	public String intercept(ActionInvocation invocation) throws Exception {
		Map session = ActionContext.getContext().getSession();
		Object staff = session.get(XKDataContext.STAFF_SESSION);
		if (staff == null) {
			HttpServletRequest request = ServletActionContext.getRequest();
			// 安全修复: 使用 API 密钥验证替代不安全的 ivrMark 参数
			// 旧代码 (不安全): if ("0".equals(ivrMark)) { return invocation.invoke(); }
			String apiKey = request.getHeader("X-API-Key");
			if (isValidApiKey(apiKey)) {
				return invocation.invoke();
			}
			return "login";
		} else {
			return invocation.invoke();
		}
	}
}
