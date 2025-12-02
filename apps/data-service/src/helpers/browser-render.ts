import puppeteer from "@cloudflare/puppeteer";

export async function renderGuideToPdf(env: Env, htmlContent: string) {
    const browser = await puppeteer.launch(env.VIRTUAL_BROWSER);
    const page = await browser.newPage();

    // Set content and wait for network idle to ensure images load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '2cm',
            right: '2cm',
            bottom: '2cm',
            left: '2cm'
        }
    });

    await browser.close();

    return Uint8Array.from(pdf);
}
