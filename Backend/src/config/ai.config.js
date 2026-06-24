const aiConfig = {
    get apiKey() {
        return process.env.OPENROUTER_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "";
    },

    models: [
        "nvidia/llama-nemotron-rerank-vl-1b-v2:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "meta-llama/llama-3-8b-instruct:free",
        "deepseek/deepseek-r1:free",
        "openrouter/free"
    ],

    request: {
        baseUrl: "https://openrouter.ai/api/v1/chat/completions",
        headers: {
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/ayushjoshi45/GenAI-Interview_prep",
            "X-Title": "GenAI Interview Prep"
        },
        timeoutMs: 45000
    }
};

module.exports = aiConfig;