import { initProtectedBrowser, initRealBrowser } from '../src/core/basic/browser.js'
import { PROMPT } from '../src/core/list/promptList.js'
import { generatePostByCopilot } from '../src/core/yuppActions/copilot.js'
import YuppClient from '../src/core/yuppClient.js'
import { randomInt, sleep } from '../src/utils/common.js'

let account = {
    seedPhrase: 'wedding clog clog shy cute elegant spatial horse topple biology birth never',
    gmail: 'sinhtest002@gmail.com',
    gmailPassword: 'Anhzer020',
    proxy: ['atrwivtp-3243:h9650xbw7gco@p.webshare.io:80'],
}

const yuppClient = new YuppClient(account)

// const browser = await initRealBrowser(yuppClient)
const browser = await initProtectedBrowser(yuppClient)

// const page = await browser.newPage()
const page = await browser.newProtectedPage()

await sleep(100000000)
