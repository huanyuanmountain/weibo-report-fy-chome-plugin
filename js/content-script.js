setTimeout(() => {
	console.log('成功加载浏览器插件')

	const baseDataStruct = {
		lastUpdateTime: '',
		lastDiagnosed: 0,
		lastSuspect: 0,
		lastDeath: 0,
		lastCured: 0
	}
	const loopSecond = 2 // 循环一次的时间
	const inputBox = document.querySelector('.send_weibo.S_bg2.clearfix.send_weibo_long').children[1].children[0]
	const reportBtn = document.querySelector('.W_btn_a.btn_30px')
	const storageKey = 'douban_bot_report'
	const reportTimeList = ['8:00', '18:00', '13:44']
	let isNewUser = true
	let isRunning = false
	let dataRecord = {}

	// 请求广播消息
	const getReportMessage = () => new Promise((resolve, reject) => {
		axios.get('https://www.tianqiapi.com/api?version=epidemic&appid=23035354&appsecret=8YvlPNrz')
			.then((res) => {
				let d = res.data.data
				let msg = `最近数据更新时间：${d.date}`
				msg += `\n\n全国数据：确诊：${d.diagnosed} 人，疑似：${d.suspect} 人，死亡：${d.death} 人，治愈：${d.cured} 人`
				if (!isNewUser) {
					// msg += '\n\n相比上次数据：'
				}
				dataRecord.lastUpdateTime = getNowTime()
				dataRecord.lastDiagnosed = d.diagnosed
				dataRecord.lastSuspect = d.suspect
				dataRecord.lastDeath = d.death
				dataRecord.lastCured = d.cured
				saveData()
				// console.log(res.data)
				// console.log('上次数据更新时间', d.date)
				// console.log(`全国数据：确诊：${d.diagnosed} 人，疑似：${d.suspect} 人，死亡：${d.death} 人，治愈：${d.cured} 人`)
				resolve(msg)
			})
	})

	// 检查是否需要广播，需要则发广播
	const checkNeedReport = () => {
		const now = getNowTime()
		if (reportTimeList.indexOf(now) !== -1 && dataRecord.lastUpdateTime !== now) {
			sendReport()
		}
	}

	// 获取当前时间
	const getNowTime = () => {
		return new Date().format("hh:mm")
	}

	// 数据初始化
	const dataInit = () => {
		let d = localStorage.getItem(storageKey)
		if (d !== null) {
			console.log('成功读取存档')
			dataRecord = JSON.parse(data)
			isNewUser = false
		} else {
			console.log('木有存档')
			dataRecord = JSON.parse(JSON.stringify(baseDataStruct))
			isNewUser = true
		}
	}

	// 保存数据
	const saveData = () => {
		localStorage.setItem(storageKey, JSON.stringify(dataRecord))
	}

	// 发射广播
	const sendReport = () => {
		inputBox.focus()
		getReportMessage().then(msg => {
			inputBox.value = msg
			inputBox.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 32, 'which': 32 }))
			setTimeout(() => {
				reportBtn.click()
			}, 0.5 * 1000)
		})
	}

	dataInit()

	setInterval(() => {
		checkNeedReport()
		
	}, loopSecond * 1000)
	// sendReport()

}, 1 * 1000)