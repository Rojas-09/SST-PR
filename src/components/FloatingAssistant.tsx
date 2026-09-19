import { useState } from 'react';
import { SlidersHorizontal, Clock, X, Send, Sparkles, Bot, User, CheckCircle2 } from 'lucide-react';
import { CompanyInfo, HazardRecord } from '../types';

interface FloatingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
  hazards: HazardRecord[];
  onSelectHazard?: (hazard: HazardRecord) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export function FloatingAssistant({
  isOpen,
  onClose,
  company,
  hazards,
  onSelectHazard,
}: FloatingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hola ${company.responsableSST.nombre.split(' ')[1] || 'Carlos'}, ¿en qué puedo ayudarte hoy? Recuerda que soy un asistente normativo para validar la GTC 45, Decreto 1072 y Resolución 0312 de ${company.name}.`,
      timestamp: 'Ahora',
      suggestions: [
        '¿Cuáles son los peligros Nivel I críticos del taller?',
        '¿Cómo se calcula el Nivel de Riesgo en la GTC 45?',
        '¿Qué requisitos exige la Resolución 0312 para Riesgo IV?',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();

      if (q.includes('crítico') || q.includes('nivel i') || q.includes('urgente') || q.includes('peligros')) {
        const crit = hazards.filter((h) => h.evaluacion.level === 'NIVEL_I');
        reply = `Actualmente ${company.name} cuenta con ${crit.length} situaciones críticas (Nivel I - No Aceptable) con orden de intervención perentoria:\n\n1. Bahía 4 (Soldadura): Operario realizando corte/soldadura sin careta fotosensible ni guantes de 16". Riesgo de quemaduras severas y daño ocular permanente.\n2. Bodega Principal: Conexión 220V expuesta a filtraciones de lluvia por cubierta deteriorada. Riesgo de choque eléctrico e incendio.\n\nAmbas requieren controles de ingeniería y dotación certificada inmediata antes de reiniciar labores.`;
      } else if (q.includes('gtc 45') || q.includes('cálculo') || q.includes('formula') || q.includes('nr')) {
        reply = `En la Guía Técnica Colombiana GTC 45 (2ª actualización), el cálculo matemático es estrictamente:\n\n• ND (Nivel de Deficiencia) × NE (Nivel de Exposición) = NP (Nivel de Probabilidad)\n• NP × NC (Nivel de Consecuencia) = NR (Nivel de Riesgo)\n\nInterpretación:\n• Nivel I (600 a 4000): Situación crítica, suspender actividades hasta corregir.\n• Nivel II (150 a 500): Corregir y adoptar medidas de control prioritarias.\n• Nivel III (40 a 120): Mejorar si es posible, justificar intervención.\n• Nivel IV (20): Mantener medidas preventivas actuales.`;
      } else if (q.includes('0312') || q.includes('estándares') || q.includes('mintrabajo') || q.includes('resolución')) {
        reply = `Para ${company.name} (Riesgo IV, 8 trabajadores), la Resolución 0312/2019 exige el cumplimiento de los 21 estándares mínimos para unidades productivas de alto riesgo.\n\n• Estado actual del taller: 78.5% de cumplimiento.\n• Puntos pendientes: Plan Anual de Capacitación firmado y simulacro de evacuación con ARL SURA.`;
      } else if (q.includes('incapacidad') || q.includes('ausentismo') || q.includes('cie') || q.includes('médic')) {
        reply = `En el módulo de ausentismo tienes 3 incapacidades radicadas:\n• Hernando Vargas: M54.5 Lumbago por sobreesfuerzo en foso (4 días).\n• Javier Ortiz: S61.0 Herida en mano por amoladora (5 días).\n• Carlos Morales: J00 Rinofaringitis común (3 días).\n\nTotal días perdidos: 17 jornadas con un Índice de Severidad de 2.1.`;
      } else {
        reply = `He registrado tu solicitud: "${text}". Los registros del SG-SST de ${company.name} se encuentran sincronizados con la ARL Seguros SURA y el Representante Legal Rodrigo Gómez. ¿Deseas consultar la matriz de riesgos, radicar una incapacidad o revisar las actas de dotación?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: 'Ahora',
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-[360px] max-w-[calc(100vw-24px)] h-[500px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] font-semibold text-slate-900">SST Fácil • Asistente Copilot</span>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-2 text-slate-600">
          <button
            type="button"
            className="hover:text-slate-900 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100"
            title="Ajustes de modelo"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="hover:text-slate-900 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100"
            title="Historial de consultas"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-slate-900 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100"
            title="Cerrar asistente"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[13px] text-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-xs'
                  : 'text-slate-800 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-xs px-3.5 py-2.5'
              }`}
            >
              <p className="whitespace-pre-line text-[13px] leading-relaxed">{msg.text}</p>
            </div>

            {/* Suggestion Chips */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="mt-2.5 flex flex-col items-end gap-1.5 w-full">
                {msg.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(sug)}
                    className="text-right text-[11.5px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 shadow-2xs transition-all hover:border-slate-400 cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-slate-400 py-1 px-2">
            <span className="text-[12px]">Consultando normativa...</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe una pregunta sobre la GTC 45, peligros o normas..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 pr-9 transition-colors shadow-2xs font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
              inputText.trim()
                ? 'text-white bg-[#1877F2] hover:bg-[#1464CC] cursor-pointer'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Enviar mensaje"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
