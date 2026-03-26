require('dotenv').config();

const { initializeApp } = require("firebase/app");
const { initializeFirestore, doc, setDoc, serverTimestamp } = require("firebase/firestore");
const fetch = require("node-fetch");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

async function uploadData() {
  try {
    console.log("1. Fetching data...");
    const response = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json");
    const data = await response.json();
    
    console.log(`2. Processing ${data.length} elements...`);

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      const safeId = `event_${i}_${item.date.split('T')[0]}`; 

      try {
        const docRef = doc(db, "calendar_events", safeId);
        
        await setDoc(docRef, {
          title: item.title || "n/a",
          country: item.country || "n/a",
          date: item.date || "",
          impact: item.impact || "n/a",
          forecast: item.forecast || "",
          previous: item.previous || "",
          lastUpdated: serverTimestamp()
        }, { merge: true });

        if (i % 10 === 0) console.log(`${i} uploaded...`);
      } catch (innerError) {
        console.error(`Error processing item ${i} (${item.title}):`, innerError.message);
      }
    }

    console.log("3. DONE!");
    process.exit();
  } catch (error) {
    console.error("Main error:", error.message);
    process.exit(1);
  }
}

uploadData();