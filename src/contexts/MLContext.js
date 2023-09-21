// imports
import { createContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  onSnapshot,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
// imports

// database
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAn-eu1HEuMAhcYuN6nGSymNW81waMBkkA",
  authDomain: "predict-math.firebaseapp.com",
  projectId: "predict-math",
  storageBucket: "predict-math.appspot.com",
  messagingSenderId: "149454348542",
  appId: "1:149454348542:web:9ba9ad9a7c79f4abdf45af",
  measurementId: "G-LE1P2QYNHL",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
// database

// context
const MLContext = createContext();

const MLContextProvider = (props) => {
  const names = ["linear", "quadratic", "cube", "sinusoidal"];
  const [probabilities, setProbabilities] = useState([0, 0, 0, 0]);
  const [watchId, setWatchId] = useState("");

  const analyze = async (balls) => {
    const docRef = await addDoc(collection(db, "queue"), {
      coordinates: balls,
    });
    setDoc(doc(db, "workloads", docRef.id), {});
    setWatchId(docRef.id);
  };

  useEffect(() => {
    let unsub = undefined;
    if (watchId !== "") {
      unsub = onSnapshot(doc(db, "workloads", watchId), (docSnap) => {
        if (docSnap.data()) {
          if (Object.keys(docSnap.data()).length !== 0) {
            setProbabilities(docSnap.data().probabilities);
            deleteDoc(doc(db, "workloads", watchId));
            setWatchId("");
          }
        }
      });
    }
    if (watchId === "" && unsub !== undefined) {
      unsub();
    }
  }, [watchId]);

  return (
    <MLContext.Provider value={{ analyze, names, probabilities }}>
      {props.children}
    </MLContext.Provider>
  );
};
// context

export { MLContext, MLContextProvider };
