import clipboardy from 'clipboardy'

import { randomInt, sleep } from '../../utils/common.js'
import { PROMPT } from '../list/promptList.js'

export async function generatePostByCopilot(client, prompt) {
    const cleanPrompt = prompt.replace(/[\n\r]+/g, ' ').trim()

    const copilotPage = await client.browser.newPage()
    // const copilotPage = await client.browser.newProtectedPage()
    await copilotPage.goto('https://copilot.microsoft.com/chats', { waitUntil: 'networkidle2', timeout: 60000 })
    try {
        const promptTextarea = await copilotPage.waitForSelector('xpath///textarea[@placeholder="Message Copilot"]', { timeout: 60000 })
        await promptTextarea.type(cleanPrompt)

        // await promptTextarea.press('Enter')

        await sleep(1000)
        const sendButton = await copilotPage.waitForSelector('xpath///button[@data-testid="submit-button"]', { timeout: 60000 })
        await sendButton.click()

        await sleep(3000)

        const isTurnstileAppeared = await copilotPage
            .waitForSelector('xpath///div[@class="verifying-container"]', { timeout: 7000 })
            .then(() => true)
            .catch(() => false)
        if (isTurnstileAppeared) {
            client.log(`Turnstile appeared, sleep for solving...`)
            await sleep(20000)
        } else {
            client.log('Waiting for Copilot to generate content...')
            await sleep(20000)
        }

        const coppyAnswerBtn = await copilotPage.waitForSelector('xpath///button[@data-testid="copy-message-button"]', { timeout: 100000 })
        await coppyAnswerBtn.click()

        const copiedText = clipboardy.readSync()
        if (!copiedText) {
            return PROMPT[randomInt(0, PROMPT.length - 1)]
            // throw new Error('Copilot did not return any content.')
        }
        return copiedText
    } catch (error) {
        return PROMPT[randomInt(0, PROMPT.length - 1)]
        // client.err(`Error generating post content from Copilot: ${error.message}`)
        // throw new Error(`Error generating post content from Copilot: ${error.message}`)
    } finally {
        await copilotPage.close()
    }
}
