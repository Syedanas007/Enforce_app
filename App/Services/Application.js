import React, { useState, useEffect } from 'react';

function ContinuousPrinting() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCounter(prevCounter => prevCounter + 1);
    }, 1000); // Change the interval time as needed (in milliseconds)

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <h1>Continuous Printing</h1>
      <p>Counter: {counter}</p>
    </div>
  );
}

export default ContinuousPrinting;
