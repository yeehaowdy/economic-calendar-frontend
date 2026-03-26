require('dotenv').config();
const { initializeApp } = require("firebase/app");
const { initializeFirestore, doc, setDoc, getDoc, serverTimestamp } = require("firebase/firestore");
const fetch = require("node-fetch");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

const API_KEY = process.env.NEWS_API_KEY;

const topSources = 'reuters,the-wall-street-journal,bloomberg,financial-times,cnbc,business-insider,the-economist';

const economicQuery = '(economy OR finance OR "stock market" OR inflation OR GDP OR "central bank" OR FED OR "interest rate")';

const createUniqueId = (title) => {
  if (!title) return Math.random().toString(36).substring(7);
  return title.toLowerCase().trim().replace(/[^a-z0-9]/g, '').substring(0, 60);
};

async function fetchAndUploadFilteredNews() {
  try {
    console.log("Fetching high-impact economic news from global sources...");

    const url = `https://newsapi.org/v2/everything?sources=${topSources}&q=${encodeURIComponent(economicQuery)}&sortBy=publishedAt&pageSize=40&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API Error: ${errorData.message}`);
      return;
    }

    const result = await response.json();
    const articles = result.articles;

    console.log(`Analyzing ${articles.length} potential economic articles...`);

    for (const item of articles) {
      if (!item.title || item.title === "[Removed]") continue;

      const semanticId = createUniqueId(item.title);
      const docId = `econ_premium_${semanticId}`;
      const docRef = doc(db, "economic_news", docId);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(`Skipping: Already exists.`);
        continue;
      }

      const content = (item.title + " " + (item.description || "")).toUpperCase();
      let currencyTag = "Global";
      if (content.includes("FED") || content.includes("USD") || content.includes("WALL STREET")) currencyTag = "USD";
      else if (content.includes("ECB") || content.includes("EUR") || content.includes("EUROZONE")) currencyTag = "EUR";
      else if (content.includes("BOE") || content.includes("GBP") || content.includes("POUND")) currencyTag = "GBP";

      try {
        await setDoc(docRef, {
          title: item.title,
          description: item.description || "",
          link: item.url,
          image: item.urlToImage || null,
          source: item.source.name,
          pubDate: item.publishedAt,
          relatedCurrency: currencyTag,
          type: "ECONOMIC_NEWS",
          lastUpdated: serverTimestamp()
        });
        console.log(`Saved [${item.source.name}]: ${item.title.substring(0, 35)}...`);
      } catch (e) {
        console.error(`Save error: ${e.message}`);
      }
    }

    console.log("Sync finished. Database updated with high-tier economic news.");
    process.exit(0);
  } catch (error) {
    console.error("Critical error:", error.message);
    process.exit(1);
  }
}

fetchAndUploadFilteredNews();