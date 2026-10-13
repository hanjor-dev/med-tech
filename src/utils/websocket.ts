import { Session } from '@/utils/storage';

export class NotificationWebSocket {
	private ws: WebSocket | null = null;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	private isManualClose = false;
	private reconnectAttempts = 0;
	private readonly maxReconnectAttempts = 10;
	private authFailed = false;

	constructor(private url: string, private onMessage: (data: any) => void) {}

	connect() {
		if (this.ws?.readyState === WebSocket.OPEN) return;

		const token = Session.get('token');
		if (!token) return;

		if (this.authFailed) {
			console.error('[WS] 认证失败，停止连接');
			return;
		}

		console.log(`[WS] 正在连接: ${this.url}`);
		this.isManualClose = false;
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			console.log('[WS] 连接成功');
			this.reconnectAttempts = 0;
			this.send({ type: 'AUTH', token });
			this.startHeartbeat();
		};

		this.ws.onmessage = (e) => {
			try {
				const data = JSON.parse(e.data);
				console.log('[WS] 收到消息:', data);

				if (data.type === 'AUTH_FAILED') {
					console.error('[WS] 认证失败:', data.message || '未授权');
					this.authFailed = true;
					this.ws?.close();
					return;
				}

				this.onMessage(data);
			} catch (err) {
				console.error('[WS] 消息解析失败', err);
			}
		};

		this.ws.onerror = (err) => {
			console.error('[WS] 连接错误', err);
		};

		this.ws.onclose = () => {
			console.log('[WS] 连接关闭');
			this.stopHeartbeat();
			if (!this.isManualClose) {
				if (this.reconnectAttempts >= this.maxReconnectAttempts) {
					console.error(`[WS] 已达到最大重连次数 (${this.maxReconnectAttempts})，停止重连`);
					return;
				}
				const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
				console.log(`[WS] ${delay / 1000}s 后重连 (第${this.reconnectAttempts + 1}次)`);
				this.reconnectAttempts++;
				this.reconnectTimer = setTimeout(() => this.connect(), delay);
			}
		};
	}

	send(data: any) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(data));
		}
	}

	private startHeartbeat() {
		this.heartbeatTimer = setInterval(() => {
			this.send({ type: 'PING' });
		}, 30000);
	}

	private stopHeartbeat() {
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}
	}

	disconnect() {
		this.isManualClose = true;
		this.reconnectAttempts = 0;
		this.authFailed = false;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		this.stopHeartbeat();
		this.ws?.close();
		this.ws = null;
	}
}
