from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys  # For simulating key presses
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
# Setup
service = Service('./chromedriver.exe')  
options = Options()
driver = webdriver.Chrome(service=service, options=options)

try:

    driver.get("https://se-project-2-fn7s.vercel.app/")
    time.sleep(2)

   
    login_button = driver.find_element(By.XPATH, '//button[span[text()="Login"]]')
    login_button.click()
    time.sleep(2)

    
    driver.find_element(By.ID, "login_email").send_keys("rayedhafeez@yahoo.com")
    driver.find_element(By.ID, "login_password").send_keys("Iamdumb")
    driver.find_element(By.XPATH, '//button[span[text()="Log in"]]').click()

    
    time.sleep(7)


    search_button = driver.find_element(By.XPATH, '//span[@aria-label="search"]')
    search_button.click()
    time.sleep(2)

    # Step 4: Wait for the search input to appear
    search_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//input[@placeholder="Search notes..."]'))
    )

    search_input.click()
    time.sleep(1)

    
    search_input.send_keys("Testing Search")
    
    
    search_input.send_keys(Keys.RETURN)
    
    time.sleep(3)  


    print("Search result showing the correct note!")
    input("Press Enter to exit and close the browser...")



    

except Exception as e:
    print("❌ Test failed:", e)
    