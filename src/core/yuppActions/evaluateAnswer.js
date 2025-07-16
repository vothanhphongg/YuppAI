import { randomInt, sleep, sleepRandom } from '../../utils/common.js'

export async function evaluateAnswer(client, page, prompt) {
    client.log('Generating evaluate answer...')

    await page.waitForFunction(() => {
        const buttons = [...document.querySelectorAll('button')]
        return buttons.some(btn => btn.innerText.includes('I prefer this') && !btn.disabled)
    })

    // Sau đó tìm và click đúng nút đó
    await page.evaluate(() => {
        const buttons = [...document.querySelectorAll('button')]
        const targetBtn = buttons.find(btn => btn.innerText.includes('I prefer this') && !btn.disabled)
        if (targetBtn) targetBtn.click()
    })

    await sleepRandom(1000, 3000)

    await page.waitForSelector('div[role="group"]')
    await sleepRandom(1000, 3000)

    const groups = await page.$$('div[role="group"]')
    const goodEvalBtns = await groups[0].$$('button')
    const badEvalBtns = await groups[1].$$('button')

    let tempBtn = 0
    for (let i = 0; i < randomInt(1, 4); i++) {
        let checkBtn = randomInt(0, 4)
        if (tempBtn != checkBtn) {
            await goodEvalBtns[checkBtn].click()
            tempBtn = checkBtn
        }
    }

    tempBtn = 0
    for (let i = 0; i < randomInt(1, 4); i++) {
        let checkBtn = randomInt(0, 4)
        if (tempBtn != checkBtn) {
            await badEvalBtns[checkBtn].click()
            tempBtn = checkBtn
        }
    }

    client.log('Waiting for evaluation input...')
    const evalInput = await page.waitForSelector('textarea[data-testid="model-feedback-textarea"]')
    // await evalInput.type(prompt, { delay: randomInt(100, 300) })
    await page.evaluate(
        (el, value) => {
            el.value = value
            el.dispatchEvent(new Event('input', { bubbles: true }))
            el.dispatchEvent(new Event('change', { bubbles: true }))
        },
        evalInput,
        prompt
    )

    await sleep(2000)
    const sendBtn = await page.waitForSelector('xpath///button[text()="Send feedback"]')
    await sendBtn.click()

    await sleepRandom(2000, 5000)
}
