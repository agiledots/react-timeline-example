import moment from "moment";

const schedules = [
  {
    schedule_name: 'schedule_name_001',
    playlist_name: 'playlist_name_001',
    available_date_from: '2019-04-01',
    available_date_to: '2019-04-03',
    available_time_from: '08:00:00',
    available_time_to: '20:00:00',
  },
  {
    schedule_name: 'schedule_name_002',
    playlist_name: 'playlist_name_002',
    available_date_from: '2019-04-02',
    available_date_to: '2019-04-19',
    available_time_from: '',
    available_time_to: '',
  },
  {
    schedule_name: 'schedule_name_003',
    playlist_name: 'playlist_name_003',
    available_date_from: '2019-02-28',
    available_date_to: '2019-04-07',
    available_time_from: '19:00:00',
    available_time_to: '22:00:00',
  },
  {
    schedule_name: 'schedule_name_004',
    playlist_name: 'playlist_name_004',
    available_date_from: '2019-04-06',
    available_date_to: '2019-04-10',
    available_time_from: '',
    available_time_to: '',
  },
  {
    schedule_name: 'schedule_name_005',
    playlist_name: 'playlist_name_005',
    available_date_from: '2019-04-06',
    available_date_to: '',
    available_time_from: '14:00:00',
    available_time_to: '16:00:00',
  },
  {
    schedule_name: 'schedule_name_006',
    playlist_name: 'playlist_name_006',
    available_date_from: '2019-04-16',
    available_date_to: '2019-04-26',
    available_time_from: '14:00:00',
    available_time_to: '16:00:00',
  },
]


/**
 * 连接被分割的白色区域
 * @param {已经计算出来的结果} accumulator 
 * @param {需要计算的项目} currentValue 
 */
const connectReducer = (accumulator, currentValue) => {
  let target = []
  if (!Array.isArray(accumulator)) {
    target.push(accumulator)
  } else {
    target = accumulator
  }

  let lastItem = target.pop()

  if (lastItem.group == currentValue.group
    && lastItem.color == currentValue.color && lastItem.color == "white"
    && lastItem.end.isSame(currentValue.start)) {
    const newItem = { ...lastItem, start: lastItem.start, end: currentValue.end }
    target.push(newItem)
  } else {
    target.push(lastItem)
    target.push(currentValue)
  }

  return target
}


/**
 * 将重复的时间分割，并且表示白色和蓝色区域
 * @param {已经处理好的结果} accumulator 
 * @param {下一个待处理的项目} currentValue 
 */
const splitTimereducer = (accumulator, currentValue) => {

  let target = []
  if (!Array.isArray(accumulator)) {
    target.push(accumulator)
  } else {
    target = accumulator
  }

  // 
  let result = []

  target.forEach(item => {
    // currentValue.start
    // currentValue.end

    if (item.color == 'blue' && item.group != currentValue.group) {

      // item          --------
      // currentValue       -----------
      if (currentValue.start.isAfter(item.start) && currentValue.start.isBefore(item.end)
        && currentValue.end.isAfter(item.end)
      ) {
        result.push({ ...item, end: currentValue.start, color: 'blue' })
        result.push({ ...item, start: currentValue.start, color: 'white' })
      }

      // item            ------------------------
      // currentValue          -----------
      if (currentValue.start.isAfter(item.start) && currentValue.end.isBefore(item.end)
        && currentValue.end.isBefore(item.end)
      ) {
        result.push({ ...item, end: currentValue.start, color: 'blue' })
        result.push({ ...item, start: currentValue.start, end: currentValue.end, color: 'white' })
        result.push({ ...item, start: currentValue.end, color: 'blue' })
        //
        // result.push(currentValue)
      }

      // item               -----------
      // currentValue  ------------------------
      if (currentValue.start.isBefore(item.start) && currentValue.end.isAfter(item.end)) {
        result.push({ ...item, color: 'white' })

        // result.push(currentValue)
      }


      // item                  ------------
      // currentValue    -----------
      if (currentValue.end.isAfter(item.start) && currentValue.end.isBefore(item.end)
        && currentValue.start.isBefore(item.start)
      ) {
        result.push({ ...item, end: currentValue.end, color: 'white' })
        result.push({ ...item, start: currentValue.end, color: 'blue' })
        // 
        // result.push(currentValue)
      }

      // item         ------------
      // currentValue                -----------
      if (currentValue.start.isSameOrAfter(item.end)) {
        result.push(item)
      }

      // item                         ------------
      // currentValue  -----------
      if (currentValue.end.isSameOrBefore(item.start)) {
        result.push(item)
      }

      // 完全重合
      // item           -----------
      // currentValue   -----------
      if (currentValue.start.isSame(item.start) && currentValue.end.isSame(item.end)) {
        result.push({ ...item, color: 'white' })
      }


    } else {
      result.push(item)
    }
  })

  result.push(currentValue)

  return result
}


/**
 * 将有重复的时间段分割，并且标记白色或蓝色
 * @param {*} scheduleTimes 
 */
const splitTime = (scheduleTimes) => {

  let objectTimes = scheduleTimes.map((times, index) => {
    return times.map(time => {
      return {
        group: index,
        start: time[0],
        end: time[1],
        color: 'blue'
      }
    })
  })

  const itemTimes = objectTimes.flat()

  return itemTimes.reduce(splitTimereducer)
}

/**
 * 根据原始schedule数据，计算各个时刻的schedule时间片段
 * @param {schdule数据} schedules 
 * @param {显示的开始日期} show_start_date 
 * @param {显示的结束日期} show_end_date 
 */
const detailTimes = (schedules, show_start_date = '2019-04-01', show_end_date = '2019-04-30') => {

  return schedules.map((schedule) => {

    let { available_date_from, available_date_to, available_time_from, available_time_to } = schedule

    // 期間なしの場合、処理しやすい為、終了日付が大きな値で固定
    available_date_to = available_date_to || '2030-01-01'

    // 開始時間は大きな方、終了時間は小さい方
    available_date_from = available_date_from < show_start_date ? show_start_date : available_date_from
    available_date_to = available_date_to < show_end_date ? available_date_to : show_end_date


    if (!(available_time_from && available_time_to)) {
      // 没有设置时刻
      const startTime = moment(available_date_from)
      const endTime = moment(available_date_to).add(1, 'day')

      // 连续的时间段
      let times = []
      times.push([startTime, endTime])

      return times

    } else { // 时刻有设置

      // 连续的时间段
      let times = []

      // 开始日期
      let startDate = moment(available_date_from)

      // 以 开始日期--结束日期 之间的天数进行循环，计算出每天播放的时间段
      while (startDate.isSameOrBefore(moment(available_date_to))) {

        console.log("moment(available_date_to):" + moment(available_date_to).format())

        const day = startDate.format('YYYY-MM-DD')

        // 当天的播放的开始时刻
        const startTime = moment(`${day} ${available_time_from}`)
        // 当天的播放的结束时刻
        const endTime = moment(`${day} ${available_time_to}`)


        times.push([startTime, endTime])

        // 日付 + 1day，继续下一天的处理
        startDate = startDate.add(1, 'day')
      }

      return times
    }
  })

}



/**
 * timeline数据计算与显示
 * @param {*} 显示开始日期
 * @param {*} 显示结束日期
 */
export default function () {
  let groups = [];
  for (let i = 0; i < schedules.length; i++) {
    groups.push({
      id: `${i}`,
      title: schedules[i].playlist_name,
      rightTitle: schedules[i].schedule_name,
      rightTitleKey: 'rightTitle',
      tip: 'additional information',
      bgColor: '#f00'
    });
  }

  // 根据原始schedule数据，计算各个时刻的schedule时间片段
  // 没有去重的，播放时间段
  console.log("没有去重的，播放时间段")
  const scheduleTimes = detailTimes(schedules, '2019-04-01', '2019-05-02')
  console.log(scheduleTimes)


  // 划分时间片段，标记白蓝色
  console.log("标记白蓝时间段")
  const splitData = splitTime(scheduleTimes)
  console.log(splitData)


  // 将连续的白色时间片段合并
  const data = splitData.reduce(connectReducer)
  console.log(data)


  // 准备timeline插件显示的数据
  let items = []
  data.forEach((time, i) => {

    const title = `${time.start.format()}--${time.end.format()}`

    items.push({
      id: `${i}`,
      group: time.group,
      title: title,
      start: time.start, 
      end: time.end,
      itemProps: { "data-tip": title },
      bgColor: time.color == "blue" ? "#a8c9ff" : "#eee",
    })

  })

  console.log(items)
  // 

  return { groups, items }
}
