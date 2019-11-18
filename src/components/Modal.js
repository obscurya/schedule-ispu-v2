import React, { Component } from 'react';

import Lockscreen from './Lockscreen';

class Modal extends Component {
  constructor(props) {
    super(props);

    this.renderLesson = this.renderLesson.bind(this);
    this.renderLockscreen = this.renderLockscreen.bind(this);
  }

  renderLesson() {
    return (
      <div className="modal-window">
        <div className="modal-window-header">
          <div className="modal-window-header-name">Неделя {this.props.modalLesson.weekIndex + 1}, {this.props.modalLesson.day}, {this.props.modalLesson.lesson.timeBegin} &ndash; {this.props.modalLesson.lesson.timeEnd}</div>
          <div className="modal-window-header-close" onClick={this.props.handleModal}>&times;</div>
        </div>
        <div className="modal-window-body">
          <label>
            <input
              className="input"
              name="subject"
              list="subjectsList"
              value={this.props.modalLesson.lesson.subject}
              onChange={this.props.handleModalLesson}
              placeholder="Дисциплина"
            />
            <datalist id="subjectsList">
              {this.props.subjects.map((subject, index) =>
                <option value={subject} key={index}></option>
              )}
            </datalist>
          </label>
          <label>
            <input
              className="input"
              name="teacher"
              list="teachersList"
              value={this.props.modalLesson.lesson.teacher}
              onChange={this.props.handleModalLesson}
              placeholder="Преподаватель"
            />
            <datalist id="teachersList">
              {this.props.teachers.map((teacher, index) =>
                <option value={teacher} key={index}></option>
              )}
            </datalist>
          </label>
          <label>
            <input
              className="input"
              name="room"
              list="roomsList"
              value={this.props.modalLesson.lesson.room}
              onChange={this.props.handleModalLesson}
              placeholder="Аудитория"
            />
            <datalist id="roomsList">
              {this.props.rooms.map((room, index) =>
                <option value={room} key={index}></option>
              )}
            </datalist>
          </label>
          <label>
            <select
              className="input"
              name="type"
              value={this.props.modalLesson.lesson.type}
              onChange={this.props.handleModalLesson}
              placeholder="Тип занятия"
            >
              <option value="Лекция">Лекция</option>
              <option value="Лабораторная">Лабораторная</option>
              <option value="Курсовое проектирование">Курсовое проектирование</option>
              <option value="Семинар">Семинар</option>
            </select>
          </label>
        </div>
        <div className="modal-window-buttons">
          <button className="button" onClick={this.props.modalLessonSave}>Сохранить изменения</button>
          <button className="button" onClick={this.props.modalLessonRemove}>Удалить занятие</button>
        </div>
      </div>
    );
  }

  renderLockscreen() {
    return (
      <div className="modal-window modal-lockscreen">
        <div className="modal-window-header">
          <div className="modal-window-header-name">Редактор изображения</div>
          <div className="modal-window-header-close" onClick={this.props.handleModal}>&times;</div>
        </div>
        <div className="modal-window-body">
          {this.props.weeks &&
            <Lockscreen
              weeks={this.props.weeks}
            />
          }
        </div>
      </div>
    );
  }

  render() {
    let renderFunction;

    switch (this.props.mode) {
      case 'lockscreen':
        renderFunction = this.renderLockscreen;
        break;
      default:
        renderFunction = this.renderLesson;
    }

    return (
      <div className="modal">
        <div className="modal-close" onClick={this.props.handleModal}></div>
        {renderFunction()}
      </div>
    );
  }
};

export default Modal;
