const puppeteer = require('puppeteer');
const fs = require('fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const loginURL = 'https://admin.alwaysdata.com/login/?next=/';
    
    // 从GitHub Secrets中读取账号密码信息
    const ACCOUNTS_JSON = process.env.ACCOUNTS_JSON;
    const ACCOUNTS = JSON.parse(ACCOUNTS_JSON);

    try {
        for (let account of ACCOUNTS) {
            await login(page, loginURL, account);
        }
    } catch (error) {
        console.error('登录过程出现错误:', error);
    } finally {
        await browser.close();
    }
})();

async function login(page, loginURL, account) {
    const { username, password } = account;
    await page.goto(loginURL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#id_login');
    await page.type('#id_login', username, { delay: 50 });
    await page.waitForSelector('#id_password');
    await page.type('#id_password', password, { delay: 50 });

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]')
    ]);

    const loginSuccess = await page.evaluate(() => {
        return !document.querySelector('form#form-login');
    });

    if (loginSuccess) {
        console.log(`登录成功: ${username}`);
    } else {
        console.log(`登录失败: ${username}`);
    }
}