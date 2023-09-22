import React, { useRef, useEffect, useState, useContext } from "react";
import Pointer from "./components/Pointer";
import BallsDisplay from "./components/BallsDisplay";
import { BallsContext } from "./contexts/BallsContext";
import { MLContext } from "./contexts/MLContext";

const CanvasBack = (props) => {
  const canvasRef = useRef(null);
  const mlContext = useContext(MLContext);
  const windowWidth = useWindowSize();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    //Our first draw
    ctx.fillStyle = "#101520";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Drawing function in browser
    // scales (graph scale - accordance with pointer) (html scale number of pixels)
    //
    // - x values - spread equally (html) + convert to (graph)
    // - y values - (graph) values + convert to (html) scale
    //
    // Sequence:
    // generate x HTML points -> x GRAPH -> y GRAPH -> y HTML
    if (props.windowSize && props.boundingCanvasPointer) {
      const POINTS = 100;
      const x_axis_html = [];
      const html_step = props.windowSize.width / (POINTS + 2);
      for (let i = 1; i < POINTS + 1; i++) {
        x_axis_html.push(i * html_step);
      }
      const x_axis_graph = [];
      const SCALE_HTML_TO_GRAPH_X = (x) => {
        x = x - props.boundingCanvasPointer.x;
        x = x / props.boundingCanvasPointer.width;
        return x;
      };
      x_axis_html.map((x) => {
        x_axis_graph.push(SCALE_HTML_TO_GRAPH_X(x));
      });
      let transform;
      if (mlContext.name == "linear") {
        transform = (x) => {
          return mlContext.coefficients[0] + mlContext.coefficients[1] * x;
        };
      }
      if (mlContext.name == "quadratic") {
        transform = (x) => {
          return (
            mlContext.coefficients[0] +
            mlContext.coefficients[1] * x +
            mlContext.coefficients[2] * x * x
          );
        };
      }
      if (mlContext.name == "cubic") {
        transform = (x) => {
          return (
            mlContext.coefficients[0] +
            mlContext.coefficients[1] * x +
            mlContext.coefficients[2] * x * x +
            mlContext.coefficients[3] * x * x * x
          );
        };
      }
      if (mlContext.name == "sinusoidal") {
        transform = (x) => {
          return (
            mlContext.coefficients[0] *
              Math.sin(
                mlContext.coefficients[1] * x + mlContext.coefficients[2]
              ) +
            mlContext.coefficients[3]
          );
        };
      }
      if (transform) {
        const y_axis_graph = x_axis_graph.map((x) => transform(x));
        const SCALE_GRAPH_TO_HTML_Y = (y) => {
          y = y * props.boundingCanvasPointer.height;
          y = y + props.boundingCanvasPointer.top;
          return y;
        };
        const y_axis_html = y_axis_graph.map((y) => SCALE_GRAPH_TO_HTML_Y(y));

        for (let i = 0; i < y_axis_html.length; i++) {
          const x = x_axis_html[i];
          const y = y_axis_html[i];
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }, [mlContext.name, windowWidth]);

  return (
    <canvas
      ref={canvasRef}
      width={props.windowSize.width}
      height={props.windowSize.height}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};

export default function App() {
  // data contexts
  const ballsContext = useContext(BallsContext);
  const mlContext = useContext(MLContext);
  // data contexts

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
