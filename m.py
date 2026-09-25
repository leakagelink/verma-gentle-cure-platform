import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        pg=await b.new_page(viewport={"width":393,"height":852})
        for u in ["/","/consultation"]:
            await pg.goto("http://localhost:8080"+u,wait_until="networkidle")
            await pg.screenshot(path=f"m{u.replace('/','_')}.png")
        await b.close()
asyncio.run(main())
