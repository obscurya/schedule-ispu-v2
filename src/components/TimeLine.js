import React, { Component } from 'react';

class Week extends Component {
  constructor(props) {
    super(props);

    this.timer = null;
    this.timeLine = React.createRef();
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      let parentHeight = this.timeLine.current.parentNode.offsetHeight;
      let currentTime = Date.now();
      // let currentTime = new Date().setHours(8, 30, 0, 0);
      let minTime = new Date().setHours(8, 0, 0, 0);
      let maxTime = new Date().setHours(21, 0, 0, 0);

      if (currentTime < minTime || currentTime > maxTime) {
        this.timeLine.current.style.top = Math.round(parentHeight - this.timeLine.current.offsetHeight / 2) + 'px';

        clearInterval(this.timer);
      } else {
        this.timeLine.current.style.top = Math.round((1 - (maxTime - currentTime) / (maxTime - minTime)) * parentHeight - this.timeLine.current.offsetHeight / 2) + 'px';
      }
    }, 1000);
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  render() {
    return (
      <div className="time-line" ref={this.timeLine}></div>
    );
  }
}

export default Week;
