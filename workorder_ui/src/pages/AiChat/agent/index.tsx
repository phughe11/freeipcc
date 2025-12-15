/**
 * AI Chat 坐席端 - 生产级实现
 * 功能: 坐席工作台、会话管理、快捷回复、消息发送
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input, Spin, message, AutoComplete, List, Badge, Avatar, Card, Empty, Button, Tooltip, Tabs, Tag } from 'antd';
import { SendOutlined, UserOutlined, CommentOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd/es/select';
import SenderItem from '../components/SenderItem';
import ReceiverItem from '../components/ReceiverItem';
import styles from './index.less';

// 类型定义
interface ChatMessage {
  id: string;
  content: string;
  sendTime: string;
  type: 'user' | 'agent';
  status?: 'sending' | 'sent' | 'failed';
}

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  status: 'active' | 'waiting' | 'closed';
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
}

// 配置
const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:3000',
  wsUrl: process.env.NODE_ENV === 'production'
    ? `ws://${window.location.host}/ws/agent`
    : 'ws://localhost:30916/im/agent',
};

// 工具函数
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const formatTime = (date: Date): string => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

// 模拟快捷回复数据
const QUICK_REPLIES: QuickReply[] = [
  { id: '1', title: '欢迎语', content: '您好，很高兴为您服务，请问有什么可以帮助您的？', category: '常用' },
  { id: '2', title: '等待提示', content: '请您稍等，我正在为您查询...', category: '常用' },
  { id: '3', title: '结束语', content: '感谢您的咨询，祝您生活愉快！如有其他问题，随时联系我们。', category: '常用' },
  { id: '4', title: '工单已创建', content: '您的问题我已记录，工单编号为 #XXX，我们会尽快处理。', category: '工单' },
  { id: '5', title: '转接提示', content: '您的问题需要专业人员处理，我为您转接，请稍候...', category: '转接' },
];

const AgentChat: React.FC = () => {
  // 状态
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickReplyOptions, setQuickReplyOptions] = useState<SelectProps<object>['options']>([]);
  const [connected, setConnected] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeSession, scrollToBottom]);

  // 获取当前会话消息
  const currentMessages = useMemo(() => {
    if (!activeSession) return [];
    return messages.get(activeSession.id) || [];
  }, [activeSession, messages]);

  // 处理接收消息
  const handleIncomingMessage = useCallback((data: Record<string, unknown>) => {
    const msgType = data.type as string;
    
    switch (msgType) {
      case 'new_session':
        // 新会话
        const newSession: ChatSession = {
          id: data.sessionId as string,
          userId: data.userId as string,
          userName: (data.userName as string) || '访客',
          lastMessage: (data.message as string) || '',
          lastTime: formatTime(new Date()),
          unreadCount: 1,
          status: 'waiting',
        };
        setSessions(prev => [newSession, ...prev]);
        break;

      case 'message':
        const sessionId = data.sessionId as string;
        const newMsg: ChatMessage = {
          id: (data.id as string) || generateId(),
          content: data.content as string,
          sendTime: formatTime(new Date()),
          type: 'user',
          status: 'sent',
        };
        
        setMessages(prev => {
          const newMap = new Map(prev);
          const sessionMsgs = newMap.get(sessionId) || [];
          newMap.set(sessionId, [...sessionMsgs, newMsg]);
          return newMap;
        });

        // 更新会话列表
        setSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? { ...s, lastMessage: newMsg.content, lastTime: newMsg.sendTime, unreadCount: s.id === activeSession?.id ? 0 : s.unreadCount + 1 }
            : s
        ));
        break;

      case 'session_closed':
        setSessions(prev => prev.map(s =>
          s.id === (data.sessionId as string) ? { ...s, status: 'closed' } : s
        ));
        break;
    }
  }, [activeSession]);

  // WebSocket 连接
  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(API_CONFIG.wsUrl);
      
      ws.onopen = () => {
        wsRef.current = ws;
        setConnected(true);
        
        // 发送坐席上线消息
        ws.send(JSON.stringify({
          type: 'agent_online',
          agentId: 'agent-' + generateId(),
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
        setConnected(false);
      };

      ws.onclose = () => {
        wsRef.current = null;
        setConnected(false);
        // 5秒后尝试重连
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      setConnected(false);
    }
  }, [handleIncomingMessage]);

  // 初始化
  useEffect(() => {
    connectWebSocket();
    
    // 模拟一些测试会话
    const mockSessions: ChatSession[] = [
      {
        id: 'session-1',
        userId: 'user-1',
        userName: '张先生',
        lastMessage: '我想咨询一下产品问题',
        lastTime: '10:30',
        unreadCount: 2,
        status: 'active',
      },
      {
        id: 'session-2',
        userId: 'user-2',
        userName: '李女士',
        lastMessage: '订单什么时候发货？',
        lastTime: '10:25',
        unreadCount: 0,
        status: 'waiting',
      },
    ];
    setSessions(mockSessions);
    
    // 模拟消息
    const mockMessages = new Map<string, ChatMessage[]>();
    mockMessages.set('session-1', [
      { id: '1', content: '您好，我想咨询一下产品问题', sendTime: '10:28', type: 'user', status: 'sent' },
      { id: '2', content: '您好，请问有什么可以帮助您的？', sendTime: '10:29', type: 'agent', status: 'sent' },
      { id: '3', content: '我想了解一下你们的呼叫中心系统', sendTime: '10:30', type: 'user', status: 'sent' },
    ]);
    setMessages(mockMessages);

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connectWebSocket]);

  // 发送消息
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || !activeSession) {
      return;
    }

    const agentMessage: ChatMessage = {
      id: generateId(),
      content,
      sendTime: formatTime(new Date()),
      type: 'agent',
      status: 'sending',
    };

    // 添加消息到列表
    setMessages(prev => {
      const newMap = new Map(prev);
      const sessionMsgs = newMap.get(activeSession.id) || [];
      newMap.set(activeSession.id, [...sessionMsgs, agentMessage]);
      return newMap;
    });

    setInputValue('');
    setLoading(true);

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'agent_message',
          sessionId: activeSession.id,
          content,
          timestamp: Date.now(),
        }));
      }

      // 更新消息状态
      setMessages(prev => {
        const newMap = new Map(prev);
        const sessionMsgs = newMap.get(activeSession.id) || [];
        newMap.set(activeSession.id, sessionMsgs.map(msg =>
          msg.id === agentMessage.id ? { ...msg, status: 'sent' } : msg
        ));
        return newMap;
      });

      // 更新会话最后消息
      setSessions(prev => prev.map(s =>
        s.id === activeSession.id
          ? { ...s, lastMessage: content, lastTime: agentMessage.sendTime }
          : s
      ));
    } catch (error) {
      message.error('消息发送失败');
      setMessages(prev => {
        const newMap = new Map(prev);
        const sessionMsgs = newMap.get(activeSession.id) || [];
        newMap.set(activeSession.id, sessionMsgs.map(msg =>
          msg.id === agentMessage.id ? { ...msg, status: 'failed' } : msg
        ));
        return newMap;
      });
    } finally {
      setLoading(false);
    }
  }, [inputValue, activeSession]);

  // 搜索快捷回复
  const handleQuickReplySearch = useCallback((value: string) => {
    if (!value) {
      setQuickReplyOptions([]);
      return;
    }
    
    const filtered = QUICK_REPLIES.filter(r => 
      r.title.includes(value) || r.content.includes(value)
    );
    
    setQuickReplyOptions(filtered.map(r => ({
      value: r.content,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{r.title}</span>
          <Tag color="blue">{r.category}</Tag>
        </div>
      ),
    })));
  }, []);

  // 选择快捷回复
  const handleQuickReplySelect = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  // 选择会话
  const handleSelectSession = useCallback((session: ChatSession) => {
    setActiveSession(session);
    // 清除未读
    setSessions(prev => prev.map(s =>
      s.id === session.id ? { ...s, unreadCount: 0 } : s
    ));
  }, []);

  // 键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 渲染会话列表
  const renderSessionList = () => (
    <div className={styles['session-list']}>
      <div className={styles['session-header']}>
        <span>会话列表</span>
        <Badge count={sessions.filter(s => s.unreadCount > 0).length} />
      </div>
      <List
        dataSource={sessions}
        renderItem={(session) => (
          <List.Item
            className={`${styles['session-item']} ${activeSession?.id === session.id ? styles['active'] : ''}`}
            onClick={() => handleSelectSession(session)}
          >
            <List.Item.Meta
              avatar={
                <Badge count={session.unreadCount} size="small">
                  <Avatar icon={<UserOutlined />} />
                </Badge>
              }
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{session.userName}</span>
                  <span style={{ fontSize: 12, color: '#999' }}>{session.lastTime}</span>
                </div>
              }
              description={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    maxWidth: 150
                  }}>
                    {session.lastMessage}
                  </span>
                  <Tag color={session.status === 'active' ? 'green' : session.status === 'waiting' ? 'orange' : 'default'}>
                    {session.status === 'active' ? '进行中' : session.status === 'waiting' ? '等待中' : '已结束'}
                  </Tag>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  // 渲染聊天区域
  const renderChatArea = () => (
    <div className={styles['chat-area']}>
      {activeSession ? (
        <>
          <div className={styles['chat-header']}>
            <Avatar icon={<UserOutlined />} />
            <span style={{ marginLeft: 8 }}>{activeSession.userName}</span>
            <Tag style={{ marginLeft: 8 }} color={activeSession.status === 'active' ? 'green' : 'orange'}>
              {activeSession.status === 'active' ? '进行中' : '等待中'}
            </Tag>
          </div>
          
          <div className={styles['chat-messages']}>
            {currentMessages.map((msg) => (
              <div key={msg.id} className={styles['message-item']}>
                {msg.type === 'user' ? (
                  <ReceiverItem
                    userName={activeSession.userName}
                    item={{ content: msg.content, sendTime: msg.sendTime, type: '0' }}
                  />
                ) : (
                  <SenderItem
                    userName="我"
                    item={{ content: msg.content, sendTime: msg.sendTime, type: '0' }}
                  />
                )}
              </div>
            ))}
            {loading && (
              <div className={styles['typing-indicator']}>
                <Spin size="small" />
                <span style={{ marginLeft: 8 }}>发送中...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles['chat-input']}>
            <AutoComplete
              style={{ width: '100%' }}
              options={quickReplyOptions}
              onSelect={handleQuickReplySelect}
              onSearch={handleQuickReplySearch}
              value={inputValue}
              onChange={setInputValue}
            >
              <Input.TextArea
                placeholder="输入消息，或输入关键字搜索快捷回复..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </AutoComplete>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              loading={loading}
              style={{ marginTop: 8 }}
            >
              发送
            </Button>
          </div>
        </>
      ) : (
        <Empty description="请选择一个会话" style={{ marginTop: 100 }} />
      )}
    </div>
  );

  // 渲染快捷回复面板
  const renderQuickReplyPanel = () => (
    <div className={styles['quick-reply-panel']}>
      <Tabs
        size="small"
        items={[
          {
            key: 'common',
            label: '常用',
            children: (
              <List
                size="small"
                dataSource={QUICK_REPLIES.filter(r => r.category === '常用')}
                renderItem={(item) => (
                  <List.Item
                    className={styles['quick-reply-item']}
                    onClick={() => setInputValue(item.content)}
                  >
                    <Tooltip title={item.content}>
                      <span>{item.title}</span>
                    </Tooltip>
                  </List.Item>
                )}
              />
            ),
          },
          {
            key: 'all',
            label: '全部',
            children: (
              <List
                size="small"
                dataSource={QUICK_REPLIES}
                renderItem={(item) => (
                  <List.Item
                    className={styles['quick-reply-item']}
                    onClick={() => setInputValue(item.content)}
                  >
                    <Tooltip title={item.content}>
                      <span>{item.title}</span>
                      <Tag size="small">{item.category}</Tag>
                    </Tooltip>
                  </List.Item>
                )}
              />
            ),
          },
        ]}
      />
    </div>
  );

  return (
    <div className={styles['agent-container']}>
      <div className={styles['connection-bar']}>
        <Badge status={connected ? 'success' : 'error'} />
        <span style={{ marginLeft: 8 }}>{connected ? '已连接' : '未连接'}</span>
        {!connected && (
          <Button type="link" size="small" icon={<ReloadOutlined />} onClick={connectWebSocket}>
            重新连接
          </Button>
        )}
      </div>
      
      <div className={styles['main-content']}>
        {renderSessionList()}
        {renderChatArea()}
        {renderQuickReplyPanel()}
      </div>
    </div>
  );
};

export default AgentChat;

