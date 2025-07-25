import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const mockQuestions: Question[] = [
  {
    question: "Which of the following best describes a refutation in debate?",
    options: [
      "Presenting new evidence supporting your argument",
      "Summarising your own case at the end of the speech",
      "Directly addressing and disproving an opponent's argument",
      "Introducing a new line of reasoning unrelated to the motion",
    ],
    correct: 2,
  },
  {
    question: "In British Parliamentary format, how many speakers are there in total?",
    options: ["4", "6", "8", "10"],
    correct: 2,
  },
  {
    question: "What is the primary goal of a Point of Information (POI)?",
    options: [
      "Clarify a factual detail in the speech",
      "Offer support to the current speaker",
      "Disrupt the flow and challenge the speaker's point",
      "Provide additional evidence for the motion",
    ],
    correct: 2,
  },
];

const DailyChallenge = () => {
  const [selected, setSelected] = useState<(number | null)[]>(Array(mockQuestions.length).fill(null));
  const [showScore, setShowScore] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (showScore) return;
    setSelected((prev) => {
      const copy = [...prev];
      copy[qIdx] = optIdx;
      return copy;
    });
  };

  const score = selected.reduce((acc, val, idx) => {
    if (val === mockQuestions[idx].correct) return acc + 1;
    return acc;
  }, 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Daily Challenge</h1>
        {mockQuestions.map((q, qIdx) => (
          <Card key={qIdx} className="bg-[#1C1C1C] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Question {qIdx + 1}</CardTitle>
              <CardDescription className="text-gray-400">{q.question}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = selected[qIdx] === optIdx;
                const isCorrect = showScore && optIdx === q.correct;
                const isWrongSel =
                  showScore && isSelected && optIdx !== q.correct;
                return (
                  <Button
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    variant="outline"
                    className={`w-full justify-start text-left bg-transparent border-gray-700 hover:bg-gray-700/30 ${
                      isSelected ? "border-accent" : ""
                    } ${isCorrect ? "border-lime-500" : ""} ${
                      isWrongSel ? "border-red-500" : ""
                    }`}
                  >
                    {opt}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        ))}
        {!showScore && (
          <Button onClick={() => setShowScore(true)} className="mt-4">
            Submit Answers
          </Button>
        )}
        {showScore && (
          <div className="text-xl font-semibold text-center text-white">
            You scored {score} / {mockQuestions.length}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DailyChallenge;
