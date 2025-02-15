import { useState } from "react";

export interface OpenAISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface OpenAISettingsProps {
  settings: OpenAISettings;
  onSettingsChange: (settings: OpenAISettings) => void;
}

const models = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview"];

export default function OpenAISettings({
  settings,
  onSettingsChange,
}: OpenAISettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (
    field: keyof OpenAISettings,
    value: string | number
  ) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="w-full bg-white rounded-lg p-4 mb-4 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left text-gray-800 font-medium"
      >
        <span>AI Model Settings</span>
        <span className="transform transition-transform duration-200">
          {isExpanded ? "▼" : "▶"}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={settings.model}
              onChange={(e) => handleChange("model", e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature: {settings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) =>
                handleChange("temperature", parseFloat(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>More Focused</span>
              <span>More Creative</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tokens: {settings.maxTokens}
            </label>
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              value={settings.maxTokens}
              onChange={(e) =>
                handleChange("maxTokens", parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top P: {settings.topP}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.topP}
              onChange={(e) => handleChange("topP", parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency Penalty: {settings.frequencyPenalty}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={settings.frequencyPenalty}
              onChange={(e) =>
                handleChange("frequencyPenalty", parseFloat(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Repetitive</span>
              <span>Varied</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presence Penalty: {settings.presencePenalty}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={settings.presencePenalty}
              onChange={(e) =>
                handleChange("presencePenalty", parseFloat(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Focused</span>
              <span>Exploratory</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
