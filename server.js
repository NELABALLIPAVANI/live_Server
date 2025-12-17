// require("dotenv").config({ debug: true });

// const express = require("express");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Backend is running 🚀");
// });

// app.post("/ask", async (req, res) => {
//   console.log("STEP 1: /ask hit");
//   console.log("BODY:", req.body);
//   console.log("API KEY:", !!process.env.GEMINI_API_KEY);

//   try {
//     const { question } = req.body;
//     if (!question) return res.status(400).json({ error: "Question required" });

//     console.log("Calling Gemini...");

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
// text: `Explain the following clearly in plain text:\n\n${question}`
//                 },
//               ],
//             },
//           ],
//         }),
//       }
//     );

//     console.log("Gemini responded");

//     const data = await response.json();
//     console.log("Gemini JSON:", data);

//     return res.json({
//       answer:
//         data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//         "No response from AI",
//     });
//   } catch (err) {
//     console.error("ERROR:", err);
//     return res.status(500).json({ error: "AI error" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

require("dotenv").config({ debug: true });

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Helper function to clean AI markdown
function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/#+\s?/g, "") // remove ##, ###
    .replace(/\*\*/g, "") // remove **
    .replace(/\*/g, "") // remove *
    .replace(/---/g, "") // remove ---
    .replace(/`/g, "") // remove code ticks
    .replace(/\n+/g, " ") // make single paragraph
    .trim();
}

app.post("/ask", async (req, res) => {
  console.log("STEP 1: /ask hit");
  console.log("BODY:", req.body);
  console.log("API KEY:", !!process.env.GEMINI_API_KEY);

  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    console.log("Calling Gemini...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Answer in 3–4 simple sentences, in plain text only, without examples or lists:\n\n${question}`,
                },
              ],
            },
          ],
        }),
      }
    );

    console.log("Gemini responded");

    const data = await response.json();
    console.log("Gemini JSON received");

    // ✅ CLEAN RESPONSE HERE
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleanAnswer = cleanText(rawText).slice(0, 800);

    return res.json({ answer: cleanAnswer });
  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: "AI error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
