import { useContext, useEffect, useRef } from "react";
import { BallsContext } from "../contexts/BallsContext";

export default function BallsDisplay(props) {
  const canvasRef = useRef();
  const ballsContext = useContext(BallsContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ballsContext.balls.map((ball) => {
      const x = ball.x * props.width;
      const y = ball.y * props.height;

      ctx.beginPath();
      ctx.arc(x, y, props.height / 64, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [ballsContext.balls, props.width]);

  return (
    <canvas
      ref={canvasRef}
      width={props.width}
      height={props.height}
      style={{ borderRadius: "5rem" }}
    />
  );
}
