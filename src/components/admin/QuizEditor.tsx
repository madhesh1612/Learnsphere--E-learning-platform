import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Choice {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    text: string;
    choices: Choice[];
}

export function QuizEditor() {
    const [questions, setQuestions] = useState<Question[]>([
        {
            id: '1',
            text: 'Write your question here',
            choices: [
                { id: 'c1', text: 'Answer 1', isCorrect: true },
                { id: 'c2', text: 'Answer 2', isCorrect: false },
                { id: 'c3', text: 'Answer 3', isCorrect: false },
            ]
        }
    ]);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>('1');

    const activeQuestion = questions.find(q => q.id === selectedQuestionId);

    const addQuestion = () => {
        const newId = (questions.length + 1).toString();
        const newQuestion: Question = {
            id: newId,
            text: 'New Question',
            choices: [
                { id: `c${newId}-1`, text: 'Option 1', isCorrect: false },
                { id: `c${newId}-2`, text: 'Option 2', isCorrect: false },
            ]
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newId);
    };

    const updateQuestionText = (text: string) => {
        if (!activeQuestion) return;
        const updated = questions.map(q => q.id === activeQuestion.id ? { ...q, text } : q);
        setQuestions(updated);
    };

    const updateChoice = (choiceId: string, parsedUpdate: Partial<Choice>) => {
        if (!activeQuestion) return;
        const updatedChoices = activeQuestion.choices.map(c =>
            c.id === choiceId ? { ...c, ...parsedUpdate } : c
        );
        const updated = questions.map(q => q.id === activeQuestion.id ? { ...q, choices: updatedChoices } : q);
        setQuestions(updated);
    };

    const addChoice = () => {
        if (!activeQuestion) return;
        const newChoice: Choice = {
            id: Math.random().toString(36).substr(2, 9),
            text: 'New Option',
            isCorrect: false
        };
        const updated = questions.map(q => q.id === activeQuestion.id ? { ...q, choices: [...q.choices, newChoice] } : q);
        setQuestions(updated);
    }

    return (
        <div className="flex bg-card border rounded-lg h-[600px] overflow-hidden">
            {/* Sidebar Question List */}
            <div className="w-64 border-r bg-muted/20 flex flex-col">
                <div className="p-4 border-b font-semibold text-sm">Question List</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {questions.map((q, idx) => (
                        <div
                            key={q.id}
                            onClick={() => setSelectedQuestionId(q.id)}
                            className={`p-3 rounded-md cursor-pointer text-sm font-medium transition-colors border ${selectedQuestionId === q.id
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'hover:bg-accent border-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="truncate">Question {idx + 1}</span>
                                {selectedQuestionId === q.id && (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate mt-1 font-normal opacity-70">
                                {q.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t space-y-2">
                    <Button onClick={addQuestion} className="w-full bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                    </Button>
                    <Button variant="outline" className="w-full bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                        Rewards
                    </Button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col">
                {activeQuestion ? (
                    <div className="p-8 max-w-3xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
                        {/* Question Text */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-muted-foreground">{questions.findIndex(q => q.id === activeQuestion.id) + 1}.</span>
                                <Input
                                    value={activeQuestion.text}
                                    onChange={(e) => updateQuestionText(e.target.value)}
                                    className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent placeholder:text-muted-foreground/50 h-auto py-2"
                                    placeholder="Write your question here"
                                />
                            </div>
                        </div>

                        {/* Choices */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-[1fr,80px] gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
                                <span>Choices</span>
                                <span className="text-center">Correct</span>
                            </div>

                            <div className="space-y-4">
                                {activeQuestion.choices.map((choice) => (
                                    <div key={choice.id} className="grid grid-cols-[1fr,80px] gap-4 items-center group">
                                        <Input
                                            value={choice.text}
                                            onChange={(e) => updateChoice(choice.id, { text: e.target.value })}
                                            className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                                        />
                                        <div className="flex justify-center">
                                            <Checkbox
                                                checked={choice.isCorrect}
                                                onCheckedChange={(checked) => updateChoice(choice.id, { isCorrect: checked === true })}
                                                className="h-5 w-5"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addChoice}
                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 pl-0"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add choice
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a question to edit
                    </div>
                )}
            </div>
        </div>
    );
}
