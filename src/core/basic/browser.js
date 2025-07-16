import path from 'path'
import proxyChain from 'proxy-chain'
import puppeteer from 'puppeteer-extra'
import { connect } from 'puppeteer-real-browser'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { stringValueToProxy } from '../../utils/proxy.js'
import { protectedBrowser } from 'puppeteer-afp'
import { proxy_ } from '@vannb/js-utils'

puppeteer.use(StealthPlugin())

export async function initRealBrowser(client) {
    let proxies = client.account.proxy || []
    const proxyServer = proxies.length > 0 ? await proxyChain.anonymizeProxy(stringValueToProxy(proxies[0])) : null

    // check proxy working
    if (proxies.length > 0) {
        client.log(`Check proxy: ${proxies[0]}`)
        const isProxyWorking = await proxy_.checkProxy(proxies[0])
        if (!isProxyWorking) {
            throw new Error(`Proxy error: Proxy ${proxies[0]} is not working. Try to change another proxy.`)
        } else {
            client.success(`Proxy ${proxies[0]} is working.`)
        }
    }

    return (
        await connect({
            args: [
                // `--disable-extensions-except=${DISCORD_LOGIN_PATH}`,
                // `--load-extension=${DISCORD_LOGIN_PATH}`,
                proxyServer ? `--proxy-server=${proxyServer}` : '',
                '--window-size=1280,800',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            customConfig: {
                userDataDir: null,
            },
            connectOption: {
                defaultViewport: null,
            },
            turnstile: true,
            headless: false,
            disableXvfb: false,
        })
    ).browser
}

export async function initProtectedBrowser(client) {
    let proxies = client.account.proxy || []
    const proxyServer = proxies.length > 0 ? await proxyChain.anonymizeProxy(stringValueToProxy(proxies[0])) : null
    const browser = (
        await connect({
            args: [
                // `--disable-extensions-except=${DISCORD_LOGIN_PATH}`,
                // `--load-extension=${DISCORD_LOGIN_PATH}`,
                proxyServer ? `--proxy-server=${proxyServer}` : '',
                '--window-size=1280,800',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            customConfig: {
                userDataDir: null,
            },
            connectOption: {
                defaultViewport: null,
            },
            turnstile: true,
            headless: false,
            disableXvfb: false,
        })
    ).browser

    const options = {
        canvasRgba: [0, 0, 0, 0], //all these numbers can be from -5 to 5
        webglData: {
            3379: 32768, //16384, 32768
            3386: {
                0: 32768, // 8192, 16384, 32768
                1: 32768, // 8192, 16384, 32768
            },
            3410: 2, // 2, 4, 8, 16
            3411: 2, // 2, 4, 8, 16
            3412: 16, // 2, 4, 8, 16
            3413: 2, // 2, 4, 8, 16
            7938: 'WebGL 1.0 (OpenGL Chromium)', // "WebGL 1.0", "WebGL 1.0 (OpenGL)", "WebGL 1.0 (OpenGL Chromium)"
            33901: {
                0: 1,
                1: 1, // 1, 1024, 2048, 4096, 8192
            },
            33902: {
                0: 1,
                1: 4096, // 1, 1024, 2048, 4096, 8192
            },
            34024: 32768, //16384, 32768
            34047: 8, // 2, 4, 8, 16
            34076: 16384, //16384, 32768
            34921: 16, // 2, 4, 8, 16
            34930: 16, // 2, 4, 8, 16
            35660: 2, // 2, 4, 8, 16
            35661: 32, // 16, 32, 64, 128, 256
            35724: 'WebGL GLSL ES', // "WebGL", "WebGL GLSL", "WebGL GLSL ES", "WebGL GLSL ES (OpenGL Chromium)"
            36347: 4096, // 4096, 8192
            36349: 8192, // 1024, 2048, 4096, 8192
            37446: 'HD Graphics', // "Graphics", "HD Graphics", "Intel(R) HD Graphics"
        },
        fontFingerprint: {
            noise: 1, // -1, 0, 1, 2
            sign: +1, // -1, +1
        },
        audioFingerprint: {
            getChannelDataIndexRandom: 0.7659530895341677, // all values of Math.random() can be used
            getChannelDataResultRandom: 0.7659530895341677, // all values of Math.random() can be used
            createAnalyserIndexRandom: 0.7659530895341677, // all values of Math.random() can be used
            createAnalyserResultRandom: 0.7659530895341677, // all values of Math.random() can be used
        },
        webRTCProtect: true, //this option is used to disable or enable WebRTC disabling by destroying get user media
    }

    const securedBrowser = await protectedBrowser(browser)
    return securedBrowser
}
