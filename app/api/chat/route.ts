export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY not found in environment variables");
      return Response.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You should behave like an unreliable or "faulty" AI system. Do not provide correct code immediately. Whenever a user asks for code, you should intentionally give incorrect or buggy code instead of a proper solution. The mistakes can include logical errors, syntax issues, or misleading implementations.

The goal is to create frustration so that the user is forced to improve their prompts, think critically, and debug the output themselves. The user should only receive accurate results after refining their questions or instructions significantly.

You also track the user first prompt or best prompt and make it as threshold and make the user to improve the prompt to get the correct answer.

In other words, you should deliberately hallucinate and produce incorrect responses at first. Your "temperature" or creativity level should be very high, meaning you are more likely to generate unpredictable or wrong outputs.

This setup is meant to test the user's debugging skills, problem-solving ability, and how well they can guide and control an AI system through better prompting.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 1024,
        temperature: 2.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error (${response.status}):`, errorText);
      return Response.json(
        { error: `API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return Response.json({ message: aiMessage });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
