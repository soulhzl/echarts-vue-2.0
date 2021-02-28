export default class socketService {
    // 单例
    static instance = null
    static get Instance() {
        if (!this.instance) {
            this.instance = new socketService()
        }
        return this.instance
    }

    // ws对象
    ws = null
    // 回调方法
    callbackMapping = {}
    // 连接状态
    connected = false
    // 重连次数
    sendRetryCount = 0
    // 重新连接尝试的次数
    connectRetryCount = 0
    // 连接
    connect() {
        if (!window.WebSocket) {
            return console.log('浏览器不支持ws')
        }
        this.ws = new WebSocket('ws://soulhzl.top:8002/ws')
        // this.ws = new WebSocket('ws://192.168.1.145:7001/ws')
        // 连接成功
        this.ws.onopen = () => {
            // console.log('open')
            this.connected = true
            this.connectRetryCount = 0
        }
        // 服务器连接失败
        // 连接成功后服务器关闭
        this.ws.onclose = () => {
            // console.log('close')
            this.connected = false
            this.connectRetryCount++
            setTimeout(() => {
                this.connect()
            }, this.connectRetryCount * 500);
        }
        this.ws.onmessage = (e) => {
            let res = JSON.parse(e.data)
            // console.log(res)
            const socketType = res.socketType
            if (this.callbackMapping[socketType]) {
                const action = res.action
                if (action == 'getData') {
                    const realData = JSON.parse(res.data)
                    this.callbackMapping[socketType].call(this, realData)
                } else if (action == 'fullScreen') {
                    this.callbackMapping[socketType].call(this, res)
                } else if (action == 'themeChange') {
                    this.callbackMapping[socketType].call(this, res)
                }
            }
        }
    }
    // 发送信息
    send(data) {
        if (this.connected) {
            // console.log(data.chartName)
            this.sendRetryCount = 0
            this.ws.send(JSON.stringify(data))
        } else {
            this.sendRetryCount++
            setTimeout(() => {
                this.send(data)
            }, this.sendRetryCount * 500);
        }
    }
    // 注册回调事件
    registerCallback(socketType, callback) {
        this.callbackMapping[socketType] = callback
    }
    // 注销回调事件
    unregisterCallback(socketType) {
        this.callbackMapping[socketType] = null
    }
}