import { EmergencyCategory, Incident } from '../types';

// Declare types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSupported(): boolean {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
    lang = 'en-US'
  ): boolean {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return false;
    }

    try {
      this.recognition.lang = lang;
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          onResult(text.trim(), Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (onError) onError(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e: any) {
      this.isListening = false;
      if (onError) onError(e.message || 'Unable to start speech recognition');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop error
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export { SpeechRecognitionManager };
export const speechRecognition = new SpeechRecognitionManager();

export class VoiceSynthesizerManager {
  public speak(text: string, lang = 'en-US', onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.05; // Slightly crisp mission control cadence
      utterance.pitch = 1.0;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2))) || voices[0];
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeaking(): boolean {
    return 'speechSynthesis' in window ? window.speechSynthesis.speaking : false;
  }
}

export const voiceSynthesizer = new VoiceSynthesizerManager();

/**
 * Natural language classifier to extract emergency parameters from speech
 */
export function nlpClassifyEmergency(transcript: string): {
  detectedCategory?: EmergencyCategory;
  urgencyBoost: boolean;
  extractedCasualties?: number;
} {
  const lower = transcript.toLowerCase();

  // Category Matching
  let detectedCategory: EmergencyCategory | undefined;
  if (/fire|smoke|flames|blaze|gas leak|burning|explosion/i.test(lower)) {
    detectedCategory = 'Fire Emergency';
  } else if (/accident|collision|car crash|pileup|highway|vehicle|overturned|motorcycle/i.test(lower)) {
    detectedCategory = 'Road Accident';
  } else if (/cardiac|heart attack|stroke|unconscious|bleeding|ambulance|patient|breathing|choking/i.test(lower)) {
    detectedCategory = 'Medical Emergency';
  } else if (/flood|water level|submerged|overflow|drowning|drainage|flash flood/i.test(lower)) {
    detectedCategory = 'Flood';
  } else if (/collapse|rubble|crushed|debris|structural crack|building fell/i.test(lower)) {
    detectedCategory = 'Building Collapse';
  }

  // Urgency Boost
  const urgencyBoost = /trapped|critical|dying|life-threatening|massive|emergency|screaming|toxic/i.test(lower);

  // Casualty extraction
  let extractedCasualties: number | undefined;
  const numMatch = lower.match(/(\d+)\s*(people|persons|casualties|victims|injured|trapped)/);
  if (numMatch && numMatch[1]) {
    extractedCasualties = parseInt(numMatch[1], 10);
  } else {
    // Word numbers
    if (/one\s*(person|victim|injured)/.test(lower)) extractedCasualties = 1;
    else if (/two\s*(people|persons|victims|injured)/.test(lower)) extractedCasualties = 2;
    else if (/three\s*(people|persons|victims|injured)/.test(lower)) extractedCasualties = 3;
    else if (/four\s*(people|persons|victims|injured)/.test(lower)) extractedCasualties = 4;
    else if (/five\s*(people|persons|victims|injured)/.test(lower)) extractedCasualties = 5;
    else if (/several|multiple|many/.test(lower)) extractedCasualties = 6;
  }

  return { detectedCategory, urgencyBoost, extractedCasualties };
}

/**
 * Tactical command processing for mission control voice assistant
 */
export function processTacticalCommand(
  rawCommand: string,
  context: {
    incidents: Incident[];
    onSimulate?: () => void;
    onReset?: () => void;
    navigate?: (path: string) => void;
  }
): { responseText: string; actionExecuted?: string } {
  const lower = rawCommand.toLowerCase().trim();
  const { incidents, onSimulate, navigate } = context;

  // 1. Status Briefing
  if (/status|briefing|summary|situation|overview|report/i.test(lower)) {
    const total = incidents.length;
    const critical = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
    const inProgress = incidents.filter(i => i.status === 'In Progress').length;
    const duplicates = incidents.filter(i => Boolean(i.duplicateWarning)).length;

    return {
      responseText: `Command brief: SentriX is currently managing ${total} incident records. There are ${critical} active critical emergencies requiring priority intervention, ${inProgress} units in active response, and ${duplicates} suspected duplicate correlation warnings. Telemetry readiness is optimal.`,
      actionExecuted: 'STATUS_BRIEF',
    };
  }

  // 2. Critical Emergencies
  if (/critical|highest|danger|urgent/i.test(lower)) {
    const criticals = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved');
    if (criticals.length === 0) {
      return { responseText: 'Affirmative. Zero critical emergencies currently in queue. All sectors reported stable.' };
    }
    const top = criticals[0];
    return {
      responseText: `Warning: ${criticals.length} critical emergencies active. Highest priority is ${top.incidentCode}: ${top.title} at ${top.location} with ${top.peopleAffected} persons affected and priority score ${top.priorityScore}.`,
      actionExecuted: 'SHOW_CRITICAL',
    };
  }

  // 3. Category Queries
  if (/fire|smoke/i.test(lower)) {
    const fires = incidents.filter(i => i.category === 'Fire Emergency');
    return { responseText: `Fire command: ${fires.length} fire incidents registered across municipal sectors.` };
  }

  if (/accident|road|traffic/i.test(lower)) {
    const roads = incidents.filter(i => i.category === 'Road Accident');
    return { responseText: `Traffic corridor: ${roads.length} road accidents active. Traffic management and paramedics alerted.` };
  }

  if (/medical|hospital|ambulance/i.test(lower)) {
    const meds = incidents.filter(i => i.category === 'Medical Emergency');
    return { responseText: `Medical triage: ${meds.length} medical emergencies logged. Level-1 trauma units standing by.` };
  }

  // 4. Crisis Simulation
  if (/simulate|burst|inject|test|drill/i.test(lower)) {
    if (onSimulate) {
      onSimulate();
      return {
        responseText: 'Simulated disaster emergency injected into live incident grid. AI triage engine has computed priority scores.',
        actionExecuted: 'SIMULATE_EMERGENCY',
      };
    }
  }

  // 5. Navigation
  if (/map|geospatial|radar/i.test(lower)) {
    if (navigate) navigate('/admin/map');
    return { responseText: 'Routing to Geospatial Emergency Radar Map.', actionExecuted: 'NAVIGATE_MAP' };
  }

  if (/dashboard|command center|home/i.test(lower)) {
    if (navigate) navigate('/admin/dashboard');
    return { responseText: 'Navigating to Central Command Dashboard.', actionExecuted: 'NAVIGATE_DASHBOARD' };
  }

  // 6. First Aid Advice
  if (/first aid|cpr|choking|bleeding|burns/i.test(lower)) {
    return {
      responseText: 'Immediate life safety protocols: For severe bleeding, apply firm direct pressure with clean cloth. For burns, cool immediately under clean running water for 10 minutes. For unresponsive non-breathing victims, commence CPR: 30 chest compressions at 100-120 BPM followed by 2 rescue breaths.',
      actionExecuted: 'FIRST_AID_SOP',
    };
  }

  // 7. Helplines
  if (/helpline|number|call|contact/i.test(lower)) {
    return {
      responseText: 'National Emergency Dispatch Contacts: Universal Emergency 112, Police 100, Fire Rescue 101, Medical Ambulance 108, National Disaster Response 1077.',
      actionExecuted: 'HELPLINES',
    };
  }

  // Default Fallback
  return {
    responseText: `Received: "${rawCommand}". Ready to assist. You can ask for a status briefing, query critical emergencies, simulate a crisis scenario, or request first aid advice.`,
  };
}
