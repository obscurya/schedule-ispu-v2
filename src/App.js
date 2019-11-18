import React, { Component } from 'react';
import axios from 'axios';

import './App.css';
import './css/Schedule.css';
import './css/Modal.css';
import './css/Lockscreen.css';
import Spinner from './tail-spin.svg';

import Modal from './components/Modal';
import Week from './components/Week';

class App extends Component {
  constructor(props) {
    super(props);

    this.spinner = React.createRef();

    this.state = {
      subjects: [],
      teachers: [],
      rooms: [],
      options: [],
      selectedOptions: {},
      currentWeek: 0,
      schedule: [],
      customSchedule: '',
      inputCustomSchedule: '',
      saveScheduleButton: false,
      modal: {
        visible: false,
        mode: ''
      },
      modalLesson: {}
    };

    this.handleChangeOptions = this.handleChangeOptions.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.handleModalLesson = this.handleModalLesson.bind(this);
    this.modalLessonSave = this.modalLessonSave.bind(this);
    this.modalLessonRemove = this.modalLessonRemove.bind(this);
    this.saveSchedule = this.saveSchedule.bind(this);
    this.handleCustomSchedule = this.handleCustomSchedule.bind(this);
    this.loadCustomSchedule = this.loadCustomSchedule.bind(this);
  }

  getElementById(array, id) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === id) return array[i];
    }

    return null;
  }

  componentDidMount() {
    axios.all([
      axios.get('/api/subjects'),
      axios.get('/api/teachers'),
      axios.get('/api/rooms'),
      axios.get('/api/current-week'),
      axios.get('/api/options')
    ])
    .then(axios.spread((subjects, teachers, rooms, currentWeek, options) => {
      options = options.data;

      let index = 0;

      for (let i = 0; i < options[0].faculties.length; i++) {
        if (options[0].faculties[i].value === 'ИВТФ') {
          index = i;
          break;
        }
      }

      let selectedOptions = {
        schedule: options[0],
        faculty: options[0].faculties[index],
        course: options[0].faculties[index].courses[0],
        group: options[0].faculties[index].courses[0].groups[0]
      };

      this.loadSchedule(selectedOptions);

      this.setState({
        subjects: subjects.data,
        teachers: teachers.data,
        rooms: rooms.data,
        currentWeek: currentWeek.data,
        options,
        selectedOptions
      });
    }));
  }

  loadSchedule(options, setOptions = false) {
    this.spinner.current.style.display = 'flex';

    axios.get(`/api/schedule/${options.schedule.id}/${options.faculty.id}/${options.course.id}/${options.group.id}`)
    .then(res => {
      this.spinner.current.style.display = 'none';

      this.setState({
        selectedOptions: setOptions ? options : this.state.selectedOptions,
        schedule: res.data,
        customSchedule: '',
        inputCustomSchedule: '',
        saveScheduleButton: false
      });
    });
  }

  findElementById(array, id) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === id) return array[i];
    }

    return null;
  }

  handleChangeOptions(e) {
    let id = e.target.value;
    let selectedOptions = {
      ...this.state.selectedOptions
    };

    switch (e.target.name) {
      case 'schedule':
        selectedOptions.schedule = this.findElementById(this.state.options, id);
        selectedOptions.faculty = selectedOptions.schedule.faculties[0];
        selectedOptions.course = selectedOptions.faculty.courses[0];
        selectedOptions.group = selectedOptions.course.groups[0];

        break;
      case 'faculty':
        selectedOptions.faculty = this.findElementById(selectedOptions.schedule.faculties, id);
        selectedOptions.course = selectedOptions.faculty.courses[0];
        selectedOptions.group = selectedOptions.course.groups[0];

        break;
      case 'course':
        selectedOptions.course = this.findElementById(selectedOptions.faculty.courses, id);
        selectedOptions.group = selectedOptions.course.groups[0];

        break;
      default:
        selectedOptions.group = this.findElementById(selectedOptions.course.groups, id);
    }

    this.loadSchedule(selectedOptions, true);
  }

  handleModal(mode, weekIndex, dayIndex, lessonIndex) {
    let modal = {
      visible: !this.state.modal.visible,
      mode
    };

    if (weekIndex + 1 && dayIndex + 1 && lessonIndex + 1) {
      let day = this.state.schedule.weeks[weekIndex].days[dayIndex];

      this.setState({
        modal,
        modalLesson: {
          weekIndex,
          dayIndex,
          lessonIndex,
          day: day.day,
          lesson: {
            ...day.lessons[lessonIndex]
          }
        }
      });
    } else {
      this.setState({ modal });
    }
  }

  handleModalLesson(e) {
    let modalLesson = {
      ...this.state.modalLesson,
      lesson: {
        ...this.state.modalLesson.lesson,
        [e.target.name]: e.target.value
      }
    };

    this.setState({ modalLesson });
  }

  modalLessonSave() {
    let schedule = this.state.schedule;
    let ml = this.state.modalLesson;
    let lesson = schedule.weeks[ml.weekIndex].days[ml.dayIndex].lessons[ml.lessonIndex];

    if (lesson.subject !== ml.lesson.subject || lesson.teacher !== ml.lesson.teacher || lesson.room !== ml.lesson.room || lesson.type !== ml.lesson.type) {
      let className = '';

      switch (ml.lesson.type) {
        case 'Лекция':
          className = 'lesson-type-lecture';
          break;
        case 'Лабораторная':
          className = 'lesson-type-lab';
          break;
        case 'Курсовое проектирование':
          className = 'lesson-type-course';
          break;
        default:
          className = 'lesson-type-seminar';
      }

      ml.lesson.className = className;
      schedule.weeks[ml.weekIndex].days[ml.dayIndex].lessons[ml.lessonIndex] = ml.lesson;

      this.setState({
        schedule,
        saveScheduleButton: true
      });
    }

    this.handleModal();
  }

  modalLessonRemove() {
    let schedule = this.state.schedule;
    let ml = this.state.modalLesson;
    let lesson = schedule.weeks[ml.weekIndex].days[ml.dayIndex].lessons[ml.lessonIndex];

    for (let key in ml.lesson) {
      if (key !== 'timeBegin' && key !== 'timeEnd') ml.lesson[key] = '';
    }

    if (lesson.subject !== ml.lesson.subject || lesson.teacher !== ml.lesson.teacher || lesson.room !== ml.lesson.room || lesson.type !== ml.lesson.type) {
      schedule.weeks[ml.weekIndex].days[ml.dayIndex].lessons[ml.lessonIndex] = ml.lesson;

      this.setState({
        schedule,
        saveScheduleButton: true
      });
    }

    this.handleModal();
  }

  saveSchedule() {
    let dirName = this.state.customSchedule;

    this.spinner.current.style.display = 'flex';

    axios.post('/api/save-custom-schedule', {
      schedule: this.state.schedule,
      dirName: dirName
    })
    .then(res => {
      this.spinner.current.style.display = 'none';

      if (dirName === '' || dirName !== res.data) {
        this.setState({
          customSchedule: res.data,
          inputCustomSchedule: res.data
        });
      }

      this.setState({ saveScheduleButton: false });
    });
  }

  handleCustomSchedule(e) {
    this.setState({ inputCustomSchedule: e.target.value });
  }

  loadCustomSchedule() {
    this.spinner.current.style.display = 'flex';

    axios.get(`/api/custom-schedule/${this.state.inputCustomSchedule}`)
    .then(res => {
      this.spinner.current.style.display = 'none';

      if (res.data.type) {
        this.setState({
          schedule: res.data,
          customSchedule: this.state.inputCustomSchedule
        });
      } else {
        console.log(res.data);
      }
    });
  }

  render() {
    return (
      <div className="container">
        <div className="spinner" ref={this.spinner}>
          <img src={Spinner} alt="" />
        </div>
        {this.state.schedule.weeks && this.state.modal.visible &&
          <Modal
            mode={this.state.modal.mode}
            weeks={this.state.schedule.weeks}
            subjects={this.state.subjects}
            teachers={this.state.teachers}
            rooms={this.state.rooms}
            modalLesson={this.state.modalLesson}
            handleModal={this.handleModal}
            handleModalLesson={this.handleModalLesson}
            modalLessonSave={this.modalLessonSave}
            modalLessonRemove={this.modalLessonRemove}
          />
        }
        <div className="container-schedule">
          {this.state.selectedOptions.schedule &&
            <div className="options">
              <div className="options-item">
                <p className="options-item-title">Расписание</p>
                <div className="options-item-body">
                  {this.state.options.map((schedule, index) =>
                    <div className="option input-radio" key={index}>
                      <input
                        type="radio"
                        id={`schedule${schedule.id}`}
                        name="schedule"
                        value={schedule.id}
                        checked={this.state.selectedOptions.schedule.id === schedule.id}
                        onChange={this.handleChangeOptions}
                      />
                      <label htmlFor={`schedule${schedule.id}`}>{schedule.value}</label>
                    </div>
                  )}
                </div>
              </div>
              <div className="options-item">
                <p className="options-item-title">Факультет</p>
                <div className="options-item-body">
                  {this.state.selectedOptions.schedule.faculties.map((faculty, index) =>
                    <div className="option input-radio" key={index}>
                      <input
                        type="radio"
                        id={`faculty${faculty.id}`}
                        name="faculty"
                        value={faculty.id}
                        checked={this.state.selectedOptions.faculty.id === faculty.id}
                        onChange={this.handleChangeOptions}
                      />
                      <label htmlFor={`faculty${faculty.id}`}>{faculty.value}</label>
                    </div>
                  )}
                </div>
              </div>
              <div className="options-item">
                <p className="options-item-title">Курс</p>
                <div className="options-item-body">
                  {this.state.selectedOptions.faculty.courses.map((course, index) =>
                    <div className="option input-radio" key={index}>
                      <input
                        type="radio"
                        id={`course${course.id}`}
                        name="course"
                        value={course.id}
                        checked={this.state.selectedOptions.course.id === course.id}
                        onChange={this.handleChangeOptions}
                      />
                      <label htmlFor={`course${course.id}`}>{course.value}</label>
                    </div>
                  )}
                </div>
              </div>
              <div className="options-item">
                <p className="options-item-title">Группа</p>
                <div className="options-item-body">
                  {this.state.selectedOptions.course.groups.map((group, index) =>
                    <div className="option input-radio" key={index}>
                      <input
                        type="radio"
                        id={`group${group.id}`}
                        name="group"
                        value={group.id}
                        checked={this.state.selectedOptions.group.id === group.id}
                        onChange={this.handleChangeOptions}
                      />
                      <label htmlFor={`group${group.id}`}>{group.value}</label>
                    </div>
                  )}
                </div>
              </div>
              <div className="options-item">
                <p className="options-item-title">Дополнительно<sup style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '2px' }}>beta</sup></p>
                <div className="options-item-body">
                  <div className="option input-radio">
                    <label onClick={() => this.handleModal('lockscreen')}>Редактор изображения</label>
                  </div>
                </div>
              </div>
            </div>

              // <label>
              //   <span>Кастомное расписание</span>
              //   <input className="input" value={this.state.inputCustomSchedule} onChange={this.handleCustomSchedule} />
              //   <button className="button" onClick={this.loadCustomSchedule}>Загрузить</button>
              // </label>
              // {this.state.saveScheduleButton &&
              //   <label>
              //     <button className="button" onClick={this.saveSchedule}>Сохранить расписание</button>
              //   </label>
              // }
          }
          {this.state.customSchedule !== '' &&
            <p class="custom-schedule-title">Кастомное расписание {this.state.schedule.type} {this.state.schedule.faculty} {this.state.schedule.course}-{this.state.schedule.group}</p>
          }
          {this.state.schedule.weeks && this.state.schedule.weeks.map((week, index) =>
            <div key={index} className="schedule-main">
              <div className="schedule-week-number">Неделя {index + 1}</div>
              <Week
                parent={'main'}
                week={week}
                weekIndex={index}
                isCurrentWeek={this.state.currentWeek - 1 === index}
                handleModal={this.handleModal}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
