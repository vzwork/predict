import { createContext, useEffect, useState } from "react";

const BallsContext = createContext();

const BallsContextProvider = (props) => {
  const BALLS_COUNT_MAX = 40
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    if (balls.length > BALLS_COUNT_MAX) {
      setBalls(balls.slice(1))
    }
  }, [balls])

  return (
    <BallsContext.Provider value={{balls, setBalls, BALLS_COUNT_MAX}}>
      {props.children}
    </BallsContext.Provider>
  )
}

export {BallsContext, BallsContextProvider}