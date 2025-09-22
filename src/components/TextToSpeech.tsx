import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Volume2, VolumeX, Settings } from "lucide-react";

interface TextToSpeechProps {
  text: string;
  title?: string;
}

export function TextToSpeech({ text, title = "Content" }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState([0.8]);
  const [rate, setRate] = useState([1]);
  const [voice, setVoice] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalLength, setTotalLength] = useState(0);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice (prefer English voices)
      const englishVoice = availableVoices.find(v => v.lang.startsWith('en'));
      if (englishVoice && !voice) {
        setVoice(englishVoice.name);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [voice]);

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/[#*•]/g, '') // Remove markdown and bullet points
      .replace(/\n+/g, '. ') // Replace line breaks with pauses
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const handlePlay = () => {
    if (!text) return;

    if (isPaused && utteranceRef.current) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set voice
    const selectedVoice = voices.find(v => v.name === voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set properties
    utterance.volume = volume[0];
    utterance.rate = rate[0];
    utterance.pitch = 1;

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setTotalLength(cleanText.length);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
    };

    utterance.onboundary = (event) => {
      setCurrentPosition(event.charIndex);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(0);
  };

  const progress = totalLength > 0 ? (currentPosition / totalLength) * 100 : 0;

  return (
    <Card className="bg-background brutal-border brutal-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Text to Speech
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground font-bold">
          Listen to: {title}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="bg-muted brutal-border h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            <span>{Math.round(currentPosition / 10)} / {Math.round(totalLength / 10)} chars</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlay}
            disabled={!text || (isPlaying && !isPaused)}
            variant="brutal"
            size="sm"
          >
            <Play className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handlePause}
            disabled={!isPlaying}
            variant="outline"
            size="sm"
          >
            <Pause className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            variant="outline"
            size="sm"
          >
            <Square className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-xs font-bold w-8">{Math.round(volume[0] * 100)}%</span>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="space-y-4 bg-muted brutal-border p-4">
            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Voice</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="brutal-border">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Volume: {Math.round(volume[0] * 100)}%</label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Speed: {rate[0]}x</label>
              <Slider
                value={rate}
                onValueChange={setRate}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Status */}
        {isPlaying && (
          <div className="bg-primary/10 brutal-border p-2">
            <p className="text-xs font-bold text-primary">
              🔊 Playing audio...
            </p>
          </div>
        )}
        
        {isPaused && (
          <div className="bg-secondary/10 brutal-border p-2">
            <p className="text-xs font-bold text-secondary">
              ⏸️ Audio paused
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}