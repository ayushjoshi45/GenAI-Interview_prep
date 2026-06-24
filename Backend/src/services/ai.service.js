const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")
const aiConfig = require("../config/ai.config")

/**
 * Helper to safely extract and parse JSON from a model response.
 * Handles both plain JSON strings and JSON wrapped inside Markdown code blocks.
 */
function extractAndParseJson(text) {
    const trimmed = text.trim();
    try {
        return JSON.parse(trimmed);
    } catch (e) {
        // Try to extract JSON from markdown code block if present (e.g. ```json ... ``` or ``` ... ```)
        const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1].trim());
            } catch (innerErr) {
                // continue to fallback error
            }
        }
        throw new Error("Response content could not be parsed as valid JSON.");
    }
}

/**
 * Sends a request to OpenRouter API, attempting fallback models in case of failure.
 * Includes automatic retries for rate limits (HTTP 429) and temporary errors.
 */
async function callOpenRouter(prompt, systemPrompt = "") {
    const apiKey = aiConfig.apiKey;
    if (!apiKey) {
        throw new Error("No API key configured for OpenRouter/Gemini. Please check your .env file.");
    }

    let lastError = null;

    for (const model of aiConfig.models) {
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`[AI Service] Attempting model "${model}" (Try ${attempt}/${maxAttempts})...`);
                
                const response = await fetch(aiConfig.request.baseUrl, {
                    method: "POST",
                    headers: {
                        ...aiConfig.request.headers,
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                            { role: "user", content: prompt }
                        ],
                        response_format: {
                            type: "json_object"
                        }
                    }),
                    signal: AbortSignal.timeout(aiConfig.request.timeoutMs)
                });

                // Handle Rate Limiting (429) specifically
                if (response.status === 429) {
                    let retryAfterSec = 3; // default fallback wait
                    try {
                        const cloneRes = response.clone();
                        const errBody = await cloneRes.json();
                        if (errBody?.error?.metadata?.retry_after_seconds) {
                            retryAfterSec = parseFloat(errBody.error.metadata.retry_after_seconds);
                        } else if (errBody?.error?.message && errBody.error.message.includes("retry shortly")) {
                            // Extract numbers if present in message
                            const match = errBody.error.message.match(/after (\d+) seconds/i) || errBody.error.message.match(/retry in (\d+)/i);
                            if (match) retryAfterSec = parseInt(match[1], 10);
                        }
                    } catch (e) {
                        // ignore body parse failure, stick to default
                    }
                    
                    // Cap retry time at 8 seconds so it doesn't wait indefinitely
                    retryAfterSec = Math.min(Math.max(retryAfterSec, 2), 8);
                    
                    console.warn(`[AI Service] Model "${model}" rate limited (429). Retrying after ${retryAfterSec}s...`);
                    await new Promise(resolve => setTimeout(resolve, retryAfterSec * 1000));
                    continue; // Retry this model
                }

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`HTTP error ${response.status}: ${errText}`);
                }

                const data = await response.json();
                if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
                    throw new Error("Invalid response envelope structure from OpenRouter.");
                }

                const rawContent = data.choices[0].message.content;
                if (!rawContent) {
                    throw new Error("Empty message content returned from the model.");
                }

                const parsed = extractAndParseJson(rawContent);
                console.log(`[AI Service] Success using model: ${model}`);
                return parsed;
            } catch (error) {
                console.warn(`[AI Service] Model "${model}" attempt ${attempt} failed:`, error.message);
                lastError = error;
                
                if (attempt < maxAttempts) {
                    // Sleep briefly before retrying same model
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
    }

    throw new Error(`All fallback models failed. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
}

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const reportSchemaJson = JSON.stringify(zodToJsonSchema(interviewReportSchema), null, 2);
    
    const systemPrompt = "You are an expert technical recruiter and interviewer. You must reply strictly with a JSON object that satisfies the user's requested schema structure.";
    
    const prompt = `Generate an interview report for a candidate with the following details.
You MUST output a valid JSON object matching the JSON Schema structure defined below. Do not include markdown code block notation if possible, but if you do, wrap it in a \`\`\`json code block.

JSON Schema structure:
${reportSchemaJson}

Candidate Details:
Resume / Experience:
${resume}

Self Description:
${selfDescription}

Target Job Description:
${jobDescription}
`;

    return await callOpenRouter(prompt, systemPrompt);
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const resumeSchemaJson = JSON.stringify(zodToJsonSchema(resumePdfSchema), null, 2);
    
    const systemPrompt = "You are a professional resume builder. You write and style ATS-friendly resumes in pure HTML. You must reply strictly with a JSON object that satisfies the user's requested schema structure.";

    const prompt = `Generate a resume for a candidate with the following details.
You MUST output a valid JSON object matching the JSON Schema structure defined below. The "html" field should contain the complete, standalone HTML code for the resume.

JSON Schema structure:
${resumeSchemaJson}

Candidate Details:
Resume / Experience:
${resume}

Self Description:
${selfDescription}

Target Job Description:
${jobDescription}

Formatting instructions:
1. The resume should be tailored for the given job description and highlight the candidate's strengths and relevant experience.
2. The content should feel authentic, professional, and written by a human.
3. The HTML design should be simple, clean, structured, and easy to read (standard A4 margins, clean fonts, clear section headings).
4. The resume should fit in 1-2 pages when printed to PDF.
5. Do not write any markdown wrappers outside the JSON structure.
`;

    const jsonContent = await callOpenRouter(prompt, systemPrompt);
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }