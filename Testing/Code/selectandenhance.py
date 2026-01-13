from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Setup ChromeDriver
service = Service('chromedriver.exe')  # Make sure this path is correct
options = Options()
driver = webdriver.Chrome(service=service, options=options)

try:
    # Step 1: Open the site
    driver.get("https://se-project-2-fn7s.vercel.app/")
    time.sleep(2)

    # Step 2: Login
    driver.find_element(By.XPATH, '//button[span[text()="Login"]]').click()
    time.sleep(2)
    driver.find_element(By.ID, "login_email").send_keys("rayedhafeez@yahoo.com")
    driver.find_element(By.ID, "login_password").send_keys("Iamdumb")
    driver.find_element(By.XPATH, '//button[span[text()="Log in"]]').click()
    time.sleep(10)  # Let the dashboard load

    # Step 3: Open the first note
    driver.find_element(By.CLASS_NAME, "note-card").click()
    time.sleep(5)

    # Step 4: Click the "Enhance Text" AI tool
    enhance_button = driver.find_element(By.XPATH, '//div[@class="note-item ai-tool-item"][.//span[text()="Enhance Text"]]')
    enhance_button.click()

    # Step 5: Enter prompt in modal
    prompt_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//textarea[contains(@class, "ant-input")]'))
    )
    prompt_input.send_keys("Make this more concise and engaging.")

    # Step 6: Click the Enhance button inside the modal
    submit_btn = driver.find_element(By.XPATH, '//button[span[text()="Enhance"]]')
    submit_btn.click()

    # Step 7: Wait for the sidebar (drawer) with AI response
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//div[contains(@class, "ant-drawer-body")]'))
    )

    print("✅ Enhance Text response displayed in sidebar.")

    # Keep browser open
    input("Press Enter to exit...")

except Exception as e:
    print("❌ Test failed:", e)

finally:
    driver.quit()
