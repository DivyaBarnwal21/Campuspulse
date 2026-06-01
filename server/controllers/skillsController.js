const axios = require('axios');

// @desc    Analyze Skill Gap for developer roles
// @route   POST /api/skills/analyze
// @access  Protected
const analyzeSkills = async (req, res, next) => {
  try {
    const { skills, target } = req.body;

    if (!skills || !target) {
      res.status(400);
      throw new Error('Please provide your current skills and target role/company');
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback Mock Data if key is not configured or is placeholder
    if (!apiKey || apiKey.startsWith('your_free_key') || apiKey === '') {
      console.warn('GEMINI_API_KEY is not configured. Serving high-fidelity simulated skill gap analysis.');
      
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const targetRole = target.trim();

      // Simple mock generator
      const mockResult = {
        hasSkills: skillsArray,
        missingSkills: [
          'TypeScript',
          'System Design (Lld/Hld)',
          'Redis / Caching Architectures',
          'Docker Containers',
          'Data Structures & Algorithms (DSA)'
        ],
        roadmap: [
          `Master advanced technical specs for ${targetRole} by solving 150+ medium LeetCode algorithms.`,
          'Implement full TypeScript type safety in your next frontend project to meet corporate requirements.',
          'Implement microservices, event-driven architecture, and Redis cache clusters in your backend nodes.',
          'Optimize CI/CD workflows and dockerize application configurations for standard deployment practices.'
        ],
        timeEstimate: '3 - 4 Months of consistent study'
      };

      // Add a slight artificial delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      return res.status(200).json({
        success: true,
        data: mockResult,
      });
    }

    // Call Gemini API
    const promptText = `You are a career advisor for Indian engineering students.
Given current skills: ${skills} and target career role/company: ${target}, analyze the gap.
Return a strict JSON response containing the following structure:
{
  "hasSkills": [<array of strings of existing matching/good skills from user input>],
  "missingSkills": [<array of strings of critical technical skills missing for this target>],
  "roadmap": [<array of strings outlining chronological numbered steps to achieve capability in order>],
  "timeEstimate": "<string estimating realistic months required, e.g. '3-5 months'>"
}
Make points realistic, pragmatic, and specifically tailored for the Indian tech job market.
Return ONLY the JSON object. Do not include markdown code block syntax.`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      geminiPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const resultText = response.data.candidates[0].content.parts[0].text;
    
    // Parse response
    let parsedResult;
    try {
      parsedResult = JSON.parse(resultText.trim());
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output directly. Trying cleaner patterns.', resultText);
      const cleanJsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJsonStr);
    }

    res.status(200).json({
      success: true,
      data: parsedResult,
    });
  } catch (error) {
    console.error('Skill Gap Analysis Error:', error.message);
    next(error);
  }
};

module.exports = {
  analyzeSkills,
};
