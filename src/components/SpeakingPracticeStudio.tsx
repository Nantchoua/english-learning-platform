'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, Play, Square, RotateCcw,
  Sparkles, CheckCircle2, AlertCircle, Headphones,
  Award, MessageSquare, ArrowRight, UserCheck
} from 'lucide-react';

interface SpeakingPracticeStudioProps {
  lessonTitle: string;
  lessonContent?: string | null;
}

interface DialogueLine {
  speaker: string;
  text: string;
}

export default function SpeakingPracticeStudio({
  lessonTitle,
  lessonContent = '',
}: SpeakingPracticeStudioProps) {
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [role, setRole] = useState<'A' | 'B' | 'ALL'>('ALL');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [wordFeedback, setWordFeedback] = useState<{ word: string; status: 'correct' | 'missing' | 'wrong' }[]>([]);
  const [supported, setSupported] = useState(true);

  // Audio Recording state (MediaRecorder)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Speech synthesis reference
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  // Parse dialogue lines from lesson content if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      // Setup SpeechRecognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSupported(false);
      }
    }

    if (lessonContent) {
      const extracted: DialogueLine[] = [];
      const lines = lessonContent.split('\n');

      for (const line of lines) {
        // Look for Speaker A / Speaker B or * Speaker A: ...
        const matchA = line.match(/(?:Speaker\s*A|\*\*Speaker\s*A\*\*|\* Speaker A):\s*["“]?([^"”\n]+)["”]?/i);
        const matchB = line.match(/(?:Speaker\s*B|\*\*Speaker\s*B\*\*|\* Speaker B):\s*["“]?([^"”\n]+)["”]?/i);

        if (matchA && matchA[1].trim()) {
          extracted.push({ speaker: 'Speaker A', text: matchA[1].trim() });
        } else if (matchB && matchB[1].trim()) {
          extracted.push({ speaker: 'Speaker B', text: matchB[1].trim() });
        }
      }

      if (extracted.length > 0) {
        setDialogueLines(extracted);
      } else {
        // Default interactive phrases based on title
        setDialogueLines([
          { speaker: 'Speaker A', text: `Hello! Let's practice speaking English together today.` },
          { speaker: 'Speaker B', text: `Yes! I am ready to improve my pronunciation and fluency.` },
          { speaker: 'Speaker A', text: `That's great! Focus on clear pronunciation and confident tone.` }
        ]);
      }
    }
  }, [lessonContent]);

  // Clean strings for comparison
  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  // Play Native Text-to-Speech
  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = playbackSpeed;

    // Pick a natural English voice if available
    const voices = synthRef.current.getVoices();
    const enVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    synthRef.current.speak(utterance);
  };

  // Start Speech Recognition & Audio Recording
  const startRecording = async () => {
    setSpokenTranscript('');
    setAccuracyScore(null);
    setWordFeedback([]);
    setRecordedAudioUrl(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      // 1. Start MediaRecorder for playback
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);

      // 2. Start SpeechRecognition for text comparison
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenTranscript(transcript);

        if (event.results[0].isFinal) {
          evaluatePronunciation(transcript, dialogueLines[activeLineIndex].text);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioRecording();
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting audio recording:', err);
      alert('Microphone access was blocked. Please enable microphone permissions in your browser.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Compare spoken words against target sentence
  const evaluatePronunciation = (spoken: string, target: string) => {
    const targetWords = target.split(/\s+/);
    const normalizedSpokenWords = normalize(spoken).split(/\s+/);

    let matchedCount = 0;
    const feedback: { word: string; status: 'correct' | 'missing' | 'wrong' }[] = [];

    targetWords.forEach((origWord) => {
      const cleanWord = normalize(origWord);
      if (normalizedSpokenWords.includes(cleanWord)) {
        matchedCount++;
        feedback.push({ word: origWord, status: 'correct' });
      } else {
        feedback.push({ word: origWord, status: 'missing' });
      }
    });

    const score = Math.round((matchedCount / targetWords.length) * 100);
    setAccuracyScore(score);
    setWordFeedback(feedback);
  };

  const currentTarget = dialogueLines[activeLineIndex];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8 shadow-md">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#0056D2]/20 border border-[#0056D2]/40 flex items-center justify-center text-[#0056D2]">
            <Headphones className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              Speaking & Pronunciation Studio
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider">
                Interactive AI
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Listen to native audio, speak into your microphone, and get instant pronunciation accuracy.
            </p>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-700 text-xs">
          <span className="text-slate-400 font-semibold px-1.5">Speed:</span>
          <button
            type="button"
            onClick={() => setPlaybackSpeed(0.75)}
            className={`px-2 py-1 rounded font-bold transition ${
              playbackSpeed === 0.75 ? 'bg-[#0056D2] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            0.75x (Slow)
          </button>
          <button
            type="button"
            onClick={() => setPlaybackSpeed(1.0)}
            className={`px-2 py-1 rounded font-bold transition ${
              playbackSpeed === 1.0 ? 'bg-[#0056D2] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            1.0x (Normal)
          </button>
        </div>
      </div>

      {dialogueLines.length > 0 && currentTarget ? (
        <div className="space-y-6">
          {/* Target Phrase Display Card */}
          <div className="bg-slate-900/90 rounded-xl p-6 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Line {activeLineIndex + 1} of {dialogueLines.length} — {currentTarget.speaker}
              </span>

              {/* Native Voice Button */}
              <button
                type="button"
                onClick={() => speakText(currentTarget.text)}
                className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-blue-400" /> Listen to Native Speaker
              </button>
            </div>

            {/* Target Sentence */}
            <div className="text-xl font-medium text-white leading-relaxed tracking-wide">
              "{currentTarget.text}"
            </div>

            {/* Word-by-word Accuracy Highlights (if evaluated) */}
            {wordFeedback.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Pronunciation Breakdown:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {wordFeedback.map((item, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-sm font-semibold border ${
                        item.status === 'correct'
                          ? 'bg-green-950/60 text-green-300 border-green-700/60'
                          : 'bg-red-950/60 text-red-300 border-red-700/60 line-through'
                      }`}
                    >
                      {item.word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Record & Evaluation Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Microphone Action */}
            <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Your Speaking Turn
                </span>
                <p className="text-xs text-slate-400">
                  Click Record, read the sentence clearly into your microphone, then click Stop.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {!isListening ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg transition cursor-pointer"
                  >
                    <Mic className="w-4 h-4" /> Start Speaking
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopAudioRecording}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg transition animate-pulse cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" /> Stop & Check
                  </button>
                )}

                {recordedAudioUrl && (
                  <audio src={recordedAudioUrl} controls className="h-10 max-w-[200px] rounded" />
                )}
              </div>

              {spokenTranscript && (
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-500 font-bold block mb-0.5">We heard:</span>
                  "{spokenTranscript}"
                </div>
              )}
            </div>

            {/* Right: Accuracy Score & Feedback */}
            <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pronunciation Score
                </span>
                <p className="text-xs text-slate-400">Real-time matching against standard English phrasing.</p>
              </div>

              <div className="my-3 flex items-center gap-4">
                {accuracyScore !== null ? (
                  <>
                    <div
                      className={`text-4xl font-black ${
                        accuracyScore >= 80
                          ? 'text-green-400'
                          : accuracyScore >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {accuracyScore}%
                    </div>
                    <div>
                      {accuracyScore >= 80 ? (
                        <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Excellent Pronunciation!
                        </div>
                      ) : accuracyScore >= 50 ? (
                        <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold">
                          <AlertCircle className="w-4 h-4" /> Good effort! Try once more for 90%+.
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                          <RotateCcw className="w-4 h-4" /> Listen to the native voice and retry.
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {accuracyScore >= 80 ? 'Mastered phrasing' : 'Practice rhythm & vowels'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 text-xs italic py-2">
                    Press "Start Speaking" and read the target line to calculate your score.
                  </div>
                )}
              </div>

              {/* Next Dialogue Line Navigation */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <button
                  type="button"
                  disabled={activeLineIndex === 0}
                  onClick={() => {
                    setActiveLineIndex((prev) => prev - 1);
                    setSpokenTranscript('');
                    setAccuracyScore(null);
                    setWordFeedback([]);
                    setRecordedAudioUrl(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white disabled:opacity-30 transition font-medium"
                >
                  ← Previous Line
                </button>
                <button
                  type="button"
                  disabled={activeLineIndex === dialogueLines.length - 1}
                  onClick={() => {
                    setActiveLineIndex((prev) => prev + 1);
                    setSpokenTranscript('');
                    setAccuracyScore(null);
                    setWordFeedback([]);
                    setRecordedAudioUrl(null);
                  }}
                  className="flex items-center gap-1 bg-[#0056D2] hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-30"
                >
                  Next Line <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
