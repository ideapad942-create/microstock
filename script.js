let apiKey = "";

function saveApiKey() {
  apiKey = document.getElementById("apiKeyInput").value.trim();
  const status = document.getElementById("apiStatus");
  if (apiKey.startsWith("AIza")) {
    status.innerHTML = "✅ API key siap digunakan";
    status.style.color = "green";
  } else {
    status.innerHTML = "❌ API key tidak valid";
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

  status.innerHTML = "⏳ Menghubungi Gemini API...";

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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await res.json();
    console.log("Full response:", data);

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw || raw.length < 10) throw new Error("Respons kosong atau sangat pendek.");

    let keywords = [];

    try {
      // Coba parse sebagai JSON
      const parsed = JSON.parse(raw);
      if (parsed?.keywords && Array.isArray(parsed.keywords)) {
        keywords = parsed.keywords;
      }
    } catch (e) {
      // Fallback: ekstrak dari teks biasa
      keywords = raw
        .replace(/[\n\r]/g, ",")
        .split(",")
        .map(k => k.trim().toLowerCase())
        .filter(k => /^[a-z]{3,}$/.test(k));
    }

    // Final filter dan batas 45
    keywords = [...new Set(keywords)].slice(0, 45);

    if (keywords.length < 10) {
      throw new Error("Keyword terlalu sedikit.");
    }

    output.value = keywords.join(", ");
    status.innerHTML = "✅ Keyword berhasil dibuat";
    status.style.color = "green";
  } catch (err) {
    console.error("❌ ERROR:", err);
    status.innerHTML = "⚠️ Gagal menghasilkan keyword. Periksa API key atau format judul.";
    status.style.color = "red";
  }
}

// ✅ Tambahan fungsi copy yang diperbaiki
function copyKeywords() {
  const output = document.getElementById("output");
  output.select(); // WAJIB untuk memilih isi textarea
  document.execCommand("copy");
  alert("✅ Keyword berhasil dicopy!");
}
