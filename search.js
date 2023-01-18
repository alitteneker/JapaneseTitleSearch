const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const cheerio = require('cheerio');


const controlBookfinderPage = async function(page, ISBN) {
    const URL = `https://www.bookfinder.com/search/`
        +`?author=&title=&lang=en&submitBtn=Search&new_used=N&destination=jp&currency=USD&binding=*`
        + `&isbn=` + ISBN
        + `&keywords=&minprice=&maxprice=&publisher=&min_year=&max_year=&mode=advanced&st=sr&ac=qr`;
        
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    await page.goto(URL);
    
    // do something
    
    return null;
}


const controllEHonPage = async function(page, english_keywords) {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    
    await page.goto("https://www.e-hon.ne.jp/bec/EB/Top");
    
    await page.type("#textfield", english_keywords);
    await page.click("#speedsearch");
    
    console.log("...Searching...");
    
    await page.waitForSelector("#wideMain,#noResultError");
    console.log("...Filtering...");
    await page.goto((await page.url()) + "&categoryNavigate=cbt");//&sortSel=3");
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


const getPageCluster = (function() {
    let _cluster = null;
    return async function() {
        if (!_cluster) {
            _cluster = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_CONTEXT,
                maxConcurrency: 4,
                timeout: 150 * 1000,
                puppeteerOptions: {
                    headless: true
                }
            });
        }
        return _cluster;
    }
})();

const searchForTitle = async function(english_keywords) {
    return await (await getPageCluster()).execute(english_keywords, async ({ page, data: keywords }) => {
        return await controllEHonPage(page, keywords);
    });
};

const searchForISBN = async function(ISBN) {
    return await (await getPageCluster()).execute(ISBN, async ({ page, data: isbn }) => {
        return await controlBookfinderPage(page, isbn);
    });
}

module.exports = {
    "forTitle": searchForTitle,
    "forISBN": searchForISBN
};