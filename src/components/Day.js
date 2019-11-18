import React, { Component } from 'react';

import Lesson from './Lesson';
import TimeLine from './TimeLine';

class Day extends Component {
  render() {
    let style = {};

    if (this.props.lockscreenStyle) {
      style = {
        ...this.props.lockscreenStyle.global,
        width: `calc(100% / ${this.props.daysNumber})`
      }
    };

    return (
      <div className="day" style={style}>
        <div
          className="day-header"
          style={this.props.lockscreenStyle ? { ...this.props.lockscreenStyle.global, ...this.props.lockscreenStyle.dayHeader } : {}}
        >{this.props.day.day}</div>
        <div className="day-body">
          {this.props.isCurrentDay &&
            <TimeLine />
          }
          {this.props.day.lessons.map((lesson, index) =>
            <Lesson
              key={index}
              parent={this.props.parent}
              lesson={lesson}
              lessonIndex={index}
              day={this.props.day.day}
              dayIndex={this.props.dayIndex}
              weekIndex={this.props.weekIndex}
              handleModal={this.props.handleModal}
              lockscreenStyle={this.props.lockscreenStyle}
            />
          )}
        </div>
      </div>
    );
  }
};

export default Day;
