import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/python';  // Express.js

export async function runCode(code) {
  const response = await axios.post(`${BASE_URL}/run`, { code });
  return response.data;
}
