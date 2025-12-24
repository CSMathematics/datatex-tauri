
import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_math_toolbar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context with larger viewport to see the toolbar
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        try:
            # Navigate to the app (assuming default port 1420 for Tauri/Vite)
            page.goto("http://localhost:1420")

            # Wait for the app to load
            page.wait_for_selector("text=Start Page", timeout=10000)

            # Use get_by_text with exact=False to find "Empty File" card title
            # In StartPage.tsx: title="Empty File"
            print("Clicking 'Empty File'...")
            page.get_by_text("Empty File", exact=True).click()

            # Wait for editor to load
            print("Waiting for editor...")
            page.wait_for_selector(".monaco-editor", timeout=20000)

            time.sleep(5) # Give extra time for React rendering and Monaco mounting

            # The LeftMathToolbar should be visible now because it is a .tex file (Untitled.tex)
            # We can verify it exists. It has a Stack with width 40.
            # We can try to screenshot the area.

            print("Taking screenshot...")
            page.screenshot(path="verification/math_toolbar_visible.png")
            print("Screenshot saved to verification/math_toolbar_visible.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_math_toolbar()
