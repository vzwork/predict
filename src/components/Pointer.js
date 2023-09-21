// ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// Pointer Component
//
// Functionality - allow user to click and create a point on a plane
//
// Props:
// - Plane Size
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

import { useContext, useEffect, useRef, useState } from "react";
import { BallsContext } from "../contexts/BallsContext";

export default function Pointer(props) {
  const canvasRef = useRef(null);
  const position = useMousePosition();
  const ballsContext = useContext(BallsContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pointBall = () => {
      const x = Math.round((position.x - rect.left)/rect.width * 100) / 100
      const y = Math.round((position.y - rect.top)/rect.height * 100) / 100
      const ball = {x, y}
      if (!ballsContext.balls.includes(ball)) {
        ballsContext.setBalls(old => [...old, ball])
      }
    }

    // Target
    if (
      position.x >= rect.left &&
      position.x <= rect.right &&
      position.y >= rect.top &&
      position.y <= rect.bottom
    ) {
      ctx.fillStyle = "#999";
      ctx.fillRect(
        position.x - rect.left,
        position.y - rect.top,
        1,
        -rect.height
      );
      ctx.fillRect(
        position.x - rect.left,
        position.y - rect.top,
        1,
        rect.height
      );
      ctx.fillRect(
        position.x - rect.left,
        position.y - rect.top,
        -rect.width,
        1
      );
      ctx.fillRect(
        position.x - rect.left,
        position.y - rect.top,
        rect.width,
        1
      );

      // select
      canvas.addEventListener('click', pointBall)
    }

    return () => {canvas.removeEventListener('click', pointBall)}
  }, [position]);

  return (
    <canvas
      style={{borderRadius: '5rem'}}
      ref={canvasRef}
      width={props.width}
      height={props.height}
    />
  );
}

const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const setFromEvent = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", setFromEvent);

    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, []);

  return position;
};
