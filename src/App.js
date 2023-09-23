import React, { useRef, useEffect, useState, useContext } from "react";
import Pointer from "./components/Pointer";
import BallsDisplay from "./components/BallsDisplay";
import CanvasBack from "./components/CanvasBack";
import { BallsContext } from "./contexts/BallsContext";
import { MLContext } from "./contexts/MLContext";
import ProgressBar from "./components/ProgressBar";

export default function App() {
  // data contexts
  const ballsContext = useContext(BallsContext);
  const mlContext = useContext(MLContext);
  // data contexts

  // interaction handles
  const [analyzeProcess, setAnalyzeProcess] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const analyzeInput = () => {
    if (ballsContext.balls.length !== 0) {
      setShowProgress(true);
      setAnalyzeProcess(true);
      mlContext.analyze(ballsContext.balls);
    }
  };
  useEffect(() => {
    if (mlContext.coefficients.length > 0) {
      setShowProgress(false);
    }
  }, [mlContext.coefficients]);
  // interaction handles

  // resizable adjustements for pointer window
  const refCanvasPointer = useRef(null);
  const [boundingCanvasPointer, setBoundingCanvasPointer] = useState(null);
  const [sizeCanvasPointer, setSizeCanvasPointer] = useState(0);
  const windowSize = useWindowSize();
  useEffect(() => {
    if (refCanvasPointer?.current?.clientHeight) {
      setSizeCanvasPointer(refCanvasPointer?.current?.clientHeight);
    }
    setBoundingCanvasPointer(refCanvasPointer.current.getBoundingClientRect());
  }, [windowSize]);
  // resizable adjustements for pointer window

  return (
    <div style={{ color: "white" }}>
      <div
        style={{
          position: "fixed",
          zIndex: "-1",
          width: "100vw",
          height: "100vh",
        }}
      >
        <CanvasBack
          windowSize={windowSize}
          boundingCanvasPointer={boundingCanvasPointer}
          analyzeProcess={analyzeProcess}
        />
      </div>
      <div
        style={{
          position: "fixed",
          zIndex: "-1",
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <div>
          <h1>Pattern Recognition</h1>
          <p>Probabilities:</p>
          <ul>
            {mlContext.names.map((value, index) => (
              <li key={index}>
                {value} - {mlContext.probabilities[index].toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div
            style={{
              height: "min(70vw, 70vh)",
              width: "min(70vw, 70vh)",
              border: "solid 1px white",
              borderRadius: "5rem",
            }}
            ref={refCanvasPointer}
          >
            {ballsContext.balls.length == 0 ? (
              <div
                style={{
                  position: "absolute",
                  height: "min(70vw, 70vh)",
                  width: "min(70vw, 70vh)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h1>Click here!</h1>
              </div>
            ) : null}
            <div style={{ position: "absolute" }}>
              <BallsDisplay
                width={sizeCanvasPointer}
                height={sizeCanvasPointer}
              />
            </div>
            <div style={{ position: "absolute" }}>
              <Pointer width={sizeCanvasPointer} height={sizeCanvasPointer} />
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <button
              onClick={() => {
                ballsContext.setBalls(ballsContext.balls.slice(0, -1));
              }}
            >
              undo
            </button>
            <button
              onClick={() => {
                ballsContext.setBalls([]);
                setAnalyzeProcess(false);
              }}
            >
              reset balls
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ padding: "1rem" }}>
              current count: {ballsContext.balls.length} /{" "}
              {ballsContext.BALLS_COUNT_MAX}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <button
              onClick={async () => {
                analyzeInput();
              }}
            >
              analyze
            </button>
            {showProgress ? <ProgressBar /> : <div>100%</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
