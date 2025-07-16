import { randomInt, sleep, sleepRandom } from '../../utils/common.js';
import { evaluateAnswer } from './evaluateAnswer.js';

export async function sendPrompt(client, page, prompt, evaluation) {
    client.log(`Sending: ${prompt}`)
    await page.goto('https://yupp.ai', { waitUntil: 'domcontentloaded', timeout: 100000 })

    let rewardUrl, rewardId

    const pageUrl = await page.url()
    if (pageUrl.includes('get-started')) {
        rewardUrl = 'https://yupp.ai/get-started'

        const html = await page.content()
        // tim vi tri cua rewardId
        const match = html.indexOf('\\"rewardId\\":\\"');
        // slice  36 là độ dài của rewardId
        rewardId = html.slice(match + 15, match + 15 + 36)
        await sleep(3000)

        return { rewardUrl, rewardId }
    }

    const messageInput = await page.waitForSelector('textarea[name="message"]')
    await messageInput.type(prompt, { delay: randomInt(100, 200) })

    await sleepRandom(1000, 3000)
    const submitBtn = await page.waitForSelector('button[type="submit"]')

    const [response] = await Promise.all([
        page.waitForResponse(response => {
            rewardUrl = response.url()
            return rewardUrl.includes('/chat/') && rewardUrl.includes('stream=true') && !rewardUrl.includes('_rsc=') && response.status() === 200
        }, { timeout: 100000 }),
        await submitBtn.click()
    ])

    let rawText = await response.text()

    // Bắt rewardId từ chuỗi bằng regex
    let match = rawText.match(/"rewardId"\s*:\s*"([a-f0-9-]+)"/)
    rewardId = match[1]

    client.log('Sending, waiting for complete...')
    await page.waitForSelector('[data-testid="stop-streaming-button"]', {
        hidden: true,
        timeout: 10000,
    })

    await evaluateAnswer(client, page, evaluation)

    return { rewardUrl, rewardId }
}