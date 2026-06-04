const axios = require('axios');

// @desc    Get GitHub Repositories for a user
// @route   GET /api/dashboard/github
// @access  Protected
const getGithubRepos = async (req, res, next) => {
  try {
    const { username } = req.query;

    if (!username) {
      res.status(400);
      throw new Error('GitHub username is required');
    }

    try {
      // GitHub requires a User-Agent header, otherwise it returns 403
      const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
        headers: {
          'User-Agent': 'DevPulse-Dashboard-App',
        },
        params: {
          sort: 'updated',
          per_page: 8,
        },
      });

      const repos = response.data.map((repo) => ({
        name: repo.name,
        stars: repo.stargazers_count,
        language: repo.language || 'HTML/CSS/JS',
        description: repo.description || 'No description provided.',
        url: repo.html_url,
      }));

      res.status(200).json({
        success: true,
        data: repos,
      });
    } catch (apiError) {
      // Handle 404 user not found separately
      if (apiError.response && apiError.response.status === 404) {
        res.status(404);
        return next(new Error('GitHub user not found'));
      }
      
      console.warn(`GitHub API request failed for user ${username}: ${apiError.message}. Serving high-fidelity mock repository list.`);
      
      // Serve mock repository data if rate-limited or API fails
      const mockRepos = [
        {
          name: `${username}-portfolio`,
          stars: 12,
          language: 'React',
          description: `Personal portfolio website demonstrating frontend skills, hosted live.`,
          url: `https://github.com/${username}/${username}-portfolio`,
        },
        {
          name: 'react-dashboard-template',
          stars: 48,
          language: 'TypeScript',
          description: 'A premium dashboard UI layout constructed with React, Vite and CSS variables.',
          url: `https://github.com/${username}/react-dashboard-template`,
        },
        {
          name: 'node-api-boilerplate',
          stars: 29,
          language: 'JavaScript',
          description: 'Clean architecture Express API starter template with JWT authentication and MongoDB integration.',
          url: `https://github.com/${username}/node-api-boilerplate`,
        },
        {
          name: 'data-structures-playground',
          stars: 15,
          language: 'Python',
          description: 'Solutions to common coding interview patterns, algorithms, and complex data structures.',
          url: `https://github.com/${username}/data-structures-playground`,
        },
        {
          name: 'aws-deploy-scripts',
          stars: 7,
          language: 'Shell',
          description: 'Automation scripts for provisioning EC2 instances and setting up reverse-proxies.',
          url: `https://github.com/${username}/aws-deploy-scripts`,
        }
      ];

      res.status(200).json({
        success: true,
        data: mockRepos,
        isMock: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Weather details for a city
// @route   GET /api/dashboard/weather
// @access  Protected
const getWeather = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      res.status(400);
      throw new Error('City is required');
    }

    const apiKey = process.env.WEATHER_API_KEY;

    // Fallback Mock Data if key is not configured or is placeholder
    if (!apiKey || apiKey.startsWith('get') || apiKey === '') {
      console.warn('WEATHER_API_KEY is not configured. Serving high-fidelity mock weather data.');
      // Return a realistic mock response depending on city entered
      const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
      const isRainy = ['london', 'seattle', 'vancouver', 'mumbai'].includes(city.toLowerCase());
      const isHot = ['dubai', 'cairo', 'delhi', 'miami'].includes(city.toLowerCase());
      
      let temp = 22;
      let desc = 'Partly Cloudy';
      let icon = '03d';
      let humidity = 60;

      if (isRainy) {
        temp = 14;
        desc = 'Moderate Rain';
        icon = '09d';
        humidity = 88;
      } else if (isHot) {
        temp = 36;
        desc = 'Clear Sky';
        icon = '01d';
        humidity = 35;
      }

      return res.status(200).json({
        success: true,
        data: {
          temperature: temp,
          description: desc,
          humidity: humidity,
          icon: icon,
          city: formattedCity,
          isMock: true,
        },
      });
    }

    // Call OpenWeatherMap API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          units: 'metric',
          appid: apiKey,
        },
      }
    );

    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      icon: response.data.weather[0].icon,
      city: response.data.name,
    };

    res.status(200).json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404);
      return next(new Error('City not found'));
    }
    next(error);
  }
};

// @desc    Get Tech News
// @route   GET /api/dashboard/news
// @access  Protected
const getNews = async (req, res, next) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    // Fallback Mock Data if key is not configured or is placeholder
    if (!apiKey || apiKey.startsWith('get') || apiKey === '') {
      console.warn('NEWS_API_KEY is not configured. Serving high-fidelity mock news.');
      const mockNews = [
        {
          title: 'Google I/O 2026: Revealing Next-Gen Multi-Agent Systems and Breakthrough AI Architectures',
          url: 'https://google.com',
          source: 'TechCrunch',
        },
        {
          title: 'React 19 goes GA: Compiler is fully integrated with automatic memoization by default',
          url: 'https://react.dev',
          source: 'The Verge',
        },
        {
          title: 'WebAssembly in 2026: Heavyweight client-side compute shifts entirely to standard browsers',
          url: 'https://webassembly.org',
          source: 'Ars Technica',
        },
        {
          title: 'Vite 7.0 Released: Featuring Lightning-Fast Dev Bundling with Rust-Based Rolldown',
          url: 'https://vite.dev',
          source: 'Hacker News',
        },
        {
          title: 'MongoDB Launches Real-time Graph Databases for AI Knowledge Graphs integration',
          url: 'https://mongodb.com',
          source: 'InfoQ',
        },
      ];

      return res.status(200).json({
        success: true,
        data: mockNews,
        isMock: true,
      });
    }

    // Call NewsAPI
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        category: 'technology',
        language: 'en',
        pageSize: 5,
        apiKey: apiKey,
      },
      headers: {
        'User-Agent': 'DevPulse-Dashboard-App',
      },
    });

    const articles = response.data.articles.map((article) => ({
      title: article.title,
      url: article.url,
      source: article.source.name || 'Tech News',
    }));

    res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGithubRepos,
  getWeather,
  getNews,
};
