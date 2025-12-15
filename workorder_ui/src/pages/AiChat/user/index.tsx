/**
 * AI Chat 用户端 - 生产级实现
 * 功能: 实时聊天、消息发送、历史记录、WebSocket通信
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input, Spin, message, Empty, Button } from 'antd';
import { SendOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import SenderItem from '../components/SenderItem';
import ReceiverItem from '../components/ReceiverItem';
import styles from './index.less';

// 消息类型定义
interface ChatMessage {
  id: string;
  content: string;
  sendTime: string;
  type: 'user' | 'agent' | 'system';
  status?: 'sending' | 'sent' | 'failed';
}

// 会话状态
interface SessionState {
  sessionId: string | null;
  connected: boolean;
  connecting: boolean;
}

// API 配置
const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:3000',
  wsUrl: process.env.NODE_ENV === 'production'
    ? `ws://${window.location.host}/ws/chat`
    : 'ws://localhost:30916/im/user',
};

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 格式化时间
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Chat: React.FC = () => {
  // 状态管理
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionState>({
    sessionId: null,
    connected: false,
    connecting: false,
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 添加欢迎消息
  const addWelcomeMessage = useCallback(() => {
    const welcomeMsg: ChatMessage = {
      id: generateId(),
      content: '您好！欢迎来到智能客服中心。我是您的AI助手，有什么可以帮助您的？',
      sendTime: formatTime(new Date()),
      type: 'agent',
      status: 'sent',
    };
    setMessages([welcomeMsg]);
  }, []);

  // 处理接收到的消息
  const handleIncomingMessage = useCallback((data: Record<string, unknown>) => {
    switch (data.type) {
      case 'message':
        const newMsg: ChatMessage = {
          id: (data.id as string) || generateId(),
          content: data.content as string,
          sendTime: formatTime(new Date((data.timestamp as number) || Date.now())),
          type: 'agent',
          status: 'sent',
        };
        setMessages(prev => [...prev, newMsg]);
        setLoading(false);
        break;

      case 'typing':
        setLoading(true);
        break;

      case 'stop_typing':
        setLoading(false);
        break;

      case 'error':
        message.error((data.message as string) || '服务异常，请稍后重试');
        setLoading(false);
        break;

      default:
        break;
    }
  }, []);

  // WebSocket 连接管理
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setSession(prev => ({ ...prev, connecting: true }));

    try {
      const ws = new WebSocket(API_CONFIG.wsUrl);
      
      ws.onopen = () => {
        wsRef.current = ws;
        reconnectAttemptsRef.current = 0;
        
        const sessionId = generateId();
        setSession({
          sessionId,
          connected: true,
          connecting: false,
        });

        ws.send(JSON.stringify({
          type: 'init',
          sessionId,
          timestamp: Date.now(),
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          // 忽略解析错误
        }
      };

      ws.onerror = () => {
        setSession(prev => ({ ...prev, connecting: false }));
      };

      ws.onclose = () => {
        wsRef.current = null;
        setSession(prev => ({
          ...prev,
          connected: false,
          connecting: false,
        }));

        // 自动重连（最多5次）
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        }
      };
    } catch (error) {
      setSession(prev => ({ ...prev, connecting: false }));
    }
  }, [handleIncomingMessage]);

  // 初始化
  useEffect(() => {
    addWelcomeMessage();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [addWelcomeMessage, connectWebSocket]);

  // 发送消息
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content) {
      return;
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      content,
      sendTime: formatTime(new Date()),
      type: 'user',
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          sessionId: session.sessionId,
          content,
          timestamp: Date.now(),
        }));

        setMessages(prev =>
          prev.map(msg =>
            msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
          )
        );
      } else {
        // 降级到 HTTP API
        const response = await fetch(`${API_CONFIG.baseUrl}/api/v1/prediction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: content,
            sessionId: session.sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        setMessages(prev =>
          prev.map(msg =>
            msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
          )
        );

        const aiResponse: ChatMessage = {
          id: generateId(),
          content: data.text || data.response || '抱歉，我暂时无法回答您的问题。',
          sendTime: formatTime(new Date()),
          type: 'agent',
          status: 'sent',
        };
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'failed' } : msg
        )
      );
      message.error('消息发送失败，请重试');
      setLoading(false);
    }
  }, [inputValue, session.sessionId]);

  // 重新发送失败的消息
  const handleRetry = useCallback((msgId: string) => {
    const failedMsg = messages.find(m => m.id === msgId);
    if (failedMsg) {
      setInputValue(failedMsg.content);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  }, [messages]);

  // 重新连接
  const handleReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  // 键盘事件处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 渲染连接状态
  const connectionStatus = useMemo(() => {
    if (session.connecting) {
      return (
        <div className={styles['connection-status']}>
          <Spin size="small" />
          <span>正在连接...</span>
        </div>
      );
    }
    
    if (!session.connected) {
      return (
        <div className={styles['connection-status']} style={{ color: '#ff4d4f' }}>
          <span>连接断开</span>
          <Button type="link" size="small" icon={<ReloadOutlined />} onClick={handleReconnect}>
            重新连接
          </Button>
        </div>
      );
    }

    return null;
  }, [session.connecting, session.connected, handleReconnect]);

  return (
    <div className={styles['chat']}>
      <div className={styles['chat-container_package']}>
        <div id="banner" className={styles['chat-banner']}>
          <p>智能客服机器人</p>
          {connectionStatus}
        </div>
        
        <div className={styles['chat-container']}>
          <div id="chatHistory" className={styles['chat-history']}>
            <div id="chatItems" className={styles['MessageItem']}>
              {messages.length === 0 ? (
                <Empty description="暂无消息" />
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={styles['messageItem-container']}>
                    {msg.type === 'user' ? (
                      <SenderItem
                        userName="我"
                        item={{
                          content: msg.content,
                          sendTime: msg.sendTime,
                          type: msg.status === 'failed' ? 'failed' : '0',
                        }}
                      />
                    ) : (
                      <ReceiverItem
                        userName="智能助手"
                        item={{
                          content: msg.content,
                          sendTime: msg.sendTime,
                          type: '0',
                        }}
                      />
                    )}
                  </div>
                ))
              )}
              
              {loading && (
                <div className={styles['messageItem-container']}>
                  <div className={styles['typing-indicator']}>
                    <span>智能助手正在输入</span>
                    <span className={styles['typing-dots']}>...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div id="quickMessage" className={styles['quick-message']} />

          <div className={styles['chat-input-operator']}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入你的问题..."
              allowClear
              size="large"
              onKeyDown={handleKeyDown}
              disabled={loading}
              prefix={<QuestionCircleOutlined className="site-form-item-icon" />}
              suffix={
                <Button
                  type="text"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  disabled={!inputValue.trim() || loading}
                  loading={loading}
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

