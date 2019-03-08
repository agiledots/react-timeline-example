import faker from "faker";
import randomColor from "randomcolor";
import moment from "moment";

const dateFormat = 'YYYY-MM-DDTHH:mm:ss'


const schedules = [
  {
    schedule_name: 'schedule_name_001',
    playlist_name: 'playlist_name_001',
    available_date_from: '2019-03-01',
    available_date_to: '2019-03-03',
    available_time_from: '08:00:00',
    available_time_to: '20:00:00',
  },
  {
    schedule_name: 'schedule_name_002',
    playlist_name: 'playlist_name_002',
    available_date_from: '2019-03-02',
    available_date_to: '2019-03-19',
    available_time_from: '',
    available_time_to: '',
  },
  {
    schedule_name: 'schedule_name_003',
    playlist_name: 'playlist_name_003',
    available_date_from: '2019-02-28',
    available_date_to: '2019-03-07',
    available_time_from: '19:00:00',
    available_time_to: '22:00:00',
  },
  {
    schedule_name: 'schedule_name_004',
    playlist_name: 'playlist_name_004',
    available_date_from: '2019-03-06',
    available_date_to: '2019-03-10',
    available_time_from: '',
    available_time_to: '',
  },
  {
    schedule_name: 'schedule_name_004',
    playlist_name: 'playlist_name_004',
    available_date_from: '2019-03-06',
    available_date_to: '',
    available_time_from: '14:00:00',
    available_time_to: '16:00:00',
  },
]


const timeline = (value) =>{ return value} // { return Math.floor(value.valueOf() / 10000000) * 10000000;  }


export default function(showStartDate='2019-03-02', showEndDate='2019-03-10') {
  let groups = [];
  for (let i = 0; i < schedules.length; i++) {
    groups.push({
      id: `${i + 1}`,
      title: schedules[i].playlist_name,
      rightTitle: schedules[i].schedule_name,
      rightTitleKey: 'rightTitle',
      tip: 'additional information',
      bgColor: '#f00'
    });
  }

  let scheduleTimes = []

  schedules.forEach( (schedule, index) => {
    let { available_date_from, available_date_to, available_time_from, available_time_to } = schedule

    // 期間なしの場合、処理しやすい為、終了日付が大きな値で固定
    available_date_to = available_date_to || '2030-01-01'

    // 開始時間は大きな方、終了時間は小さい方
    available_date_from = available_date_from < showStartDate ? showStartDate : available_date_from
    available_date_to  = available_date_to < showEndDate ? available_date_to : showEndDate

    console.log("  ")
    console.log("--> index: " + index + " available_date_from: " + available_date_from + " available_date_to: " + available_date_to + " available_time_from: " + available_time_from + " available_time_to: " + available_time_to)

    if( ! (available_time_from && available_time_to) ) {
      // 時刻設定なし

      const startTime = moment(available_date_from)
      const endTime = moment(available_date_to).add(1, 'day')
      
      let times = []
      times.push([timeline(startTime), timeline(endTime)])
      scheduleTimes.push(times)

    } else {
      // 時刻設定あり
      let times = []
      let startDate = moment(available_date_from)

      while( startDate.isSameOrBefore(moment(available_date_to)) ) {

        console.log("moment(available_date_to):"  + moment(available_date_to).format())

        const day = startDate.format('YYYY-MM-DD')
        const startTime = moment(`${day} ${available_time_from}`)
        const endTime = moment(`${day} ${available_time_to}`)

        times.push([timeline(startTime), timeline(endTime)])

        // 日付 + 1day
        startDate = startDate.add(1, 'day')
      }

      scheduleTimes.push(times)
    }

  })

  console.log(scheduleTimes)
  

  // {id: "0", group: "2", title: "time_0", start: 1550770000000, end: 1550790921150, …}
  let items = []
  let count = 0 
  scheduleTimes.forEach( (times, i ) => {
    times.forEach((time, j) => {
      items.push({
        id: `${count}`, 
        group: `${i + 1}`, 
        title: `time_${i}_${j}`, 
        start: Math.floor(time[0].valueOf() / 10000000) * 10000000, 
        end: Math.floor(time[1].valueOf() / 10000000) * 10000000,
        itemProps: {
          "data-tip": faker.hacker.phrase()
        },
        bgColor: "#a8c9ff",
      })

      count = count + 1
    })

  })

  console.log(items)
  // 

  splitTime(items)

  return {groups, items}
}


const splitTime = (scheduleTimes) => {

  let itemColors = []
  // [Array(2), Array(1), Array(6), Array(1), Array(5)]
  // 0: Array(2)
  // 0: (2) [1551480000000, 1551520000000]
  // 1: (2) [1551560000000, 1551610000000]
  // length: 2
  // __proto__: Array(0)
  // 1: Array(1)
  // 0: (2) [1551450000000, 1552230000000]

  // const reducer = (accumulator, currentTimes) => {

  //    return accumulator + currentValue
  // }

  // const splitData = scheduleTimes.reduce(reducer)

  scheduleTimes = scheduleTimes.reverse()

  for(let i = 0; i < scheduleTimes.length; i++) {
    if (i == 0) {
      continue
    }

    let preTimes = scheduleTimes[i - 1]
    let currentTime = scheduleTimes[i]

    currentTime.forEach( (times, index) => {
      


    })


  }

  


}





















export const fakeData =  function(groupCount = 5, itemCount = 10, daysInPast = 30) {
  let randomSeed = Math.floor(Math.random() * 1000);
  let groups = [];
  for (let i = 0; i < groupCount; i++) {
    groups.push({
      id: `${i + 1}`,
      title: `Title_${i + 1}`,
      rightTitle: `rightTitle_${i + 1}`,
      bgColor: randomColor({ luminosity: "light", seed: randomSeed + i })
    });

    console.log(randomColor({ luminosity: "light", seed: randomSeed + i }))
  }

  let items = [];
  for (let i = 0; i < itemCount; i++) {
    const startDate =
      faker.date.recent(daysInPast).valueOf() + daysInPast * 0.3 * 86400 * 1000;
    const startValue =
      Math.floor(moment(startDate).valueOf() / 10000000) * 10000000;
    const endValue = moment(
      startDate + faker.random.number({ min: 2, max: 20 }) * 15 * 600 * 1000
    ).valueOf();

    // console.log("---------------: " + i)
    // console.log("startValue: " + moment(startValue).format(dateFormat))
    // console.log("endValue: " + moment(endValue).format(dateFormat))

    items.push({
      id: i + "",
      group: faker.random.number({ min: 1, max: groups.length }) + "",
      title: `time_${i}`,  //faker.hacker.phrase(),
      start: startValue,
      end: endValue,
      // canMove: startValue > new Date().getTime(),
      // canResize:
      //   startValue > new Date().getTime()
      //     ? endValue > new Date().getTime()
      //       ? "both"
      //       : "left"
      //     : endValue > new Date().getTime()
      //       ? "right"
      //       : false,


      // className:
      //   moment(startDate).day() === 6 || moment(startDate).day() === 0
      //     ? "item-weekend"
      //     : "",
      // bgColor: randomColor({
      //   luminosity: "light",
      //   seed: randomSeed + i,
      //   format: "rgba",
      //   alpha: 0.6
      // }),
      // selectedBgColor: randomColor({
      //   luminosity: "light",
      //   seed: randomSeed + i,
      //   format: "rgba",
      //   alpha: 1
      // }),
      // color: randomColor({ luminosity: "dark", seed: randomSeed + i }),
      itemProps: {
        "data-tip": faker.hacker.phrase()
      }
    });
  }

  items = items.sort((a, b) => b - a);
  

  return { groups, items };
}
