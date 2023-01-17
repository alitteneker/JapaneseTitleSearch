const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const cheerio = require('cheerio');


const controllEHonPage = async function(page, english_keywords) {
    await page.goto("https://www.e-hon.ne.jp/bec/EB/Top");
    
    await page.type("#textfield", english_keywords);
    await page.click("#speedsearch");
    
    await page.waitForSelector("#wideMain,#noResultError");
    await page.goto((await page.url()) + "&categoryNavigate=cbt&sortSel=3");
    await page.waitForSelector("#wideMain,#noResultError");

    const html = await page.content();
    let $ = cheerio.load(html);
    
    const items = $("#wideMain .info");
    
    const return_data = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        
        const data = {
            title: $(item).find('.title > a', item).text().replace(/^\s*/, "").replace(/\s*$/, ""),
            author: $(item).find('p:nth-of-type(2)', item).text(),
            url: $(item).find('.title > a', item).attr('href'),
            ISBN: $(item).find('span.codeSelect').text()
        };
        
        // filter out books without a valid ISBN, as they are unlikely to be findable elsewhere
        if (!data.ISBN || data.ISBN.match(/[a-zA-Z]+/g)) {
            continue;
        }
        
        return_data.push(data);
    }
    
    return return_data;
};


let cluster = null;
const searchForTitle = async function(english_keywords) {
    if (!cluster) {
        cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 4,
            timeout: 150 * 1000,
            puppeteerOptions: {
                headless: false
            }
        });
        await cluster.task(async ({ page, data: keywords }) => {
            return await controllEHonPage(page, keywords);
        });
    }

    return await cluster.execute(english_keywords);
};

module.exports = searchForTitle;