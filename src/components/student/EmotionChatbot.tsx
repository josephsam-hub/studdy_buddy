import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Heart, Smile, Frown, Meh, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  emotion?: EmotionType;
}

type EmotionType = 'happy' | 'sad' | 'neutral' | 'anxious' | 'excited' | 'stressed';

const EmotionChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your study companion. How are you feeling today? I'm here to help you with your emotions and studies! 😊",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType>('neutral');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const emotionKeywords = {
    happy: ['happy', 'good', 'great', 'excellent', 'amazing', 'wonderful', 'excited', 'joyful', 'pleased'],
    sad: ['sad', 'down', 'depressed', 'upset', 'disappointed', 'blue', 'unhappy', 'hurt'],
    anxious: ['worried', 'nervous', 'anxious', 'stressed', 'overwhelmed', 'panic', 'fear', 'scared'],
    excited: ['excited', 'thrilled', 'pumped', 'enthusiastic', 'eager', 'passionate'],
    stressed: ['stressed', 'tired', 'exhausted', 'overwhelmed', 'pressure', 'deadline', 'busy'],
    neutral: ['okay', 'fine', 'normal', 'alright', 'whatever']
  };

  const getEmotionIcon = (emotion: EmotionType) => {
    switch (emotion) {
      case 'happy': return <Smile className="h-4 w-4 text-green-500" />;
      case 'excited': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'sad': return <Frown className="h-4 w-4 text-blue-500" />;
      case 'anxious': case 'stressed': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Meh className="h-4 w-4 text-gray-500" />;
    }
  };

  const detectEmotion = (text: string): EmotionType => {
    const lowerText = text.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return emotion as EmotionType;
      }
    }
    
    return 'neutral';
  };

  const generateBotResponse = (userEmotion: EmotionType, userMessage: string): string => {
    const responses = {
      happy: [
        "That's wonderful to hear! Your positive energy is great for learning. What subject would you like to focus on today?",
        "I love your enthusiasm! When we're happy, our brain is more receptive to new information. Let's make the most of it!",
        "Your good mood is contagious! How can I help you channel this energy into your studies?"
      ],
      excited: [
        "Your excitement is amazing! This is the perfect mindset for learning something new. What are you most excited to study?",
        "I can feel your energy! Excitement boosts memory formation. What topic should we dive into?",
        "That enthusiasm will take you far! Let's use this momentum to tackle your studies."
      ],
      sad: [
        "I understand you're feeling down. It's okay to have these feelings. Sometimes a gentle study session can help lift our spirits. Would you like to try something light?",
        "I'm here for you. Remember, learning small things can sometimes make us feel better. How about we start with something easy and comforting?",
        "Your feelings are valid. Studies show that gentle mental activity can sometimes help improve our mood. Want to try together?"
      ],
      anxious: [
        "I notice you seem worried. Let's take this one step at a time. Deep breathing can help - would you like some study techniques that reduce anxiety?",
        "Feeling anxious is normal, especially around studies. Let's break things down into smaller, manageable pieces. What's on your mind?",
        "I understand the pressure you're feeling. Let's focus on techniques that can help both your studies and your anxiety levels."
      ],
      stressed: [
        "Stress can be overwhelming. Let's work on some strategies to manage both your stress and your studies effectively. What's causing the most pressure?",
        "I hear that you're feeling stressed. Sometimes organizing our study approach can help reduce that feeling. Want to create a calm study plan?",
        "Stress affects learning, so let's address both together. What would help you feel more in control right now?"
      ],
      neutral: [
        "How can I help you with your studies today? I'm here to support your learning journey.",
        "What subject or topic would you like to explore? I'm ready to help however you need.",
        "I'm here to assist with your learning goals. What would you like to work on?"
      ]
    };

    const emotionResponses = responses[userEmotion];
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    const emotion = detectEmotion(inputMessage);
    setDetectedEmotion(emotion);

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(emotion, inputMessage),
        sender: 'bot',
        timestamp: new Date(),
        emotion
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="mood-card h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Emotion-Aware Study Assistant
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getEmotionIcon(detectedEmotion)}
              {detectedEmotion}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="flex-shrink-0">
                  {message.sender === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share how you're feeling or ask about studying..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionChatbot;