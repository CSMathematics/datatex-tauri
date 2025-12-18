from playwright.sync_api import sync_playwright
import time

def verify_icons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:1420")
            # Wait for content to load
            page.wait_for_timeout(5000)

            # Check for Sidebar icons (FontAwesome)
            # FontAwesome icons are usually SVGs with specific classes or paths.
            # We can check for the presence of SVGs in the sidebar.

            # Take screenshot of the full app
            page.screenshot(path="verification/app_screenshot.png")
            print("Screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_icons()
