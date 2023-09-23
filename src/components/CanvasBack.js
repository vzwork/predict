import React, { useRef, useEffect, useState, useContext } from "react";
import { MLContext } from ".././contexts/MLContext";

export default function CanvasBack(props) {
  const canvasRef = useRef(null);
  const mlContext = useContext(MLContext);

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
    if (
      props.windowSize &&
      props.boundingCanvasPointer &&
      props.analyzeProcess
    ) {
      console.log("check");
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
  }, [mlContext.coefficients, props.windowSize, props.analyzeProcess]);

  return (
    <canvas
      ref={canvasRef}
      width={props.windowSize.width}
      height={props.windowSize.height}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
