// import { openai } from './openai.client'

// export const aiService = {
//   async chat(message: string) {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [
//         {
//           role: 'system',
//           content:
//             'You are a helpful AI assistant for a freight logistics platform called FreightFlow.',
//         },
//         {
//           role: 'user',
//           content: message,
//         },
//       ],
//     })

//     return response.choices[0]?.message?.content || ''
//   },
// }


/// for Ollama
import axios from 'axios';

export const aiService = {
  async chat(message: string) {
    try {
      const response = await axios.post('http://127.0.0.1:11434/api/chat', {
        model: 'llama3',
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        stream: false,
      });

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama error:', error);

      return 'AI service temporarily unavailable.';
    }
  },
};