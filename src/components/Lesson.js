import React, { Component } from 'react';

class Lesson extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lesson: this.props.lesson
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { subject, teacher, room } = props.lesson;
    const { prevSubject, prevTeacher, prevRoom } = state.lesson;

    if (subject === prevSubject && teacher === prevTeacher && room === prevRoom) return false;

    return { lesson: props.lesson };
  }

  renderLockscreen() {
    return (
      <div className="lesson" style={this.props.lockscreenStyle.global}>
        {this.state.lesson.subject !== '' ?
          <div className={'lesson-body ' + this.state.lesson.className}>
            <div
              className="lesson-subject"
              style={{ ...this.props.lockscreenStyle.global, ...this.props.lockscreenStyle.subject }}
            >{this.state.lesson.subject}</div>
            {this.props.lockscreenStyle.props.showTeachers &&
              <div
                className="lesson-teacher"
                style={{ ...this.props.lockscreenStyle.global, ...this.props.lockscreenStyle.teacher }}
              >{this.state.lesson.teacher}&nbsp;</div>
            }
            <div
              className="lesson-room"
              style={{ ...this.props.lockscreenStyle.global, ...this.props.lockscreenStyle.room }}
            >{this.state.lesson.room}&nbsp;</div>
            <div
              className="lesson-time"
              style={{ ...this.props.lockscreenStyle.global, ...this.props.lockscreenStyle.time }}
            >{this.state.lesson.timeBegin} - {this.state.lesson.timeEnd}</div>
          </div>
          :
          <div className="lesson-body-empty">
            <div
              className="lesson-subject"
              style={this.props.lockscreenStyle.subject}
            >&nbsp;</div>
            {this.props.lockscreenStyle.props.showTeachers &&
              <div
                className="lesson-teacher"
                style={this.props.lockscreenStyle.teacher}
              >&nbsp;</div>
            }
            <div
              className="lesson-room"
              style={this.props.lockscreenStyle.room}
            >&nbsp;</div>
            <div
              className="lesson-time"
              style={{ ...this.props.lockscreenStyle.global, ...this.props.lockscreenStyle.time }}
            >{this.state.lesson.timeBegin} - {this.state.lesson.timeEnd}</div>
          </div>
        }
      </div>
    );
  }

  renderMain() {
    return (
      <div
        className="lesson"
        onClick={() => this.props.handleModal('lesson', this.props.weekIndex, this.props.dayIndex, this.props.lessonIndex)}
      >
        {this.state.lesson.subject !== '' ?
          <div className={'lesson-body ' + this.state.lesson.className}>
            <div className="lesson-subject">{this.state.lesson.subject}</div>
            <div className="lesson-teacher">{this.state.lesson.teacher}&nbsp;</div>
            <div className="lesson-room">{this.state.lesson.room}&nbsp;</div>
            <div className="lesson-time">{this.state.lesson.timeBegin} - {this.state.lesson.timeEnd}</div>
          </div>
          :
          <div className="lesson-body-empty">
            <div className="lesson-subject">&nbsp;</div>
            <div className="lesson-teacher">&nbsp;</div>
            <div className="lesson-room">&nbsp;</div>
            <div className="lesson-time">{this.state.lesson.timeBegin} - {this.state.lesson.timeEnd}</div>
          </div>
        }
      </div>
    );
  }

  render() {
    if (this.props.parent === 'lockscreen') return this.renderLockscreen();

    return this.renderMain();
  }
}

export default Lesson;
