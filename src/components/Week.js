import React, { Component } from 'react';

import Day from './Day';

class Week extends Component {
  render() {
    return (
      <div
        className="schedule"
        style={this.props.lockscreenStyle ? this.props.lockscreenStyle.global : {}}
      >
        {this.props.week.days.map((day, index) =>
          index !== 6 &&
          <Day
            key={index}
            parent={this.props.parent}
            daysNumber={this.props.week.days.length}
            day={day}
            dayIndex={index}
            weekIndex={this.props.weekIndex}
            isCurrentDay={this.props.isCurrentWeek && (new Date().getDay() - 1 === index)}
            handleModal={this.props.handleModal}
            lockscreenStyle={this.props.lockscreenStyle}
          />
        )}
      </div>
    );
  }
}

export default Week;
