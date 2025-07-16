import BaseClient from '../utils/baseClient.js'
import { initProtectedBrowser, initRealBrowser } from './basic/browser.js'

class YuppClient extends BaseClient {
    constructor(account) {
        super(account)
        this.browser = null
        this.creditDelta = null
        this.currentCreditBalance = null
    }

    async initClient() {
        this.browser = await initRealBrowser(this)
        // this.browser = await initProtectedBrowser(this)
    }

    async updateCookies() {
        const page = await this.browser.newPage()
        // const page = await this.browser.newProtectedPage()
        const cdpClient = await page.createCDPSession()
        let cookies = (await cdpClient.send('Network.getAllCookies')).cookies
        const cookiesString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
        this.Cookie = cookiesString
        await cdpClient.detach()
        await page.close()
    }

    async claimReward(reward) {
        const rewardUrl = reward.rewardUrl.split('?')[0]
        const claimRewardQuery = 'https://yupp.ai/api/trpc/reward.claim?batch=1'

        try {
            const body = {
                0: {
                    json: {
                        rewardId: reward.rewardId,
                    },
                },
            }
            const res = await this.post(claimRewardQuery, body, {
                headers: {
                    baggage: 'sentry-environment=production,sentry-sampled=false',
                    origin: 'https://yupp.ai',
                    referer: rewardUrl,
                    Cookie: this.Cookie,
                },
            })
            const data = res[0]?.result?.data?.json

            if (data?.status == 'claimed') {
                this.success('Successfully claimed reward:')
                this.success(`Claimed point: ${data.creditDelta}`)
                this.success(`Current point: ${data.currentCreditBalance}`)
                this.creditDelta = data.creditDelta
                this.currentCreditBalance = data.currentCreditBalance
            } else {
                this.err(`Failed to claime deward: ${JSON.stringify(res, null, 2)}`)
            }
        } catch (error) {
            throw new Error(`Failed to claim reward: ${error.message}`)
        }
    }
}

export default YuppClient
