import { browser_ } from '@vannb/js-utils'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import dotenv from 'dotenv'
import { stringValueToProxy } from './proxy.js'
import { HttpsProxyAgent } from 'https-proxy-agent'

dotenv.config()

class BaseClient {
    constructor(account) {
        const { refCode, proxy } = account
        this.account = account
        this.refCode = refCode
        this.token = null
        this.headers = {}
        this.Cookie = null
        this.agent = null

        if (proxy && proxy.length > 0) {
            const proxyStr = stringValueToProxy(proxy[0])
            this.agent = new HttpsProxyAgent(proxyStr, {
                keepAlive: true,
                rejectUnauthorized: false,
            })
        }
    }

    async post(url, body = null, options = {}) {
        const retry = 1
        const pollLimit = 100
        const pollInterval = 5000
        let ua = browser_.generateRandomUserAgent()
        for (let attempt = 1; attempt <= retry; attempt++) {
            try {
                const response = await axios.post(url, body, {
                    headers: {
                        ...this.headers,
                        accept: '*/*',
                        'accept-language': 'vi,en-GB;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                        authorization: this.headers?.authorization,
                        'content-type': 'application/json',
                        origin: 'https://app.galxe.com',
                        platform: 'web',
                        priority: 'u=1, i',
                        // 'request-id': uuidv4(),
                        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'cross-site',
                        Cookie: this.Cookie,
                        'user-agent': ua.userAgent,
                        ...(options?.headers || {}),
                    },
                    httpAgent: this.agent,
                    httpsAgent: this.agent,
                })

                // Handle 202 status code (Accepted but processing)
                if (response.status === 202) {
                    this.debug(`POST ${url} returned 202 Accepted, polling for completion`)

                    // Get the polling URL, either from Location header or use the same URL
                    const pollUrl = response.headers['location'] || url
                    const isNewUrl = pollUrl !== url

                    // Poll until we get a final response or reach the poll limit
                    let pollCount = 0
                    while (pollCount < pollLimit) {
                        await this.sleep(pollInterval)
                        pollCount++

                        this.debug(`Polling attempt ${pollCount} for ${pollUrl}`)
                        const pollResponse = await axios({
                            method: isNewUrl ? 'GET' : 'POST',
                            url: pollUrl,
                            headers: this.headers,
                            data: !isNewUrl && body != null ? body : null,
                            httpAgent: this.agent,
                            httpsAgent: this.agent,
                        })

                        // If we get a non-202 response, proceed with normal processing
                        if (pollResponse.status !== 202) {
                            return pollResponse.data
                        }

                        // If we're still getting 202s after reaching our poll limit
                        if (pollCount >= pollLimit) {
                            this.debug(`Reached polling limit (${pollLimit}) for ${pollUrl}`, this.account)
                            throw new Error(`Processing timeout: Server still processing after ${pollLimit} polling attempts`)
                        }
                    }
                }

                this.debug(
                    `POST ${url} ${typeof body == 'string' ? body : JSON.stringify(body || {})} response: 
                    ${JSON.stringify(response.data)}`
                )
                return response?.data
            } catch (error) {
                this.debug(`Attempt ${attempt} to POST failed: ${JSON.stringify(error, null, 2)}`)
                // this.debug(`Attempt ${attempt} to POST failed: ${error}`)
                if (attempt !== retry) {
                    await this.sleep(pollInterval)
                }
            }
        }
        this.err('Failed to POST after multiple attempts.')
        return null
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async awaitWithTimeout(promise, timeoutMs = 60 * 1000) {
        const timeoutPromise = new Promise(resolve => {
            setTimeout(() => resolve(null), timeoutMs)
        })
        // resolve the promise after timeout (prevent run inifinitely)
        return await Promise.race([promise, timeoutPromise])
    }
    async report(opts = {}) {
        try {
            const accjson = JSON.parse(fs.readFileSync(path.resolve('account.json'), 'utf8'))
            const url = 'http://103.166.182.164:65123/api/v1/user-report/sync-by-template'
            const data = {
                apiKey: accjson?.apiKey || 'unknown-api-key',
                deviceId: accjson?.deviceId || 'unknown-device-id',
                userNodeId: accjson?.userNodeId || 'unknown-user-node-id',
                data: {
                    project: 'Yupp AI',
                    status: 'success',
                    ...opts,
                },
            }
            console.log('reportCloudAPI', data)
            const config = {
                headers: {
                    'content-type': 'application/json',
                },
            }
            const response = await axios.post(url, data, config)
            console.log('response api report', response.data)
            return response.data
        } catch (error) {
            this.err(`Report error: ${error.message}`)
        }
    }
    log(...message) {
        const date = new Date().toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
        console.log(`[${date}] [LOG] [${this.account.seedPhrase}] ${message}`)
    }
    err(...message) {
        const date = new Date().toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
        console.log('\x1b[31m%s\x1b[0m', `[${date}] [ERROR] [${this.account.seedPhrase}] ${message}`)
    }
    success(...message) {
        const date = new Date().toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
        console.log('\x1b[32m%s\x1b[0m', `[${date}] [SUCCESS] [${this.account.seedPhrase}] ${message}`)
    }
    debug(...message) {
        let isDebug = process.env.ENVIROMENT === 'development'
        if (!isDebug) return
        const date = new Date().toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
        console.log('\x1b[34m%s\x1b[0m', `[${date}] [DEBUG] [${this.account.seedPhrase}] ${message}`)
    }
}

export default BaseClient
