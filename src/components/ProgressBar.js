import React, { Component } from "react";

class ProgressBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
    };
  }

  componentDidMount() {
    // Start the progress bar
    this.startProgressBar();
  }

  startProgressBar() {
    const totalTime = 7000; // 6000 milliseconds = 5 seconds
    const interval = 70; // Update the progress every 50 milliseconds

    const numUpdates = totalTime / interval;
    const increment = 100 / numUpdates;

    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      if (currentProgress < 100) {
        currentProgress += increment;
        this.setState({ progress: currentProgress });
      } else {
        clearInterval(progressInterval);
      }
    }, interval);
  }

  render() {
    return <div>{Math.round(this.state.progress)}%</div>;
  }
}

export default ProgressBar;
