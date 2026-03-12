import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import "./Messages.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString([], { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Messages() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();

  const conversationIdParam = query.get("conversation") || "";
  const draftToUser = query.get("toUser") || "";

  const me = localStorage.getItem("userId");

  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [convoError, setConvoError] = useState("");

  const [activeConversationId, setActiveConversationId] = useState(conversationIdParam);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const activeConversationIdRef = useRef(activeConversationId);

  const isDraft = !activeConversationId && Boolean(draftToUser);
  const showEmptyState = !activeConversationId && !isDraft;

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c._id === activeConversationId) || null;
  }, [activeConversationId, conversations]);

  const activeOtherUser = useMemo(() => {
    if (activeConversation?.otherUser) return activeConversation.otherUser;
    if (isDraft) return { _id: draftToUser, username: "New Message" };
    return null;
  }, [activeConversation, isDraft, draftToUser]);

  const fetchConversations = async () => {
    if (!token) return;
    setConvoError("");
    setLoadingConvos(true);
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to load conversations");
      }
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setConvoError(err?.message || "Failed to load conversations");
    } finally {
      setLoadingConvos(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!token || !conversationId) return;
    setMessageError("");
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to load messages");
      }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessageError(err?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const upsertMessage = (msg) => {
    if (!msg?._id) return;
    setMessages((prev) => {
      if (prev.some((m) => m?._id === msg._id)) return prev;
      return [...prev, msg];
    });
  };

  useEffect(() => {
    setActiveConversationId(conversationIdParam);
  }, [conversationIdParam]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // If we landed with toUser (draft params) but a conversation already exists, redirect to it.
  // Match by other user only - same conversation whether from listing or profile.
  useEffect(() => {
    if (!draftToUser || conversationIdParam || loadingConvos) return;
    const match = conversations.find((c) => {
      const otherId = c.otherUser?._id?.toString();
      return otherId === draftToUser;
    });
    if (match) {
      navigate(`/messages?conversation=${encodeURIComponent(match._id)}`, { replace: true });
    }
  }, [conversations, loadingConvos, draftToUser, conversationIdParam, navigate]);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("conversation:upsert", () => {
      // easiest reliable behavior: refetch and reorder
      fetchConversations();
    });

    socket.on("message:new", (msg) => {
      if (!msg?.conversation) return;
      if (msg.conversation !== activeConversationIdRef.current) return;
      upsertMessage(msg);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    // Ensure we have the latest sidebar ordering even if we opened via URL.
    fetchConversations();

    socketRef.current?.emit("conversation:join", activeConversationId);
    fetchMessages(activeConversationId);

    return () => {
      socketRef.current?.emit("conversation:leave", activeConversationId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const openConversation = (conversationId) => {
    navigate(`/messages?conversation=${encodeURIComponent(conversationId)}`);
  };

  const handleSend = async () => {
    if (!token) return;
    const text = composer.trim();
    if (!text || sending) return;

    setSending(true);
    setMessageError("");
    try {
      const body = activeConversationId
        ? { conversationId: activeConversationId, content: text }
        : { recipientId: draftToUser, content: text };

      const res = await fetch(`${API_URL}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to send message");
      }

      const data = await res.json();
      const createdConversationId = data?.conversation?._id;
      const msg = data?.message;

      setComposer("");

      if (!activeConversationId && createdConversationId) {
        if (msg) upsertMessage(msg);
        // draft -> real conversation
        navigate(`/messages?conversation=${encodeURIComponent(createdConversationId)}`, { replace: true });
      }

      // For existing conversations, rely on the socket event to append (prevents duplicates).
    } catch (err) {
      setMessageError(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messages-page">
      <Header />
      <div className="messages-shell">
        <aside className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h2>Messages</h2>
          </div>

          {loadingConvos ? (
            <div className="messages-sidebar-empty">Loading…</div>
          ) : convoError ? (
            <div className="messages-sidebar-empty">Error: {convoError}</div>
          ) : conversations.length === 0 ? (
            <div className="messages-sidebar-empty">No conversations yet.</div>
          ) : (
            <div className="messages-list">
              {conversations.map((c) => {
                const isActive = c._id === activeConversationId;
                const title = c.otherUser?.username || "Unknown";
                const preview = c.lastMessageText || "";
                const time = c.lastMessageAt || c.updatedAt;
                return (
                  <button
                    key={c._id}
                    className={`messages-item ${isActive ? "active" : ""}`}
                    onClick={() => openConversation(c._id)}
                    type="button"
                  >
                    <div className="messages-avatar">{(title[0] || "?").toUpperCase()}</div>
                    <div className="messages-item-main">
                      <div className="messages-item-top">
                        <div className="messages-item-title">{title}</div>
                        <div className="messages-item-time">{formatTime(time)}</div>
                      </div>
                      <div className="messages-item-preview">{preview}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="messages-thread">
          {showEmptyState ? (
            <div className="messages-empty">
              <div className="messages-empty-icon">✉️</div>
              <div className="messages-empty-title">Your Messages</div>
              <div className="messages-empty-subtitle">
                Send private messages to other students
              </div>
            </div>
          ) : (
            <>
              <div className="messages-thread-header">
                <div className="messages-thread-title">
                  {activeOtherUser?._id ? (
                    <Link to={`/profile/${activeOtherUser._id}`} className="messages-username-link">
                      {activeOtherUser.username || "Conversation"}
                    </Link>
                  ) : (
                    activeOtherUser?.username || "Conversation"
                  )}
                </div>
              </div>

              <div className="messages-thread-body">
                {loadingMessages ? (
                  <div className="messages-thread-loading">Loading…</div>
                ) : messageError ? (
                  <div className="messages-thread-loading">Error: {messageError}</div>
                ) : messages.length === 0 ? (
                  <div className="messages-thread-loading">
                    {isDraft ? "Start the conversation." : "No messages yet."}
                  </div>
                ) : (
                  <div className="messages-bubbles">
                    {messages.map((m) => {
                      const mine = me && m.sender && m.sender.toString() === me.toString();
                      return (
                        <div key={m._id} className={`bubble-row ${mine ? "mine" : "theirs"}`}>
                          <div className={`bubble ${mine ? "mine" : "theirs"}`}>
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="messages-composer">
                <input
                  className="messages-input"
                  placeholder="Message…"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  disabled={sending}
                />
                <button
                  className="messages-send"
                  onClick={handleSend}
                  disabled={sending || !composer.trim()}
                  type="button"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

