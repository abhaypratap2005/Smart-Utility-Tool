"use client"

import "./App.css"
import { useState, useEffect } from "react"
import { FiSend, FiCopy, FiSun, FiGlobe, FiMail, FiFileText } from "react-icons/fi"

// Add CSS styles directly to the component
const styles = {
  fullWidth: {
    width: "100%",
    maxWidth: "none",
  },
  root: {
    boxSizing: "border-box",
    margin: 0,
    padding: 0,
    width: "100%",
    minHeight: "100vh",
    overflowX: "hidden",
  },
}

function App() {
  const [activeTool, setActiveTool] = useState("chat")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState("English")
  const [tone, setTone] = useState("neutral")
  const [chatMessages, setChatMessages] = useState([])
  const [emailParams, setEmailParams] = useState({
    purpose: "",
    recipient: "",
    keyPoints: "",
  })
   useEffect(() => {
    setInputText("");
    setOutputText("");
    setEmailParams({ to: "", subject: "", body: "" });
    // Note: chatMessages are NOT reset here to preserve chat history
  }, [activeTool]);
  const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese"]
  const tones = ["neutral", "formal", "friendly", "professional", "enthusiastic"]

  // Add CSS to ensure full width
  useEffect(() => {
    document.documentElement.style.width = "100%"
    document.documentElement.style.height = "100%"
    document.body.style.width = "100%"
    document.body.style.height = "100%"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.overflowX = "hidden"
  }, [])

  const handleSummarize = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, language, tone }),
      })
      const data = await response.json()
      setOutputText(data.summary)
    } catch (error) {
      console.error("Error:", error)
      setOutputText("Error generating summary")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, targetLanguage: language, tone }),
      })
      const data = await response.json()
      setOutputText(data.translation)
    } catch (error) {
      console.error("Error:", error)
      setOutputText("Error translating text")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateEmail = async () => {
    if (!emailParams.purpose.trim() || !emailParams.recipient.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...emailParams, language, tone }),
      })
      const data = await response.json()
      setOutputText(data.email)
    } catch (error) {
      console.error("Error:", error)
      setOutputText("Error generating email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatSend = async () => {
  if (!inputText.trim()) return;

  const userMessage = { role: "user", content: inputText };
  const updatedMessages = [...chatMessages, userMessage];

  setChatMessages(updatedMessages);
  setInputText("");
  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: updatedMessages,
        language,
        tone,
      }),
    });

    const data = await response.json();

    const aiMessage = { role: "assistant", content: data.reply };
    setChatMessages((prev) => [...prev, aiMessage]);
  } catch (error) {
    console.error("Error in chat:", error);
  }

  setIsLoading(false);
};

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800" style={styles.root}>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 " style={styles.fullWidth}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6" style={styles.fullWidth}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600">Smart Utility Dashboard</h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <FiGlobe className="text-gray-500 flex-shrink-0" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <FiSun className="text-gray-500 flex-shrink-0" />
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {tones.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 " style={styles.fullWidth}>
        <div className="flex flex-col lg:flex-row gap-6 ">
          {/* Sidebar */}
          <div className="w-full lg:w-72 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 overflow-auto">
            <h2 className="text-lg font-semibold mb-6 text-gray-800">AI Tools</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTool("chat")}
                className={` w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                  activeTool === "chat"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]"
                    : "hover:bg-gray-100 text-gray-700 hover:scale-[1.01]"
                }`}
              >
                <FiSend className="flex-shrink-0 w-4 h-4" />
                <span className="font-medium">AI Chat</span>
              </button>
              <button
                onClick={() => setActiveTool("summarize")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                  activeTool === "summarize"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]"
                    : "hover:bg-gray-100 text-gray-700 hover:scale-[1.01]"
                }`}
              >
                <FiFileText className="flex-shrink-0 w-4 h-4" />
                <span className="font-medium">Summarize</span>
              </button>
              <button
                onClick={() => setActiveTool("translate")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                  activeTool === "translate"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]"
                    : "hover:bg-gray-100 text-gray-700 hover:scale-[1.01]"
                }`}
              >
                <FiGlobe className="flex-shrink-0 w-4 h-4" />
                <span className="font-medium">Translate</span>
              </button>
              <button
                onClick={() => setActiveTool("email")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                  activeTool === "email"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]"
                    : "hover:bg-gray-100 text-gray-700 hover:scale-[1.01]"
                }`}
              >
                <FiMail className="flex-shrink-0 w-4 h-4" />
                <span className="font-medium">Generate Email</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
            {activeTool === "chat" && (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">AI Chat Assistant</h2>
                  <p className="text-sm text-gray-600">
                    Chat with our AI assistant in your preferred language and tone
                  </p>
                </div>
                <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: "500px" }}>
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <FiSend className="w-8 h-8 text-indigo-500" />
                      </div>
                      <p className="text-lg font-medium">Start a conversation</p>
                      <p className="text-sm">Ask me anything and I'll help you out!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md"
                                : "bg-gray-100 text-gray-800 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      <FiSend className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTool === "summarize" && (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Text Summarizer</h2>
                  <p className="text-sm text-gray-600">Summarize any text in your preferred language and tone</p>
                </div>
                <div className="flex-1 p-6">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste the text you want to summarize..."
                    className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 mb-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                  <button
                    onClick={handleSummarize}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium"
                  >
                    {isLoading ? "Summarizing..." : "Summarize Text"}
                  </button>
                </div>
                {outputText && (
                  <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">Summary</h3>
                      <button
                        onClick={copyToClipboard}
                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                        title="Copy to clipboard"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                      <p className="text-gray-700 leading-relaxed">{outputText}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTool === "translate" && (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-green-50 to-blue-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Text Translator</h2>
                  <p className="text-sm text-gray-600">Translate text to your selected language</p>
                </div>
                <div className="flex-1 p-6">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 mb-6 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                  <button
                    onClick={handleTranslate}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium"
                  >
                    {isLoading ? "Translating..." : "Translate Text"}
                  </button>
                </div>
                {outputText && (
                  <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">Translation</h3>
                      <button
                        onClick={copyToClipboard}
                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
                        title="Copy to clipboard"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                      <p className="text-gray-700 leading-relaxed">{outputText}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTool === "email" && (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Generator</h2>
                  <p className="text-sm text-gray-600">Create professional emails quickly</p>
                </div>
                <div className="flex-1 p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient</label>
                      <input
                        type="text"
                        value={emailParams.recipient}
                        onChange={(e) => setEmailParams({ ...emailParams, recipient: e.target.value })}
                        placeholder="Who is this email for?"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
                      <input
                        type="text"
                        value={emailParams.purpose}
                        onChange={(e) => setEmailParams({ ...emailParams, purpose: e.target.value })}
                        placeholder="What is the purpose of this email?"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Key Points</label>
                      <textarea
                        value={emailParams.keyPoints}
                        onChange={(e) => setEmailParams({ ...emailParams, keyPoints: e.target.value })}
                        placeholder="What key points should be included?"
                        className="w-full h-32 border border-gray-300 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateEmail}
                    disabled={isLoading}
                    className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium"
                  >
                    {isLoading ? "Generating..." : "Generate Email"}
                  </button>
                </div>
                {outputText && (
                  <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">Generated Email</h3>
                      <button
                        onClick={copyToClipboard}
                        className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
                        title="Copy to clipboard"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                      <pre className="text-gray-700 leading-relaxed whitespace-pre-line font-sans">{outputText}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  )
}

export default App
