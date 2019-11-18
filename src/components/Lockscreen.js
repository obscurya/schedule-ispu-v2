import React, { Component } from 'react';
import rasterizeHTML from 'rasterizehtml';

import Week from './Week';

class Lockscreen extends Component {
  css = '*{margin:0;padding:0;box-sizing:border-box;font:14px Montserrat,sans-serif;-moz-appearance:none;-webkit-appearance:none}.schedule-main{margin-bottom:30px;border:1px solid rgba(0,0,0,0.1);border-radius:3px;overflow:hidden}.schedule-main:last-child{margin-bottom:0}.schedule .day{display:inline-block;width:calc(100% / 6);border-right:1px solid rgba(0,0,0,0.1)}.schedule .day:last-child{border:none}.schedule .day-header{padding:15px 22px;font-size:12px;color:#616161;background:#fff;border-bottom:1px solid rgba(0,0,0,0.1)}.schedule .day-body{position:relative;overflow:hidden}.schedule .day-body .time-line{position:absolute;top:calc(-15px / 2);width:100%;height:2px;background:rgba(0,0,0,0.2)}.schedule .day-body .lesson{cursor:pointer;padding:5px;background:#fff;border-bottom:1px solid rgba(0,0,0,0.1)}.schedule .day-body .lesson:last-child{border:none}.schedule .day-body .lesson-body-empty{height:100%;padding:15px;background:#fff;overflow:hidden}.schedule .day-body .lesson-body{height:100%;padding:15px;background:#fff;border-left:2px solid;border-radius:3px;overflow:hidden}.schedule .day-body .lesson-body > div,.schedule .day-body .lesson-body-empty > div{white-space:nowrap;overflow:hidden;line-height:1.5em}.schedule .day-body .lesson-subject{font-weight:500}.schedule .day-body .lesson-teacher{font-size:12px;color:#616161}.schedule .day-body .lesson-room{font-size:12px;color:#616161}.schedule .day-body .lesson-time{font-size:12px;text-align:right;color:#616161}.lockscreen-preview-image{position:relative;overflow:hidden}.lockscreen-schedule-background{position:absolute;width:100%;height:100%;background:center no-repeat;background-size:cover;transform:scale(1.1)}.lockscreen-schedule-group{position:absolute;bottom:0;left:0;right:-1px}.lockscreen-schedule-group .schedule{margin:0;border:none;border-radius:0;border-top:1px solid #000}.lockscreen-schedule-group .schedule:last-child{border-bottom:1px solid #000}.lockscreen-schedule-group .schedule .day{border-color:#000}.lockscreen-schedule-group .schedule .day-header{padding:5px;background:none;border-color:#000;color:#000}.lockscreen-schedule-group .schedule .day-body .lesson{cursor:default;padding:0;background:none;border-color:#000}.lockscreen-schedule-group .schedule .day-body .lesson-body-empty{padding:5px;background:none}.lockscreen-schedule-group .schedule .day-body .lesson-body{padding:5px;background:none;border-left:none;border-radius:0}.lockscreen-schedule-group .schedule .day-body .lesson-time{color:#000}.schedule .day-body .lesson .lesson-type-lecture{background:rgba(255,255,0,0.25);border-color:rgba(255,255,0,0.75)}.schedule .day-body .lesson .lesson-type-lab{background:rgba(170,0,255,0.25);border-color:rgba(170,0,255,0.75)}.schedule .day-body .lesson .lesson-type-course{background:rgba(255,23,68,0.25);border-color:rgba(255,23,68,0.75)}.schedule .day-body .lesson .lesson-type-seminar{background:rgba(100,221,23,0.25);border-color:rgba(100,221,23,0.75)}.schedule .day-body .lesson .lesson-type-military{background:rgba(0,229,255,0.25);border-color:rgba(0,229,255,0.75)}.schedule .day-body .lesson .lesson-type-lecture > div,.schedule .day-body .lesson .lesson-type-lab > div,.schedule .day-body .lesson .lesson-type-course > div,.schedule .day-body .lesson .lesson-type-seminar > div,.schedule .day-body .lesson .lesson-type-military > div{color:#000}';

  constructor(props) {
    super(props);

    this.state = {
      weeks: [],
      lockscreenStyle: {
        global: {
          borderColor: 'rgba(255, 255, 255, 0.5)',
          color: '#fff'
        },
        main: {
          width: '640px',
          height: '1136px',
        },
        background: {
          backgroundColor: '#666',
          backgroundImage: '',
          filter: 'blur(3px) brightness(0.7)'
        },
        group: {
          bottom: '120px'
        },
        dayHeader: {
          fontSize: '12px'
        },
        subject: {
          fontSize: '12px'
        },
        teacher: {
          fontSize: '12px'
        },
        room: {
          fontSize: '12px'
        },
        time: {
          fontSize: '12px'
        },
        props: {
          backgroundImageFileName: '',
          showTeachers: false
        }
      }
    };

    this.resizeLockscreenImage = this.resizeLockscreenImage.bind(this);
    this.handleChangeStyle = this.handleChangeStyle.bind(this);
    this.handleChangeBackground = this.handleChangeBackground.bind(this);
    this.handleChangeProps = this.handleChangeProps.bind(this);

    this.lockscreenPreview = React.createRef();
    this.canvas = React.createRef();
    this.lockscreenImage = React.createRef();
  }

  componentDidMount() {
    let weeks = JSON.parse(JSON.stringify(this.props.weeks));

    for (let w = 0; w < weeks.length; w++) {
      for (let d = weeks[w].days.length - 1; d >= 0; d--) {
        let removeColumn = true;

        for (let l = 0; l < weeks[w].days[d].lessons.length; l++) {
          if (weeks[w].days[d].lessons[l].subject !== '') {
            removeColumn = false;
            break;
          }
        }

        if (removeColumn) weeks[w].days.splice(d, 1);
      }

      for (let l = weeks[w].days[0].lessons.length - 1; l >= 0; l--) {
        let removeRow = true;

        for (let d = 0; d < weeks[w].days.length; d++) {
          if (weeks[w].days[d].lessons[l].subject !== '') {
            removeRow = false;
            break;
          }
        }

        if (removeRow) {
          for (let d = 0; d < weeks[w].days.length; d++) {
            weeks[w].days[d].lessons.splice(l, 1);
          }
        }
      }
    }

    window.onresize = () => {
      this.resizeLockscreenImage();
    };

    this.setState({ weeks });
  }

  componentDidUpdate() {
    let container = this.lockscreenPreview.current;
    let canvas = this.canvas.current;
    let image = this.lockscreenImage.current;
    let html = `<style>${this.css}</style>${container.innerHTML.split('<canvas')[0]}`;

    rasterizeHTML.drawHTML(html, canvas)
    .then(() => {
      image.onload = () => {
        this.resizeLockscreenImage();
      };

      image.src = canvas.toDataURL('image/png');
    });
  }

  resizeLockscreenImage() {
    let container = this.lockscreenPreview.current;
    let image = this.lockscreenImage.current;

    if (container) {
      let style = container.currentStyle || window.getComputedStyle(container);
      let padding = parseFloat(style.paddingLeft) * 2;
      let containerWidth = container.offsetWidth - padding;
      let containerHeight = container.offsetHeight - padding;
      let containerRatio = containerHeight / containerWidth;
      let imageWidth = parseFloat(this.state.lockscreenStyle.main.width);
      let imageHeight = parseFloat(this.state.lockscreenStyle.main.height);
      let finalWidth = imageWidth;
      let finalHeight = imageHeight;

      if (imageWidth > containerWidth || imageHeight > containerHeight) {
        let imageRatio = imageHeight / imageWidth;

        if (containerRatio > imageRatio) {
          finalWidth = containerWidth;
          finalHeight = containerWidth * imageRatio;
        } else {
          finalHeight = containerHeight;
          finalWidth = containerHeight / imageRatio;
        }
      }

      image.style.width = finalWidth + 'px';
      image.style.height = finalHeight + 'px';
    }
  }

  handleChangeStyle(e) {
    let n = e.target.name.split('-');
    let v = e.target.value;

    if (n[1] === 'width' || n[1] === 'height' || n[1] === 'bottom' || n[1] === 'fontSize') v += 'px';

    let lockscreenStyle = {
      ...this.state.lockscreenStyle,
      [n[0]]: {
        ...this.state.lockscreenStyle[n[0]],
        [n[1]]: v
      }
    };

    this.setState({ lockscreenStyle });
  }

  handleChangeBackground(e) {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      let reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onloadend = () => {
        let lockscreenStyle = {
          ...this.state.lockscreenStyle,
          background: {
            ...this.state.lockscreenStyle.background,
            backgroundImage: `url(${reader.result})`
          },
          props: {
            ...this.state.lockscreenStyle.props,
            backgroundImageFileName: file.name
          }
        };

        this.setState({ lockscreenStyle });
      };
    }
  }

  handleChangeProps(e) {
    let lockscreenStyle = {
      ...this.state.lockscreenStyle,
      props: {
        ...this.state.lockscreenStyle.props,
        [e.target.name]: !this.state.lockscreenStyle.props[e.target.name]
      }
    };

    this.setState({ lockscreenStyle });
  }

  render() {
    return (
      <div className="container-lockscreen">
        <div className="lockscreen-props">
          <div className="lockscreen-prop">
            <span>Ширина</span>
            <input
              className="input"
              name="main-width"
              value={this.state.lockscreenStyle.main.width.split('px')[0]}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Высота</span>
            <input
              className="input"
              name="main-height"
              value={this.state.lockscreenStyle.main.height.split('px')[0]}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Отступ снизу</span>
            <input
              className="input"
              name="group-bottom"
              value={this.state.lockscreenStyle.group.bottom.split('px')[0]}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>День недели &mdash; размер шрифта</span>
            <input
              className="input"
              name="dayHeader-fontSize"
              value={this.state.lockscreenStyle.dayHeader.fontSize.split('px')[0]}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Дисциплина &mdash; размер шрифта</span>
            <input
              className="input"
              name="subject-fontSize"
              value={this.state.lockscreenStyle.subject.fontSize.split('px')[0]}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Преподаватель &mdash; размер шрифта</span>
            <input
              className="input"
              name="teacher-fontSize"
              value={this.state.lockscreenStyle.teacher.fontSize.split('px')[0]}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Аудитория &mdash; размер шрифта</span>
            <input
              className="input"
              name="room-fontSize"
              value={this.state.lockscreenStyle.room.fontSize.split('px')[0]}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Время &mdash; размер шрифта</span>
            <input
              className="input"
              name="time-fontSize"
              value={this.state.lockscreenStyle.time.fontSize.split('px')[0]}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Цвет рамки</span>
            <input
              className="input"
              name="global-borderColor"
              value={this.state.lockscreenStyle.global.borderColor}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Цвет фона</span>
            <input
              className="input"
              name="background-backgroundColor"
              value={this.state.lockscreenStyle.background.backgroundColor}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop">
            <span>Фильтр фона</span>
            <input
              className="input"
              name="background-filter"
              value={this.state.lockscreenStyle.background.filter}
              onChange={this.handleChangeStyle}
            />
          </div>
          <div className="lockscreen-prop input-radio">
            <input
              type="file"
              id="style-background-image"
              name="main-backgroundImage"
              onChange={this.handleChangeBackground}
            />
            <label htmlFor="style-background-image">
              {this.state.lockscreenStyle.props.backgroundImageFileName === '' ?
                'Фоновое изображение'
                :
                this.state.lockscreenStyle.props.backgroundImageFileName
              }
            </label>
          </div>
          <div className="lockscreen-prop input-radio">
            <input
              type="checkbox"
              id="prop-teachers"
              name="showTeachers"
              checked={this.state.lockscreenStyle.props.showTeachers}
              onChange={this.handleChangeProps}
            />
            <label htmlFor="prop-teachers">Преподаватели</label>
          </div>
        </div>
        <div ref={this.lockscreenPreview} className="lockscreen-preview">
          <div className="lockscreen-preview-image" style={this.state.lockscreenStyle.main}>
            <div className="lockscreen-schedule-background" style={this.state.lockscreenStyle.background}></div>
            <div className="lockscreen-schedule-group" style={this.state.lockscreenStyle.group}>
              {this.state.weeks.map((week, index) =>
                <Week
                  key={index}
                  parent={'lockscreen'}
                  week={week}
                  weekIndex={index}
                  lockscreenStyle={this.state.lockscreenStyle}
                />
              )}
            </div>
          </div>
          <canvas
            ref={this.canvas}
            width={this.state.lockscreenStyle.main.width.split('px')[0]}
            height={this.state.lockscreenStyle.main.height.split('px')[0]}
          ></canvas>
          <img ref={this.lockscreenImage} alt="" />
        </div>
      </div>
    );
  }
};

export default Lockscreen;
