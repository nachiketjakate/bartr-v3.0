import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

export default function CloneChat({ setPage, user }) {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  const [chats, setChats] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchInbox();
    }
  }, [user]);

  const fetchInbox = async () => {
    if (!user) return;
    let allChats = [];

    // 1. Fetch apps received on user's gigs (People who applied to my tasks)
    const { data: myGigs } = await supabase.from('gigs').select('id, title').eq('client_id', user.id);
    if (myGigs && myGigs.length > 0) {
      const gigIds = myGigs.map(g => g.id);
      const { data: received } = await supabase
        .from('gig_applications')
        .select('*, gigs(id, title, client_id, price), applicant:user_profiles!gig_applications_applicant_id_fkey(full_name, role)')
        .in('gig_id', gigIds)
        .order('created_at', { ascending: false });
        
      if (received) {
        received.forEach(app => {
          allChats.push({
            id: app.id,
            application: app,
            helperName: app.applicant?.full_name || 'Applicant',
            helperAvatar: '🧑',
            lastMessage: 'Tap to view messages',
            time: new Date(app.created_at).toLocaleDateString(),
            taskTitle: app.gigs?.title,
            isPoster: true // I am the poster
          });
        });
      }
    }

    // 2. Fetch apps user sent (Tasks I applied to)
    const { data: sent } = await supabase
      .from('gig_applications')
      .select('*, gigs(id, title, client_id, price, poster:user_profiles!gigs_client_id_fkey(full_name, role))')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });
      
    if (sent) {
      sent.forEach(app => {
        allChats.push({
          id: app.id,
          application: app,
          helperName: app.gigs?.poster?.full_name || 'Task Poster',
          helperAvatar: '🧑',
          lastMessage: 'Tap to view messages',
          time: new Date(app.created_at).toLocaleDateString(),
          taskTitle: app.gigs?.title,
          isPoster: false // I am the applicant
        });
      });
    }

    // Sort all by time
    allChats.sort((a, b) => new Date(b.application.created_at) - new Date(a.application.created_at));
    setChats(allChats);
  };

  useEffect(() => {
    if (!activeChat || !user) return;
    
    const gigId = activeChat.application.gig_id;
    const receiverId = activeChat.isPoster ? activeChat.application.applicant_id : activeChat.application.gigs.client_id;
    
    fetchMessages(gigId, receiverId);

    const channel = supabase
      .channel(`chat_${gigId}_${user.id}_${receiverId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `gig_id=eq.${gigId}` 
      }, payload => {
        const msg = payload.new;
        if ((msg.sender_id === user.id && msg.receiver_id === receiverId) || 
            (msg.sender_id === receiverId && msg.receiver_id === user.id)) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      })
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [activeChat, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (gigId, receiverId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('gig_id', gigId)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const openChat = (chat) => {
    setActiveChat(chat);
  };

  const closeChat = () => {
    setActiveChat(null);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !activeChat || !user) return;
    
    const gigId = activeChat.application.gig_id;
    const receiverId = activeChat.isPoster ? activeChat.application.applicant_id : activeChat.application.gigs.client_id;
    
    const msg = {
      gig_id: gigId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: inputValue
    };

    setInputValue('');
    await supabase.from('messages').insert([msg]);
  };

  if (activeChat) {
    return (
      <div className="chat-thread-page no-nav animate-slide">
        <div className="chat-thread-header">
          <button className="btn-icon" onClick={closeChat} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="avatar" style={{ cursor: 'pointer' }}>{activeChat.helperAvatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>{activeChat.helperName}</div>
            <div style={{ fontSize: '11px', color: 'var(--lime-dark)', fontWeight: 600 }}>⭐ 4.8</div>
          </div>
        </div>
        
        <div style={{ background: 'var(--dark)', padding: 'var(--sp-3) var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <span style={{ fontSize: '18px' }}>📋</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeChat.taskTitle}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>₹{activeChat.application.gigs?.price || 0}</div>
          </div>
        </div>

        <div id="thread-messages" className="chat-thread-messages">
          {messages.map((msg, i) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                <div className={`chat-bubble ${isMine ? 'sent' : 'received'}`}>{msg.content}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', [isMine ? 'marginRight' : 'marginLeft']: '6px' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-thread-input-bar">
          <input className="chat-input" type="text" placeholder="Type a message..." value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
          <button className="btn-icon lime" onClick={sendMessage} aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-fade">
      <div className="page-header">
        <div className="page-header-title">Messages</div>
        <span style={{ background: 'var(--lime-pale)', color: 'var(--dark)', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>{chats.length}</span>
      </div>

      {chats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">No messages yet</div>
          <div className="empty-state-desc">When helpers apply to your tasks or you apply to tasks, conversations will appear here.</div>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', margin: 'var(--sp-4) 0', boxShadow: 'var(--shadow-sm)' }}>
          {chats.map(chat => (
            <div key={chat.id} className="chat-list-item" onClick={() => openChat(chat)}>
              <div className="avatar">{chat.helperAvatar}</div>
              <div className="chat-list-info">
                <div className="chat-list-name">{chat.helperName}</div>
                <div className="chat-list-preview">{chat.lastMessage}</div>
                <div style={{ fontSize: '10px', color: 'var(--lime-dark)', fontWeight: 600, marginTop: '2px' }}>Re: {chat.taskTitle}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                <div className="chat-list-time">{chat.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
