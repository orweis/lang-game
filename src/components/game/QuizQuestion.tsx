"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { QuizQuestion as QuizQuestionType, HebrewLetter, HebrewWord } from "@/types";
import { QuizChoice } from "./QuizChoice";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (correct: boolean) => void;
}

type ChoiceState = "idle" | "correct" | "wrong";

export function QuizQuestion({ question, onAnswer }: QuizQuestionProps) {
  const { speak } = useAudio();
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const [states, setStates] = useState<Record<string, ChoiceState>>({});
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setStates({});
    setAnswered(false);
    const t = setTimeout(() => speakRef.current(question.ttsPrompt), 500);
    return () => clearTimeout(t);
  }, [question.id, question.ttsPrompt]);

  const handleChoice = (choiceId: string) => {
    if (answered) return;
    setAnswered(true);
    const correct = choiceId === question.correctId;
    setStates({ [choiceId]: correct ? "correct" : "wrong", [question.correctId]: "correct" });
    speak(correct ? "כָּל הַכָּבוֹד" : question.ttsPrompt);
    setTimeout(() => onAnswer(correct), 2000);
  };

  const getShowAs = (): "letter" | "word" | "name" => {
    if (question.type === "letter-to-name") return "name";
    if (question.type === "sound-to-letter") return "letter";
    return "word";
  };

  const showAs = getShowAs();

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt area */}
      <div className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-md p-6">
        {question.type === "letter-to-name" && (
          <span className="text-8xl font-black text-slate-800">{question.prompt}</span>
        )}
        {question.type === "word-to-emoji" && (
          <span className="text-8xl">{question.prompt}</span>
        )}
        {question.type === "sound-to-letter" && (
          <span className="text-4xl font-bold text-slate-700">{question.prompt}</span>
        )}
        <motion.button
          onClick={() => speak(question.ttsPrompt)}
          whileTap={{ scale: 0.88 }}
          aria-label="האזן שוב"
          className="flex items-center gap-2 bg-sky-100 hover:bg-sky-200 rounded-full px-5 py-2 text-2xl text-sky-700 font-bold transition-colors"
        >
          🔊 <span className="text-lg">שמע</span>
        </motion.button>
      </div>

      {/* Choices */}
      <div className={cn(
        "grid gap-4",
        question.choices.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"
      )}>
        {question.choices.map((choice) => (
          <QuizChoice
            key={choice.id}
            choice={choice as HebrewLetter | HebrewWord}
            state={states[choice.id] ?? "idle"}
            onClick={() => handleChoice(choice.id)}
            showAs={showAs}
          />
        ))}
      </div>
    </div>
  );
}
