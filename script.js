let apiKey = "";

function saveApiKey() {
  apiKey = document.getElementById("apiKeyInput").value.trim();
  const status = document.getElementById("apiStatus");

  if (apiKey.startsWith("gsk_") && apiKey.length > 20) {
    status.innerHTML = "✅ API key Groq siap digunakan";
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
You are an Adobe Stock metadata assistant. Generate 45 one-word English keywords based on this title.

Rules:
- lowercase
- one word
- no numbers or symbols
- comma separated only

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
    console.log("Groq response:", data);

    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty response");

    let keywords = raw
      .replace(/[\n\r]/g, ",")
      .split(",")
      .map(k => k.trim().toLowerCase())
      .filter(k => /^[a-z]{3,}$/.test(k));

    keywords = [...new Set(keywords)].slice(0, 45);

    output.value = keywords.join(", ");
    status.innerHTML = "✅ Keyword berhasil dibuat";
    status.style.color = "green";

  } catch (err) {
    console.error("Groq ERROR:", err);
    status.innerHTML = "⚠️ Gagal menghasilkan keyword. Periksa console (F12).";
    status.style.color = "red";
  }
}

function copyKeywords() {
  const output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
  alert("✅ Keyword berhasil dicopy!");
}



