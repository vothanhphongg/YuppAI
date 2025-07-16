import { sleep } from '../../utils/common.js'

export async function loginGoogle(client, username, password) {
    const page = await client.browser.newPage()
    // const page = await client.browser.newProtectedPage()
    try {
        await page.goto('https://yupp.ai', { waitUntil: 'domcontentloaded', timeout: 100000 })

        const loginGoogleBtn = await page.waitForSelector('xpath//html/body/main/div/div[2]/div[2]/div[3]/button')
        await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), loginGoogleBtn.click()])

        let usernameInput = await page.waitForSelector('xpath///*[@id="identifierId"]', { timeout: 100000 })
        await usernameInput.type(username)
        await sleep(2000)

        let nextBtn = await page.waitForSelector('xpath///*[@id="identifierNext"]/div/button')
        await nextBtn.click()

        const isAccountErrorAppeared = await page
            .waitForSelector('xpath///*[contains(text(),"Couldn’t find your Google Account")]', { timeout: 10000 })
            .then(() => true)
            .catch(() => false)

        if (isAccountErrorAppeared) {
            client.err('Gmail not found.')
            throw new Error('Gmail not found.')
        }

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})

        let passwordInput = await page.waitForSelector('xpath///*[@id="password"]/div[1]/div/div[1]/input', { visible: true, timeout: 100000 })
        await passwordInput.type(password)
        await sleep(2000)

        const loginBtn = await page.waitForSelector('xpath///*[@id="passwordNext"]/div/button')
        await loginBtn.click()

        const isPasswordErrorAppeared = await page
            .waitForSelector('xpath///*[contains(text(),"Wrong password. Try again or click Forgot password to reset it.")]', { timeout: 10000 })
            .then(() => true)
            .catch(() => false)

        if (isPasswordErrorAppeared) {
            client.err('Gmail password is wrong.')
            throw new Error('Gmail password is wrong.')
        }

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
        await sleep(2000)

        const acceptBtn = await page.$('xpath///*[@id="yDmH0d"]/c-wiz/div/div[3]/div/div/div[2]/div/div/button')
        if (acceptBtn) {
            await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), await acceptBtn.click()])
        }

        const verifyCheck = await page.$('xpath///*[@id="headingText"]/span')
        if (verifyCheck) {
            client.log('Process verify account...')
            try {
                await page.waitForNavigation({ timeout: 100000, waitUntil: 'networkidle2' })
                client.success('Verify account success!')
            } catch (error) {
                throw new Error(`Failed to verify account: ${error.message}`)
            }
        }

        client.success('Login Google account success!')
        await sleep(2000)
        return page
    } catch (error) {
        throw new Error(`Failed to login Google account: ${error.message}`)
    }
}
