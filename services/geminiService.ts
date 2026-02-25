
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Generates a creative and engaging homework assignment idea for a specific subject and grade.
 * Uses gemini-3-pro-preview for complex reasoning and structured JSON output.
 */
export const generateAssignmentIdea = async (subject: string, grade: string): Promise<string> => {
  try {
    // Following guidelines: initialize GoogleGenAI inside the function to use the latest API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-pro-preview for complex text generation tasks requiring reasoning.
    const model = 'gemini-3-pro-preview';
    const prompt = `Create a creative and engaging homework assignment idea for ${grade} students about ${subject}.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The creative title of the homework assignment',
            },
            description: {
              type: Type.STRING,
              description: 'The detailed description of the homework assignment',
            },
          },
          // Following guidelines: propertyOrdering is used within the object schema.
          propertyOrdering: ["title", "description"],
        },
        // Adding thinkingConfig for gemini-3-pro-preview to enhance reasoning quality for assignments.
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });

    // Directly access .text property from GenerateContentResponse and trim potential extra whitespace.
    return response.text?.trim() || '';
  } catch (error) {
    console.error("Error generating assignment idea:", error);
    return JSON.stringify({
      title: `Error generating for ${subject}`,
      description: "Please try again or check your API key."
    });
  }
};

/**
 * Generates a short educational summary for a topic.
 * Uses gemini-3-flash-preview for efficient text summarization.
 */
export const generateResourceContent = async (topic: string, type: string): Promise<string> => {
  try {
    // Following guidelines: initialize GoogleGenAI inside the function.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for basic text summarization tasks.
    const model = 'gemini-3-flash-preview';
    const prompt = `Create a short educational summary suitable for a ${type} resource about "${topic}". 
    Keep it under 100 words.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Directly access .text property.
    return response.text || "Content generation failed.";
  } catch (error) {
    console.error("Error generating resource:", error);
    return "Could not generate content at this time.";
  }
};

/**
 * Explains educational concepts simply for students.
 * Uses gemini-3-flash-preview for helpful tutoring.
 */
export const askTutor = async (question: string, grade: string): Promise<string> => {
  try {
    // Following guidelines: initialize GoogleGenAI inside the function.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for helpful tutoring interactions.
    const model = 'gemini-3-flash-preview';
    const prompt = `You are a helpful tutor for ${grade} students. Explain the following concept simply and clearly: "${question}"`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Directly access .text property.
    return response.text || "I couldn't think of an answer right now.";
  } catch (error) {
    console.error("Error asking tutor:", error);
    return "Sorry, I'm having trouble connecting to the brain right now.";
  }
};
