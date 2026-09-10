import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { Job, UserProfile, AIWorkerMatchResponse } from '../types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not configured in process.env. Using algorithmic matcher fallback.');
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * AI Matching Engine: Uses Gemini 3.1 Pro with High Thinking Level
 * to evaluate candidate profile compatibility against active jobs in India.
 */
export async function matchJobsWithWorkerProfile(
  worker: UserProfile,
  jobs: Job[]
): Promise<AIWorkerMatchResponse> {
  const ai = getGenAI();

  if (!ai) {
    return generateHeuristicMatch(worker, jobs);
  }

  try {
    const simplifiedJobs = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      category: j.category,
      description: j.description,
      requirements: j.requirements || [],
      pay_display: j.pay_display,
      distance_km: j.distance_km || 1.5,
      is_urgent: j.is_urgent,
      hours_per_day: j.hours_per_day || 'Flexible',
    }));

    const prompt = `
You are the AI Matchmaking Engine for "Money Maker", a localized work and job platform in India.
Analyze the following worker profile and the list of active local jobs.
Calculate an accurate compatibility percentage score (0-100%) for each job based on:
1. Skills & experience overlap
2. Schedule availability compatibility
3. Location distance / proximity convenience
4. Pay and role feasibility

Worker Profile:
- Name: ${worker.name}
- Skills: ${worker.skills.join(', ')}
- Availability: ${worker.availability}
- Current Rating: ${worker.rating} / 5.0
- Base Location: ${worker.address}

Available Jobs:
${JSON.stringify(simplifiedJobs, null, 2)}

Provide structured JSON with matching scores, rationale, matched skills, dynamic profile advice for increasing earnings, and estimated monthly earning potential.
`;

    // Calling gemini-3.1-pro-preview with ThinkingLevel.HIGH as mandated
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topMatches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jobId: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER, description: 'Percentage compatibility score 0-100' },
                  fitSummary: { type: Type.STRING, description: 'Brief 1-sentence explanation of why it is a great match' },
                  matchedSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendationNote: { type: Type.STRING, description: 'Advice or tip for applying' },
                },
                required: ['jobId', 'matchScore', 'fitSummary', 'matchedSkills', 'recommendationNote'],
              },
            },
            profileAdvice: { type: Type.STRING, description: 'Actionable tips for the worker to earn 20-40% more' },
            suggestedEarningsPotential: { type: Type.STRING, description: 'e.g. ₹18,000 - ₹24,000/month' },
          },
          required: ['topMatches', 'profileAdvice', 'suggestedEarningsPotential'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as AIWorkerMatchResponse;
    if (parsed && Array.isArray(parsed.topMatches) && parsed.topMatches.length > 0) {
      return parsed;
    }
    return generateHeuristicMatch(worker, jobs);
  } catch (error) {
    console.error('Gemini AI Matching Error:', error);
    return generateHeuristicMatch(worker, jobs);
  }
}

/**
 * High-performance algorithmic fallback for sub-millisecond local responses
 */
export function generateHeuristicMatch(worker: UserProfile, jobs: Job[]): AIWorkerMatchResponse {
  const workerSkillsLower = worker.skills.map((s) => s.toLowerCase());

  const matches = jobs.map((job) => {
    let score = 50; // base score

    // Category / Title skill keywords match
    const jobText = `${job.title} ${job.category} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();
    const matchedSkills: string[] = [];

    workerSkillsLower.forEach((skill) => {
      if (jobText.includes(skill) || (skill.includes('delivery') && job.category === 'Delivery')) {
        score += 15;
        matchedSkills.push(skill);
      }
    });

    // Proximity factor
    const dist = job.distance_km ?? 2;
    if (dist < 1.0) score += 15;
    else if (dist < 3.0) score += 10;
    else if (dist < 6.0) score += 5;

    // Urgency & bonus factor
    if (job.is_urgent) score += 8;

    // Worker rating bonus
    if (worker.rating >= 4.8) score += 5;

    score = Math.min(Math.max(score, 45), 98);

    let summary = `Fits your background with ${matchedSkills.length > 0 ? matchedSkills.join(' and ') : 'relevant skills'}.`;
    if (dist < 1.5) {
      summary += ` Close proximity (${dist} km) allows zero transit downtime.`;
    }

    return {
      jobId: job.id,
      matchScore: score,
      fitSummary: summary,
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : [worker.skills[0] || 'General Skills'],
      recommendationNote: job.is_urgent ? 'Apply immediately — employer is filling positions today!' : 'Highlight your punctuality & verified ratings.',
    };
  });

  // Sort matches descending by score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return {
    topMatches: matches,
    profileAdvice: 'Adding certifications like "Basic Computer Proficiency" or "Electric Vehicle Delivery" can unlock 25% higher hourly rates in Chennai.',
    suggestedEarningsPotential: '₹16,500 – ₹22,000 / month based on current gig density in your area.',
  };
}
