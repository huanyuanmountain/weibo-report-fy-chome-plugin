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
	const eventManager = new EventTarget()
	const storageKey = 'weibo_bot_report'
	const reportTimeList = ['06:00', '18:00',]
	let isNewUser = true
	let isRunning = false
	let dataRecord = {}

	// 请求广播消息
	const getReportMessage = () => new Promise((resolve, reject) => {
		axios.get('https://www.tianqiapi.com/api?version=epidemic&appid=23035354&appsecret=8YvlPNrz')
			.then((res) => {
				// console.log(res.data)
				let d = res.data.data
				let msg = `最近数据更新时间：${d.date}`
				msg += `\n\n全国数据：确诊：${d.diagnosed} 人，疑似：${d.suspect} 人，死亡：${d.death} 人，治愈：${d.cured} 人`

				if (!isNewUser) {
					msg += `\n\n相比上次数据：确诊：${parseComparisonMsg(d.diagnosed, dataRecord.lastDiagnosed)} 人，疑似：${parseComparisonMsg(d.suspect, dataRecord.lastSuspect)} 人，死亡：${parseComparisonMsg(d.death, dataRecord.lastDeath)} 人，治愈：${parseComparisonMsg(d.cured, dataRecord.lastCured)} 人`
				}

				dataRecord.lastUpdateTime = getNowTime()
				dataRecord.lastDiagnosed = d.diagnosed
				dataRecord.lastSuspect = d.suspect
				dataRecord.lastDeath = d.death
				dataRecord.lastCured = d.cured
				saveData()
				resolve(msg)
			})
	})

	// 解析对比信息，对比上次和这次的信息
	const parseComparisonMsg = (cur, lat) => {
		let str = lat >= cur ? '减少 ' : '增加 '
		str += Math.abs(lat - cur)
		return str
	}

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
			dataRecord = JSON.parse(d)
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

	// 创建控制层
	const createLayer = () => {
		const layer = document.createElement('div')
		layer.style = 'display: block; padding: 0px; margin: 0px; z-index: 99999; position: fixed; top:60px; left: 60px; background-color:rgba(255,255,255,0.8);'
		document.body.appendChild(layer)
		return layer
	}

	// 创建开关按钮
	const createSwitchButton = (layer) => {
		const btn = document.createElement('button')
		btn.innerText = 'bot 开关'
		btn.style = 'margin: 3px;font-size: 10px;'
		layer.appendChild(btn)
		btn.onclick = switchBot
	}

	// 日志创建标签
	const createMessageLog = (layer) => {
		const prg = document.createElement('p')
		prg.innerText = 'log view \n'
		prg.style = 'margin: 3px;font-size: 10px;line-height:15px'
		prg.id = 'message-log-prg'
		layer.appendChild(prg)
	}

	// 创建控制面板
	const createPanel = () => {
		let layer = createLayer()
		createSwitchButton(layer)
		createMessageLog(layer)
	}

	// bot 开关
	const switchBot = () => {
		isRunning = !isRunning
		eventManager.dispatchEvent(new Event('refreshMsg'))
	}

	// 事件初始化
	const eventListenerInit = () => {
		eventManager.addEventListener('refreshMsg', refreshMessageLog)
	}

	// 刷新 log
	const refreshMessageLog = () => {
		try {
			const prg = document.getElementById('message-log-prg')
			let str = isRunning ? '机器人正在运行 (ง •_•)ง' : '机器人休息中 (～﹃～)~zZ'
			str += '\n发布消息时间：'
			for (let i = 0; i < reportTimeList.length; i++) {
				str += '\n' + reportTimeList[i]
			}
			prg.innerText = str
		} catch (e) {
			console.log('逃避了一个错误 refreshMessageLog')
		}
	}

	const main = () => {
		dataInit()
		createPanel()
		eventListenerInit()

		eventManager.dispatchEvent(new Event('refreshMsg'))

		setInterval(() => {
			if (isRunning) {
				checkNeedReport()
				// console.log('working...')
			}
		}, loopSecond * 1000)
	}

	main()

}, 1 * 1000)