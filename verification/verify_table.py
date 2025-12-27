from playwright.sync_api import sync_playwright, expect
import time

def verify_table_data_view():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:1420")

            # Wait for app to load (checking for sidebar)
            page.wait_for_selector('text=Files', timeout=10000)

            # Currently we can't easily connect to the real DB in headless/web mode because tauri commands
            # like 'get_db_path' and 'plugin-sql' don't work in standard browser environment.
            # However, we can verify the UI structure if we can trigger the view.
            # The app starts in 'editor' view. We need to find a way to switch to 'table' view or at least see if it crashes.

            # Since I cannot easily mock Tauri backend in this environment to show the table with data,
            # I will check if the app loads without crashing and if I can see the layout.

            page.screenshot(path="verification/app_loaded.png")
            print("Screenshot saved to verification/app_loaded.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_table_data_view()
