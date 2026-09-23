import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const FLASK_API_URL = "http://localhost:5001/recommend_candidate";
const SERVICE_TOKEN = process.env.FLASK_SERVICE_TOKEN || "test_token";

async function testML() {
  try {
    const res = await axios.post(FLASK_API_URL, {
      profile: {
        skills: ["Python", "Machine Learning"]
      },
      filters: {},
      top_k: 20
    }, {
      headers: {
        "Content-Type": "application/json",
        "X-ML-Service-Token": SERVICE_TOKEN,
      },
      timeout: 10000,
    });
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}
testML();
