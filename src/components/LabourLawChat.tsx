import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Trash2,
  AlertCircle
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isPlaying?: boolean;
}

const QUICK_QUESTIONS_RO = [
  "Câte zile de concediu am dreptul?",
  "Ce sunt tichetele de masă?",
  "Cum funcționează concediul medical?",
  "Care sunt regulile pentru orele suplimentare?"
];

const QUICK_QUESTIONS_EN = [
  "How many vacation days am I entitled to?",
  "What are meal vouchers?",
  "Can my employer require overtime?",
  "How does medical leave work?"
];

const LabourLawChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [language, setLanguage] = useState<"ro" | "en">("ro");
  const [speechSupported, setSpeechSupported] = useState(true);
  
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !window.speechSynthesis) {
      setSpeechSupported(false);
      toast({
        title: "Voice features unavailable",
        description: "Your browser doesn't support voice input/output. Please use Chrome, Edge, or Safari.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Initialize speech recognition
  useEffect(() => {
    if (!speechSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === "ro" ? "ro-RO" : "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        setInput(prev => prev + finalText + " ");
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice input",
          variant: "destructive"
        });
      } else if (event.error === "no-speech") {
        toast({
          title: "No speech detected",
          description: "Please try again",
          variant: "destructive"
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, speechSupported, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const toggleListening = () => {
    if (!speechSupported) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const speakText = (text: string, messageId: string) => {
    if (!speechSupported || !window.speechSynthesis) {
      toast({
        title: "Voice output not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Detect language from text
    const isRomanian = /[ăâîșțĂÂÎȘȚ]/.test(text) || language === "ro";
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isRomanian ? "ro-RO" : "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to select appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(isRomanian ? "ro" : "en")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isPlaying: true } : msg
      ));
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isPlaying: false } : msg
      ));
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput("");
    setInterimTranscript("");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/labour-law-chat`;
      
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          throw new Error("Prea multe cereri. Vă rugăm să încercați din nou în câteva momente.");
        }
        if (resp.status === 402) {
          throw new Error("Serviciul AI necesită reîncărcare credite.");
        }
        throw new Error('Failed to get response');
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      const assistantMessageId = (Date.now() + 1).toString();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages([
                ...newMessages, 
                { 
                  id: assistantMessageId,
                  role: "assistant", 
                  content: assistantContent,
                  timestamp: new Date(),
                  isPlaying: false
                }
              ]);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

    } catch (error: any) {
      console.error("Error sending message:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    stopSpeaking();
    toast({
      title: "Conversation cleared",
      description: "Chat history has been reset"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = language === "ro" ? QUICK_QUESTIONS_RO : QUICK_QUESTIONS_EN;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              🇷🇴 Labor Law Companion
            </CardTitle>
            <CardDescription>
              Your Romanian workplace rights assistant
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={language === "ro" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("ro")}
            >
              🇷🇴 RO
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
            >
              🇬🇧 EN
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-amber-900 dark:text-amber-100">
              <strong>Important Notice:</strong> This chatbot provides general information about Romanian labor law as of October 2025. This is NOT legal advice. For specific situations, consult your company's HR department, a qualified labor lawyer, or Romanian Labor Inspectorate (ITM).
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Chat Messages */}
        <ScrollArea className="h-[500px] p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-6xl">⚖️</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {language === "ro" ? "Bine ați venit!" : "Welcome!"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === "ro" 
                    ? "Adresați-mi întrebări despre drepturile dumneavoastră la locul de muncă"
                    : "Ask me questions about your workplace rights"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickQuestions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(question)}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString(language === "ro" ? "ro-RO" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => {
                            if (message.isPlaying) {
                              stopSpeaking();
                            } else {
                              speakText(message.content, message.id);
                            }
                          }}
                          disabled={!speechSupported}
                        >
                          {message.isPlaying ? (
                            <VolumeX className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        {language === "ro" ? "Caut în legislația muncii..." : "Searching labor law..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length > 0 && (
          <div className="px-4 py-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  onClick={() => sendMessage(question)}
                  className="text-xs h-7"
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          {interimTranscript && (
            <div className="mb-2 p-2 bg-muted/50 rounded text-sm italic text-muted-foreground">
              {interimTranscript}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleListening}
              disabled={isLoading || !speechSupported}
              title={language === "ro" ? "Înregistrare vocală" : "Voice input"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 animate-pulse" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                language === "ro"
                  ? "Întrebați despre concedii, tichete de masă, ore suplimentare..."
                  : "Ask about medical leave, meal vouchers, overtime..."
              }
              disabled={isLoading}
              className="flex-1"
            />

            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>

            {messages.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearConversation}
                title={language === "ro" ? "Șterge conversația" : "Clear conversation"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-2 text-xs text-muted-foreground text-center">
            {language === "ro" ? (
              <>Data actualizată: Octombrie 2025 | Nu înlocuiește sfatul juridic profesional</>
            ) : (
              <>Data current as of October 2025 | Not a substitute for professional legal advice</>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabourLawChat;
