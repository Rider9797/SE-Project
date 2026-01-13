from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time

service = Service('chromedriver.exe')  
options = Options()
driver = webdriver.Chrome(service=service)

try:

    driver.get("https://se-project-2-fn7s.vercel.app/")
    time.sleep(2)

   
    login_button = driver.find_element(By.XPATH, '//button[span[text()="Login"]]')
    login_button.click()
    time.sleep(2)

    
    driver.find_element(By.ID, "login_email").send_keys("rayedhafeez@yahoo.com")
    driver.find_element(By.ID, "login_password").send_keys("Iamdumb")
    driver.find_element(By.XPATH, '//button[span[text()="Log in"]]').click()

    
    time.sleep(6)


    note_card = driver.find_element(By.CLASS_NAME, "note-card")
    note_card.click()  


    time.sleep(3)


    delete_button = driver.find_element(By.CLASS_NAME, "delete-btn")
    delete_button.click()


    print("Note deleted from the Note Editor!")


    input("Press Enter to exit and close the browser...")



    

except Exception as e:
    print("❌ Test failed:", e)
    