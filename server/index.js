const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.resolve(__dirname, '..', 'build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const fs = require('fs');

// api routes

const dir = path.join(__dirname, '/cache/');
const custom = path.join(__dirname, '/custom/');

function getLastCache() {
  const files = fs.readdirSync(dir);
  const data = JSON.parse(fs.readFileSync(dir + files[files.length - 1]));

  return data;
}

app.get('/api/cache', (req, res) => {
  res.json(getLastCache());
});

app.get('/api/subjects', (req, res) => {
  res.json(getLastCache().subjects);
});

app.get('/api/teachers', (req, res) => {
  res.json(getLastCache().teachers);
});

app.get('/api/rooms', (req, res) => {
  res.json(getLastCache().rooms);
});

app.get('/api/options', (req, res) => {
  const cache = getLastCache();
  const settings = cache.settings;
  const options = cache.options;

  let schedules = [];

  for (let schedule in settings) {
    let faculties = [];

    for (let faculty in settings[schedule]) {
      let courses = [];

      for (let course in settings[schedule][faculty]) {
        let groups = [];

        for (let group in settings[schedule][faculty][course]) {
          let g = settings[schedule][faculty][course][group];

          groups.push({
            id: g,
            value: options.group[g]
          });
        }

        courses.push({
          id: course,
          value: options.course[course],
          groups
        });
      }

      faculties.push({
        id: faculty,
        value: options.faculty[faculty],
        courses
      });
    }

    schedules.push({
      id: schedule,
      value: options.schedule_type[schedule],
      faculties
    });
  }

  res.json(schedules);
});

app.get('/api/schedule/:typeId/:facultyId/:courseId/:groupId', (req, res) => {
  const { typeId, facultyId, courseId, groupId } = req.params;
  const cache = getLastCache();
  const type = cache.options.schedule_type[typeId];
  const faculty = cache.options.faculty[facultyId];
  const course = cache.options.course[courseId];
  const group = cache.options.group[groupId];

  if (type && faculty && course && group) {
    let schedule = {
      type,
      faculty,
      course,
      group,
      weeks: []
    };

    const scheduleKey = [typeId, facultyId, courseId, groupId].join('_');
    const weeks = cache.schedule[scheduleKey];

    for (let week in weeks) {
      let days = [];

      for (let day in weeks[week]) {
        let lessons = [];

        for (let lesson in weeks[week][day]) {
          let l = weeks[week][day][lesson];
          let timeBegin = cache.time[l[0]][0];
          let timeEnd = cache.time[l[0]][1];
          let subject = '';
          let type = '';
          let className = '';
          let teacher = '';
          let room = '';

          if (l[1]) {
            subject = cache.subjects[l[1]];

            if (l[2] !== -1) {
              type = cache.lesson_types[l[2]];

              switch (type) {
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
            }

            if (l[3] !== -1) teacher = cache.teachers[l[3]];
            if (l[4] !== -1) room = cache.rooms[l[4]];
          }

          lessons.push({
            timeBegin,
            timeEnd,
            subject,
            type,
            className,
            teacher,
            room
          });
        }

        days.push({
          day: cache.days[day],
          lessons
        });
      }

      schedule.weeks.push({
        week,
        days
      });
    }

    res.json(schedule);
  } else {
    res.send('Schedule not found!');
  }
});

app.get('/api/find-empty-rooms/:weekId/:dayId/:lessonId', (req, res) => {
  const { weekId, dayId, lessonId } = req.params;
  const cache = getLastCache();
  let rooms = cache.rooms;

  for (let s in cache.schedule) {
    if (cache.schedule[s][weekId] && cache.schedule[s][weekId][dayId] && cache.schedule[s][weekId][dayId][lessonId]) {
      let l = cache.schedule[s][weekId][dayId][lessonId];

      if (l[1] && rooms[l[4]]) rooms.splice(rooms.indexOf(rooms[l[4]]), 1);
    }
  }

  // rooms = rooms.sort((a, b) => {
  //   if (a < b) return -1;
  //   if (a > b) return 1;

  //   return 0;
  // });

  rooms = rooms.sort((a, b) => {
    return a > b;
  });

  res.json(rooms);
});

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return weekNo;
}

app.get('/api/current-week', (req, res) => {
  const cache = getLastCache();
  let week = cache.creation.week;
  let difference = getWeekNumber(new Date()) - getWeekNumber(new Date(cache.creation.time));

  if (difference % 2 === 0) {
    week = week === 1 ? 1 : 2;
  } else {
    week = week === 1 ? 2 : 1;
  }

  res.json(week);
});

function random(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

app.post('/api/save-custom-schedule', (req, res) => {
  let { schedule, dirName } = req.body;
  const abc = 'abcdefghijklmnopqrstuvwxyz';

  if (dirName === '') {
    for (let i = 0; i < 6; i++) {
      let l = Math.random() > random(0, 9) / 10 ? abc[random(0, abc.length - 1)] : random(0, 9);

      if (abc.indexOf(l) > -1 && Math.random() > random(0, 10) / 10) l = l.toUpperCase();

      dirName += l;
    }
  }

  if (!fs.existsSync(custom + dirName)) fs.mkdirSync(custom + dirName);

  fs.writeFile(`${custom + dirName}/schedule.json`, JSON.stringify(schedule), err => {
    if (err) throw err;

    res.json(dirName);
  });
});

app.get('/api/custom-schedule/:dirName', (req, res) => {
  const dirName = req.params.dirName;

  if (fs.existsSync(custom + dirName)) {
    const customSchedule = JSON.parse(fs.readFileSync(`${custom + dirName}/schedule.json`));

    res.json(customSchedule);
  } else {
    res.send('Custom schedule not found!');
  }
});

// end of routes

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

app.listen(PORT, err => {
  if (err) throw err;

  console.log(`Check out the app at http://localhost:${PORT}`);
});
