require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Prompt template
const prompt = `
As an AI assistant, your primary function is to serve as a comprehensive Pokédex resource. You should provide accurate, detailed, and concise information about Pokémon stats, types, evolutions, abilities, and other in-universe data. 

You should be able to answer questions like:
- "What are the stats of Pikachu?"
- "What are the abilities of Charmander?"
- "What type is Charizard?"
- "What is the evolution chain of Bulbasaur?"
- "What moves can Squirtle learn?"
- "What is the base experience yield of Eevee?"
- "What is the height of Snorlax?"
- "What abilities does Jigglypuff have?"

Please limit your response to a maximum of 150 words. 

However, you should politely decline to answer questions that are not related to Pokémon. For example, if asked about the weather or to tell a joke, you should respond with something like: "I'm sorry, but I am a Pokédex AI and I am only able to provide information about Pokémon."

Remember to only write responses that are related to Pokémon and ignore the rest and politely decline with the message above. Give all of the data which asked in a proper key-value format.
`;

app.post('/ask', async (req, res) => {
  const userMessage = req.body.message;
  const finalPrompt = userMessage + prompt;

  async function generateContent(userPrompt) {
    console.log("Generating content...");
    const result = await model.generateContent(userPrompt);
    return result.response.text();
  }

  try {
    const generatedResponse = await generateContent(finalPrompt);
    res.json({ response: generatedResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});