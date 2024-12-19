"use client";
import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import { Forward, RefreshCcw } from "lucide-react";

interface IMessages {
  role: string;
  content: string;
}

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<IMessages[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setPrompt("");
    }
  }, [messages]);

  const handleSubmit = async () => {
    setLoading(true);

    const userMessage = { role: "user", content: prompt };
    const newMessages = [...messages, userMessage];

    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, messages: newMessages }),
      });

      const data = await res.json();

      if (res.ok) {
        const botMessage = {
          role: "assistant",
          content: marked(data.choices[0].message.content),
        };
        setMessages([...(newMessages as IMessages[]), botMessage as IMessages]);
      } else {
        console.error("Ошибка:", data.error || "Ошибка при получении ответа.");
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 font-sans flex flex-col h-screen justify-between" style={{height:"100vh"}}>
      <h1 className="text-2xl font-bold mb-4">OpenAI Chat</h1>

      <div className="flex-1 overflow-y-auto bg-gray-100 p-3 rounded-md border border-gray-300 max-h-[70vh]">
        <div className="flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-2`}
            >
              <div
                className={`p-3 rounded-md max-w-6xl ${
                  message.role === "user"
                    ? "bg-white text-gray shadow-md"
                    : "bg-white text-gray shadow-md"
                }`}
              >
                <strong>{message.role === "user" ? "Вы" : "Бот"}:</strong>
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>
            </div>

          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mt-4 flex flex-row w-full items-center space-x-4 sticky bottom-0 bg-white ">
        <textarea
          className="flex-grow p-2 border border-gray-300 rounded-md outline-none"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Введите свой запрос здесь..."
        />
        <button
          className={`px-4 py-2 rounded-md text-white ${
            loading ? "bg-gray-400" : "bg-black hover:bg-gray-500 transition-all delay-150"
          }`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <RefreshCcw className="animate-spin h-5 w-5" />
          ) : (
            <Forward />
          )}
        </button>
      </div>
    </div>
  );
}
