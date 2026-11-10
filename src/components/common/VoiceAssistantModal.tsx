import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  Radio,
  Terminal,
  ShieldAlert,
  Zap,
  Activity,
  PhoneCall,
  HeartPulse,
} from 'lucide-react';
import {
  speechRecognition,
  voiceSynthesizer,
  processTacticalCommand,
} from '../../utils/speechAI';
import { incidentService } from '../../services/incidentService';
import { useLanguage } from '../../context/LanguageContext';
import { soundEffects } from '../../utils/soundEffects';

interface Message {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  time: string;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate?: () => void;
  navigate?: (path: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSimulate,
  navigate,
}) => {
  const { currentLanguageOption, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'aura',
      text: 'AURA Tactical Emergency AI online. How can I assist Command today? You can speak naturally or select a quick briefing command below.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      soundEffects.playBeep();
    } else {
      speechRecognition.stop();
      voiceSynthesizer.stop();
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleExecuteCommand = (command: string) => {
    if (!command.trim()) return;

    soundEffects.playClick();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: command,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Stop listening while assistant responds
    speechRecognition.stop();
    setIsListening(false);

    // Process command
    const incidents = incidentService.getIncidents();
    const result = processTacticalCommand(command, {
      incidents,
      onSimulate,
      navigate,
    });

    const auraMsg: Message = {
      id: `a-${Date.now()}`,
      sender: 'aura',
      text: result.responseText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, auraMsg]);

    // Speak response
    setIsSpeaking(true);
    voiceSynthesizer.speak(result.responseText, currentLanguageOption.speechLocale, () => {
      setIsSpeaking(false);
    });
  };

  const toggleListening = () => {
    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
      soundEffects.playClick();
    } else {
      soundEffects.playBeep();
      const started = speechRecognition.start(
        (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            handleExecuteCommand(transcript);
          }
        },
        err => {
          console.warn('Speech error:', err);
          setIsListening(false);
        },
        currentLanguageOption.speechLocale
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  const handleStopSpeaking = () => {
    voiceSynthesizer.stop();
    setIsSpeaking(false);
    soundEffects.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 selection:bg-sentinel-cyan/30 selection:text-sentinel-cyan animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel bg-sentinel-navy rounded-3xl border border-sentinel-cyan/30 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-sentinel-darkSurface via-slate-900 to-[#071426] border-b border-sentinel-darkBorder flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sentinel-cyan to-teal-500 flex items-center justify-center text-sentinel-navy shadow-lg shadow-cyan-500/30">
                <Radio className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-sentinel-navy animate-ping" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-sentinel-navy" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {t('voice.title', 'AURA Tactical Voice AI')}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30 font-bold">
                  {currentLanguageOption.flag} {currentLanguageOption.code.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {t('voice.subtitle', 'Speech-Powered Emergency Mission Control Assistant')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={handleStopSpeaking}
                className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Silence Voice"
              >
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">Mute Voice</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close voice assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Acoustic Visualizer Wave Strip */}
        <div className="h-10 bg-[#040C17] border-b border-white/5 flex items-center justify-center px-4 gap-1 overflow-hidden shrink-0">
          {isListening ? (
            <div className="flex items-center gap-1.5 text-xs text-sentinel-cyan font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LISTENING ({currentLanguageOption.name})... SPEAK YOUR COMMAND</span>
              <div className="flex items-end gap-1 h-5 ml-2">
                {[12, 20, 15, 24, 18, 28, 14, 22, 16, 26, 12, 18].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-sentinel-cyan rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : isSpeaking ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>TRANSMITTING VOCAL SYNTHESIS...</span>
              <div className="flex items-end gap-1 h-5 ml-2">
                {[10, 16, 22, 14, 26, 18, 24, 12].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-600" />
              VOICE RECOGNITION STANDBY • CLICK MICROPHONE OR TYPE BELOW
            </span>
          )}
        </div>

        {/* Transcript Conversation Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-700 text-white'
                    : 'bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40'
                }`}
              >
                {msg.sender === 'user' ? <Terminal className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sentinel-cyan text-sentinel-navy font-semibold rounded-tr-none shadow-lg shadow-cyan-500/20'
                    : 'bg-sentinel-darkSurface text-slate-200 border border-sentinel-darkBorder rounded-tl-none shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-70 font-mono">
                  <span>{msg.sender === 'user' ? 'Operator Command' : 'AURA AI Response'}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Suggestion Pills */}
        <div className="px-4 py-2.5 bg-[#050F1D] border-t border-sentinel-darkBorder/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => handleExecuteCommand('Status report')}
            className="text-xs font-mono px-3 py-1.5 rounded-xl bg-sentinel-darkSurface hover:bg-slate-800 text-slate-300 hover:text-white border border-sentinel-darkBorder shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-sentinel-cyan" />
            <span>{t('voice.quickStatus', 'Status Briefing')}</span>
          </button>

          <button
            onClick={() => handleExecuteCommand('Critical emergencies')}
            className="text-xs font-mono px-3 py-1.5 rounded-xl bg-sentinel-darkSurface hover:bg-slate-800 text-slate-300 hover:text-white border border-sentinel-darkBorder shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>{t('voice.quickCritical', 'Critical Incidents')}</span>
          </button>

          <button
            onClick={() => handleExecuteCommand('Simulate crisis')}
            className="text-xs font-mono px-3 py-1.5 rounded-xl bg-sentinel-darkSurface hover:bg-slate-800 text-slate-300 hover:text-white border border-sentinel-darkBorder shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('voice.quickSimulate', 'Simulate Crisis')}</span>
          </button>

          <button
            onClick={() => handleExecuteCommand('First aid advice')}
            className="text-xs font-mono px-3 py-1.5 rounded-xl bg-sentinel-darkSurface hover:bg-slate-800 text-slate-300 hover:text-white border border-sentinel-darkBorder shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('voice.quickFirstAid', 'First Aid SOP')}</span>
          </button>

          <button
            onClick={() => handleExecuteCommand('Emergency helpline numbers')}
            className="text-xs font-mono px-3 py-1.5 rounded-xl bg-sentinel-darkSurface hover:bg-slate-800 text-slate-300 hover:text-white border border-sentinel-darkBorder shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('voice.quickHelpline', 'Helplines')}</span>
          </button>
        </div>

        {/* Bottom Interactive Bar */}
        <div className="p-3.5 sm:p-4 bg-sentinel-darkSurface border-t border-sentinel-darkBorder flex items-center gap-2.5 shrink-0">
          {/* Mic Button */}
          <button
            onClick={toggleListening}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0 ${
              isListening
                ? 'bg-red-500 text-white shadow-red-500/40 animate-pulse glow-red'
                : 'bg-gradient-to-r from-sentinel-cyan to-teal-400 text-sentinel-navy hover:opacity-95 shadow-cyan-500/20'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice recognition'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 font-bold" />}
          </button>

          {/* Text Input for Typing */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleExecuteCommand(inputText);
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? t('report.listening', 'Listening... speak now')
                  : t('voice.typePlaceholder', 'Ask AURA or enter command...')
              }
              className="flex-1 rounded-2xl bg-[#071426] border border-sentinel-darkBorder px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sentinel-cyan font-sans transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sentinel-cyan border border-sentinel-darkBorder flex items-center justify-center transition-colors shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
