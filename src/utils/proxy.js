export const stringValueToProxy = proxy => {
    proxy = proxy.replace(/[\n\r\s]/g, '').trim() // remove space, \n, \r and trim
    if (!proxy.startsWith('http')) {
        if (!proxy.includes('@')) {
            let [host, port, user, password] = proxy.split(':')
            if (user && password) {
                if (user.indexOf('.') > 0 && isFinite(+password) && +password > 0 && +password < 65536) {
                    proxy = `${host}:${port}@${user}:${password}`
                } else {
                    proxy = `${user}:${password}@${host}:${port}`
                }
            } else if (host && port) {
                proxy = `${host}:${port}`
            }
        }
        proxy = `http://${proxy}`
    }
    try {
        new URL(proxy)
    } catch (e) {
        throw new Error('proxy is not valid')
    }
    return proxy
}
