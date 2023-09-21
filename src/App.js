import React, { useRef, useEffect, useState, useContext } from "react";
import Pointer from "./components/Pointer";
import BallsDisplay from "./components/BallsDisplay";
import { BallsContext } from "./contexts/BallsContext";
import { MLContext } from "./contexts/MLContext";

const CanvasBack = (props) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    //Our first draw
    ctx.fillStyle = "#101520";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, []);

  return <canvas ref={canvasRef} {...props} />;
};

export default function App() {
  const ballsContext = useContext(BallsContext);
  const mlContext = useContext(MLContext);

  return (
    <div style={{ color: "white" }}>
      {/* background canvas */}
      <div style={{ position: "fixed", zIndex: "-1" }}>
        <CanvasBack
          style={{
            width: "100vw",
            height: "100vh",
          }}
        />
      </div>
      {/* foreground interaction + canvas */}
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
          <ul>
            {mlContext.names.map((value, index) => (
              <li key={index}>
                {value} - {mlContext.probabilities[index].toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          {/* <CanvasFront/> */}
          <CanvasWrapper />
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
                mlContext.analyze(ballsContext.balls);
              }}
            >
              analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasWrapper() {
  const elRef = useRef(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const size = useWindowSize();

  useEffect(() => {
    if (elRef?.current?.clientWidth) {
      setWidth(elRef?.current?.clientWidth);
    }
  }, [elRef?.current?.clientWidth, size]);

  useEffect(() => {
    if (elRef?.current?.clientHeight) {
      setHeight(elRef?.current?.clientHeight);
    }
  }, [elRef?.current?.clientHeight, size]);

  return (
    <div
      style={{
        height: "min(70vw, 70vh)",
        width: "min(70vw, 70vh)",
        border: "solid 1px white",
        borderRadius: "5rem",
      }}
      ref={elRef}
    >
      <div style={{ position: "absolute" }}>
        <BallsDisplay width={width} height={height} />
      </div>
      <div style={{ position: "absolute" }}>
        <Pointer width={width} height={height} />
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
