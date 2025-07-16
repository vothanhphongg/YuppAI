import { PROMPT } from '../src/core/list/promptList.js'
import { generatePostByCopilot } from '../src/core/yuppActions/copilot.js'
import YuppClient from '../src/core/yuppClient.js'
import { randomInt } from '../src/utils/common.js'

let account = {
    seedPhrase: 'wedding clog clog shy cute elegant spatial horse topple biology birth never',
    gmail: 'sinhtest002@gmail.com',
    gmailPassword: 'Anhzer020',
    proxy: ['atrwivtp-3243:h9650xbw7gco@p.webshare.io:80'],
}

const yuppClient = new YuppClient(account)
await yuppClient.initClient()
const generatePrompt = await generatePostByCopilot(yuppClient, `Generate a prompt to ask AI about this topic, maximum length of prompt is 100 words. Do not add explanations or follow-up questions: "${PROMPT[randomInt(0, PROMPT.length - 1)]}"`)

console.log('🚀 ~ generatePrompt: ', generatePrompt)
