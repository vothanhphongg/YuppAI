import fs from 'fs'
import { Mutex } from 'async-mutex'

import YuppClient from './src/core/yuppClient.js'
import { nextCycle, randomInt, sleep, sleepRandom } from './src/utils/common.js'
import { sendPrompt } from './src/core/yuppActions/sendPrompt.js'
import { PROMPT } from './src/core/list/promptList.js'
import { loginGoogle } from './src/core/basic/loginGoogle.js'
import { generatePostByCopilot } from './src/core/yuppActions/copilot.js'

const mutex = new Mutex()

async function processAccount(account) {
    const yuppClient = new YuppClient(account)
    const { gmail, gmailPassword } = account
    await mutex.runExclusive(async () => {
        let maxRetries = 1
        let retry = 0

        yuppClient.log(`Processing account...`)
        while (retry < maxRetries) {
            retry++
            try {
                // Initialize client
                await yuppClient.initClient()
                const page = await loginGoogle(yuppClient, gmail, gmailPassword)
                while (yuppClient.creditDelta != 0) {
                    yuppClient.log(`Generating prompt and evaluating answer...`)
                    const generatePrompt = await generatePostByCopilot(yuppClient, `Generate a prompt to ask AI about this topic, maximum length of prompt is 100 words. Do not add explanations or follow-up questions: ${PROMPT[randomInt(0, PROMPT.length - 1)]}`)
                    const generateEval = await generatePostByCopilot(yuppClient, 'Write a short, random, positive review with no specific topic, review about the answer of AI. Maximum length is 30 words')
                    yuppClient.success(`Successfully generated prompt and evaluation post`)

                    yuppClient.log('Sending prompt and evaluating answer...')
                    const reward = await sendPrompt(yuppClient, page, generatePrompt, generateEval)
                    yuppClient.success(`Successfully sent prompt and evaluated answer`)

                    await sleepRandom(5000, 10000)

                    yuppClient.log(`Claiming reward...`)
                    await yuppClient.updateCookies()
                    await yuppClient.claimReward(reward)

                    yuppClient.log(`Sleeping before next prompt...`)
                    await sleepRandom(10000, 20000)
                }

                yuppClient.success(`Successfully processed account`)

                await yuppClient.report({
                    account: account.seedPhrase,
                    point: yuppClient.currentCreditBalance,
                })
                break
            } catch (error) {
                yuppClient.err(`Error processing account, attempt [${retry}/${maxRetries}]: ${error.message}`)
                if (error.message.includes('Proxy error') || error.message.includes('Gmail not found') || error.message.includes('Gmail password is wrong')) {
                    await yuppClient.report({
                        account: account.seedPhrase,
                        status: error?.message?.toString(),
                    })
                    break
                }
                if (retry >= maxRetries) {
                    yuppClient.err(`Max retries reached, skipping account...`)
                    await yuppClient.report({
                        account: account.seedPhrase,
                        status: error?.message?.toString(),
                    })
                } else {
                    yuppClient.log(`Retrying in 5 seconds...`)
                    await sleep(5000)
                }
            } finally {
                if (yuppClient.browser) {
                    await yuppClient.browser.close()
                    await sleep(5000) // sleep to wait chrome to close properly
                }
            }
        }
    })

    yuppClient.log(`Account processing completed, waiting for the next cycle...`)
    nextCycle().then(() => processAccount(account))
}

async function main() {
    const accounts = JSON.parse(fs.readFileSync('./account.json', 'utf-8')).account
    const batchSize = 10
    console.log(`Total accounts: ${accounts.length}`)

    for (let i = 0; i < accounts.length; i += batchSize) {
        const batch = accounts.slice(i, i + batchSize)
        await Promise.all(batch.map(processAccount))
    }
}

main()
