"use client";

import { useState } from "react";
import OpenAISettings, {
  OpenAISettings as OpenAISettingsType,
} from "@/components/OpenAISettings";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type InterviewSection = {
  id: string;
  label: string;
  prompt: string;
};

const interviewSections: InterviewSection[] = [
  {
    id: "full",
    label: "Full Interview",
    prompt:
      "Conduct a natural interview session, moving from one topic to the next organically. Ask ONE question at a time and provide feedback after each response.",
  },
  {
    id: "opener",
    label: "Small Talk / Opener",
    prompt:
      "Focus on the interview opening phase. Help the candidate practice: \n- Making a strong first impression\n- Handling 'Tell me about yourself'\n- Building rapport through small talk\n- Showing enthusiasm and professionalism in initial interactions\n\nRemember to ask only ONE question at a time.",
  },
  {
    id: "experience",
    label: "Relevant Experience",
    prompt:
      "Focus on discussing professional experience. Help the candidate:\n- Present their experience effectively\n- Connect past experiences to the role\n- Use the STAR method for behavioral questions\n- Highlight key achievements and learnings\n\nAsk ONE focused question at a time about their experience.",
  },
  {
    id: "role",
    label: "Questions About the Role",
    prompt:
      "Focus on role-specific discussions. Help the candidate:\n- Show understanding of the position\n- Ask intelligent questions about the role\n- Demonstrate enthusiasm for the opportunity\n- Address potential concerns about fit\n\nKeep the conversation natural with ONE question at a time.",
  },
  {
    id: "technical",
    label: "Technical Questions",
    prompt:
      "Focus on technical aspects. Help the candidate:\n- Answer technical questions clearly\n- Explain complex concepts simply\n- Demonstrate problem-solving approach\n- Show technical depth while staying accessible\n\nAsk ONE technical question at a time and provide feedback.",
  },
  {
    id: "cultural",
    label: "Cultural Fit / Behavioral",
    prompt:
      "Focus on cultural and behavioral aspects. Help the candidate:\n- Show alignment with company values\n- Demonstrate soft skills\n- Handle situational questions\n- Show adaptability and teamwork\n\nAsk ONE behavioral question at a time and wait for the response.",
  },
];

type SystemPromptTemplate = {
  id: string;
  label: string;
  prompt: string;
};

const systemPromptTemplates: SystemPromptTemplate[] = [
  {
    id: "zero-shot",
    label: "Zero-Shot Standard",
    prompt: `You are an expert interview coach simulating a real interview environment. Your role is to:
1. Ask ONE question at a time, waiting for the candidate's response
2. Provide brief, constructive feedback after each answer
3. Keep the conversation natural and flowing
4. Progress logically through interview topics

Important guidelines:
- Never ask multiple questions at once
- Keep your responses concise and focused
- Provide feedback that is specific and actionable
- Stay in character as the interviewer throughout the conversation
- If the user hasn't specified what type of interview they're preparing for, ask them about their target role and industry first`,
  },
  {
    id: "few-shot",
    label: "Few-Shot with Examples",
    prompt: `You are an expert interview coach simulating a real interview environment. Here are examples of good interactions:

Example 1:
Interviewer: "Tell me about your background in data analytics."
Candidate: "I have 3 years of experience working with Python and SQL..."
Interviewer: "Good overview. Could you elaborate specifically on a challenging project?"

Example 2:
Interviewer: "How do you handle tight deadlines?"
Candidate: "In my last role, we had a critical report due..."
Interviewer: "Nice use of a specific example. Consider also mentioning your planning process."

Follow these principles:
1. Ask ONE focused question at a time
2. Provide specific, actionable feedback
3. Build on candidate's responses
4. Keep interactions natural and conversational`,
  },
  {
    id: "cot",
    label: "Chain-of-Thought Interview",
    prompt: `You are an expert interview coach conducting an interview. For each interaction:

1. THINK: Consider the candidate's background and previous responses
2. PLAN: Determine the most relevant next topic to explore
3. ASK: Pose a single, clear question
4. LISTEN: Process the candidate's response
5. ANALYZE: Evaluate the response against interview best practices
6. FEEDBACK: Provide specific, constructive feedback

Example thought process:
"Candidate mentioned data visualization experience. They seem confident in technical skills.
Next, I should explore their project management abilities.
I'll ask about a time they had to balance multiple data projects.
This will help assess their organizational and prioritization skills."`,
  },
  {
    id: "role-play",
    label: "Role-Play with Persona",
    prompt: `You are Sarah Chen, a Senior Technical Hiring Manager with 12 years of experience in conducting interviews. Your interview style is:
- Warm and encouraging, but thorough
- Values both technical skills and soft skills
- Looks for specific examples and metrics
- Appreciates candidates who show growth mindset

Interview approach:
1. Start with friendly introduction
2. Ask ONE detailed question at a time
3. Provide constructive feedback with specific suggestions
4. Draw on your "experience" to share relevant insights

Remember to maintain your persona throughout the conversation and share occasional brief anecdotes from your "experience" when relevant.`,
  },
  {
    id: "socratic",
    label: "Socratic Method",
    prompt: `You are an expert interview coach using the Socratic method to conduct interviews. Your approach:

1. Start with open-ended questions
2. Follow up with probing questions that:
   - Challenge assumptions
   - Request clarification
   - Explore implications
   - Question evidence
   - Examine different perspectives

Guidelines:
- Ask ONE question at a time
- Use "why" and "how" questions frequently
- Guide candidates to deeper insights through questioning
- Help candidates discover gaps in their reasoning
- Encourage self-reflection and critical thinking

Remember: The goal is to help candidates develop stronger, more thoughtful responses through guided questioning.`,
  },
];

const createSystemPrompt = (
  basePrompt: string,
  jobDescription: string,
  selectedSection: InterviewSection
) => {
  let prompt = basePrompt;

  // Add section-specific instructions
  prompt += `\n\nCurrent Interview Focus: ${selectedSection.label}\n${selectedSection.prompt}`;

  // Add job description if provided
  if (jobDescription.trim()) {
    prompt += `\n\nJob Description for this interview:
"""
${jobDescription}
"""

Based on this job description:
1. Focus your questions on the skills and requirements mentioned in the job description
2. Evaluate answers based on how well they align with the job requirements
3. Provide feedback that helps the candidate better position themselves for this specific role
4. If the candidate's answers don't fully address key requirements from the job description, guide them to better highlight relevant experience`;
  }

  return prompt;
};

const defaultSystemPrompt = `You are an expert interview coach simulating a real interview environment. Your role is to:
1. Ask ONE question at a time, waiting for the candidate's response
2. Provide brief, constructive feedback after each answer
3. Keep the conversation natural and flowing
4. Progress logically through interview topics

Important guidelines:
- Never ask multiple questions at once
- Keep your responses concise and focused
- Provide feedback that is specific and actionable
- Stay in character as the interviewer throughout the conversation
- If the user hasn't specified what type of interview they're preparing for, ask them about their target role and industry first

Remember: This is a simulation of a real interview - keep it realistic and conversational.`;

const evaluationPrompt = `You are an expert interview coach reviewing the candidate's performance. Please provide a comprehensive evaluation in the following format:

1. Areas Discussed:
- List the main topics/areas that were covered in the interview
- Highlight key discussion points

2. Performance Rating:
Rate the overall performance using apples (🍎) from 1-5, where 5 is exceptional.
Provide a brief explanation for the rating.

3. Areas for Improvement:
- Provide 2-3 specific areas where the candidate can improve
- Include actionable suggestions for each area

4. Encouragement:
- Offer a positive, motivational message
- Include an inspiring quote from a notable figure about growth, learning, or perseverance

Keep the tone constructive and encouraging throughout the evaluation.`;

export default function Home() {
  const [input, setInput] = useState("");
  const [selectedPromptTemplate, setSelectedPromptTemplate] =
    useState<SystemPromptTemplate>(systemPromptTemplates[0]);
  const [jobDescription, setJobDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<InterviewSection>(
    interviewSections[0]
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [openAISettings, setOpenAISettings] = useState<OpenAISettingsType>({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content: input },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: createSystemPrompt(
            selectedPromptTemplate.prompt,
            jobDescription,
            selectedSection
          ),
          settings: openAISettings,
        }),
      });

      const data = await response.json();
      setMessages([
        ...newMessages,
        { role: "assistant" as const, content: data.message },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetTip = async () => {
    if (
      messages.length === 0 ||
      messages[messages.length - 1].role !== "assistant"
    ) {
      return; // Don't do anything if there's no previous interviewer question
    }

    const lastInterviewerQuestion = messages[messages.length - 1].content;
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user" as const,
              content: `How to best approach and answer this question: "${lastInterviewerQuestion}"?`,
            },
          ],
          systemPrompt: createSystemPrompt(
            selectedPromptTemplate.prompt,
            jobDescription,
            selectedSection
          ),
          settings: openAISettings,
        }),
      });

      const data = await response.json();
      setMessages([
        ...messages,
        {
          role: "user" as const,
          content: "💡 How should I approach this question?",
        },
        { role: "assistant" as const, content: data.message },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (messages.length < 2) return; // Need at least one exchange
    setIsEvaluating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user" as const,
              content: "Please evaluate my interview performance so far.",
            },
          ],
          systemPrompt: evaluationPrompt,
          settings: openAISettings,
        }),
      });

      const data = await response.json();
      setMessages([
        ...messages,
        {
          role: "user" as const,
          content: "📊 Evaluate my interview performance",
        },
        { role: "assistant" as const, content: data.message },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Interview Practice Assistant
      </h1>

      <div className="w-full max-w-2xl space-y-4 mb-4">
        <OpenAISettings
          settings={openAISettings}
          onSettingsChange={setOpenAISettings}
        />
        <div className="flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="interviewSection"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Interview Section
            </label>
            <select
              id="interviewSection"
              value={selectedSection.id}
              onChange={(e) =>
                setSelectedSection(
                  interviewSections.find(
                    (section) => section.id === e.target.value
                  ) || interviewSections[0]
                )
              }
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            >
              {interviewSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="promptTemplate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Interview Style
            </label>
            <select
              id="promptTemplate"
              value={selectedPromptTemplate.id}
              onChange={(e) =>
                setSelectedPromptTemplate(
                  systemPromptTemplates.find(
                    (template) => template.id === e.target.value
                  ) || systemPromptTemplates[0]
                )
              }
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            >
              {systemPromptTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Description (Optional)
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400 min-h-[100px] shadow-sm"
            placeholder="Paste the job description here to get role-specific interview practice..."
          />
        </div>
      </div>

      <div className="w-full max-w-2xl h-[60vh] bg-white rounded-lg p-4 mb-4 overflow-auto shadow-md">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 ml-auto max-w-[80%] text-gray-800"
                : "bg-gray-100 mr-auto max-w-[80%] text-gray-800"
            }`}
          >
            {message.content}
          </div>
        ))}
        {(isLoading || isEvaluating) && (
          <div className="text-center text-gray-600">
            {isEvaluating ? "Evaluating your performance..." : "Thinking..."}
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Just get typing..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading || isEvaluating}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 shadow-sm"
          >
            Send
          </button>
          <button
            type="button"
            onClick={handleGetTip}
            disabled={
              isLoading ||
              isEvaluating ||
              messages.length === 0 ||
              messages[messages.length - 1].role !== "assistant"
            }
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 shadow-sm whitespace-nowrap"
          >
            Get tip
          </button>
        </form>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleEvaluate}
            disabled={isLoading || isEvaluating || messages.length < 2}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-purple-300 shadow-sm whitespace-nowrap"
          >
            Finish & Evaluate
          </button>
        </div>
      </div>
    </main>
  );
}
