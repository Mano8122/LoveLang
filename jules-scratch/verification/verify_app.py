from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:5173/')

    # Wait for the popup to be visible
    page.wait_for_selector('div.fixed.inset-0', timeout=60000)

    page.fill('input[id="whatsapp"]', '+14155552671')
    page.fill('input[id="recipient"]', 'Jane Doe')
    page.click('button[type="submit"]')

    # Wait for the URL to change, indicating a successful transition
    page.wait_for_url('**/', timeout=60000)

    page.wait_for_selector('textarea')

    page.fill('textarea', 'This is a test message.')
    page.click('button[type="submit"]')

    page.wait_for_selector('div:has-text("Message sent with love!")')

    page.screenshot(path='jules-scratch/verification/verification.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
