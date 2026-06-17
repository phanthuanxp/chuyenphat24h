import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Truck, Bot, Sparkles, AlertCircle } from "lucide-react";
import { ChatMessage } from "../types";

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      text: "Xin chào! Toi là Trợ lý vận tải ảo Chuyển Phát 24h. 🚚💨\n\nTôi có thể tư vấn cước phí, lịch trình xe hay giải đáp quy định đóng gói hàng cồng kềnh hỏa tốc. Quý khách muốn chuyển bưu gửi đi tỉnh nào ạ?",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const updatedMessages = [...messages, userMsg];
      
      const res = await fetch("/api/ai/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!res.ok) {
        throw new Error("Không thể đàm thoại với AI server");
      }

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text || "Xin lỗi, tôi gặp sự cố đường truyền nhất thời. Vui lòng thử lại hoặc gọi Hotline 0345076789.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "⚠️ Hiện tại kết nối trí tuệ nhân tạo đang bảo trì bến bãi. Anh/chị vui lòng gọi Hotline 0345.07.6789 để được phục vụ siêu nhanh ngay nhé!",
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    { title: "Gửi xe máy Thanh Hóa?", query: "Gửi xe máy từ Hà Nội đi Thanh Hóa bao nhiêu tiền và bao lâu giao được vậy?" },
    { title: "Tuyến Hải Phòng có xe chạy?", query: "Tuyến Hà Nội Hải Phòng hôm nay mấy giờ chạy chuyến gần nhất?" },
    { title: "Tuyến biên có Điện Biên không?", query: "Có nhận giao hỏa tốc đi tỉnh Điện Biên hay không vậy?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 text-xs sm:text-sm">
      {/* Circle Floating Icon Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 hover:scale-105 active:scale-95 text-slate-950 rounded-full flex flex-col items-center justify-center shadow-xl shadow-orange-500/20 shadow-inner group transition-all cursor-pointer border border-orange-400/40"
        >
          <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950 animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="text-[9px] font-black tracking-tighter uppercase mt-1">Chat AI</span>
        </button>
      )}

      {/* Expandible AI Consultant Chatbox frame */}
      {isOpen && (
        <div className="bg-slate-950 border border-slate-800/90 w-80 sm:w-96 h-[480px] sm:h-[520px] rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden relative">
          
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-805 p-4 flex items-center justify-between text-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-100">CỐ VẤN LOGISTICS 24H</span>
                <p className="text-[10px] text-green-400 font-bold flex items-center mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-ping"></span>
                  Bàn điều phối AI sẵn sàng
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-350 bg-slate-950/45 p-1 rounded border border-slate-800/80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation chat elements log */}
          <div 
            ref={scrollRef}
            className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-950/90"
          >
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div 
                  key={m.id}
                  className={`flex ${isBot ? "justify-start" : "justify-end"} items-start space-x-2`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Truck className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                  )}

                  <div className={`p-3 rounded-xl max-w-[85%] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isBot 
                      ? "bg-slate-900 text-slate-200 border border-slate-800" 
                      : "bg-indigo-600 font-semibold text-white text-right"
                  }`}>
                    {m.text}
                    <span className="block text-[8px] text-slate-550 mt-1.5 text-slate-400">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs pl-8">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-200"></span>
                </div>
                <span>Cố vấn đang tổng hợp cước phí...</span>
              </div>
            )}
          </div>

          {/* Dialog attachments container options */}
          <div className="bg-slate-900 border-t border-slate-805 p-3.5 space-y-3">
            {/* Quick action templates */}
            {messages.length < 3 && (
              <div className="flex space-x-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q.query)}
                    className="flex-shrink-0 bg-slate-950 text-[10px] text-slate-350 border border-slate-800/80 hover:border-slate-600 hover:text-slate-100 font-semibold py-1 px-2.5 rounded-full transition-all cursor-pointer"
                  >
                    {q.title}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
              className="flex space-x-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="flex-grow bg-slate-950 border border-slate-800 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none px-3 text-slate-200"
                placeholder="Ví dụ: Gửi laptop đi Hải Phòng cước sao?"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="bg-orange-500 hover:bg-orange-400 disabled:bg-slate-800 text-slate-950 p-2 rounded transition-colors flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4 text-slate-950 fill-slate-950" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
