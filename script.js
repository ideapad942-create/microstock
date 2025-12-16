let apiKey = "";

function saveApiKey() {
  apiKey = document.getElementById("apiKeyInput").value.trim();
  const status = document.getElementById("apiStatus");

  // ✅ Validasi API key Groq
  if (apiKey.startsWith("sk_groq_")) {
    status.innerHTML = "✅ Groq API key siap digunakan";
    status.style.color = "green";
  } else {
    status.innerHTML = "❌ API key Groq tidak valid";
    status.style.color = "red";
  }
}

async function generateKeywords() {
  const title = document.getElementById("titleInput").value.trim();
  const output = document.getElementById("output");
  const status = document.getElementById("status");

  output.value = "";
  status.innerHTML = "";

  if (!apiKey || !title) {
    status.innerHTML = "⚠️ Masukkan judul dan simpan API key terlebih dahulu.";
    return;
  }

  status.innerHTML = "⏳ Menghubungi Groq AI...";

  const prompt = `
You are an Adobe Stock metadata assistant. Your task is to generate a list of 45 relevant, trending, and one-word keywords in English, based on the title below.

Return result as either:
1. A valid JSON object like:
{
  "title": "<repeat title here>",
  "keywords": ["keyword1", "keyword2", ..., "keyword45"]
}
OR
2. A plain list like: keyword1, keyword2, keyword3, ...

Rules:
- Use lowercase English
- One word only per keyword
- Based on top downloaded tags from Adobe Stock contributors
- No punctuation, numbers, or explanation
- Do not include the word "keywords" or anything else.

Title: ${title}
`;

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      }
    );

    const data = await res.json();
    console.log("Full response:", data);

    const raw = data?.choices?.[0]?.message?.content;

    if (!raw || raw.length < 10) throw new Error("Respons kosong atau sangat pendek.");

    let keywords = [];

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.keywords && Array.isArray(parsed.keywords)) {
        keywords = parsed.keywords;
      }
    } catch (e) {
      keywords = raw
        .replace(/[\n\r]/g, ",")
        .split(",")
        .map(k => k.trim().toLowerCase())
        .filter(k => /^[a-z]{3,}$/.test(k));
    }

    keywords = [...new Set(keywords)].slice(0, 45);

    if (keywords.length < 10) {
      throw new Error("Keyword terlalu sedikit.");
    }

    output.value = keywords.join(", ");
    status.innerHTML = "✅ Keyword berhasil dibuat";
    status.style.color = "green";
  } catch (err) {
    console.error("❌ ERROR:", err);
    status.innerHTML = "⚠️ Gagal menghasilkan keyword. Periksa API key Groq.";
    status.style.color = "red";
  }
}

// ✅ Fungsi copy (tetap)
function copyKeywords() {
  const output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
  alert("✅ Keyword berhasil dicopy!");
}

