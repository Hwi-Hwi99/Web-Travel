const { Builder, By, until } = require('selenium-webdriver');
 
 const testCases = [
   {
     email: 'abc123@gmail.com',
     password: '123456',
     expectedResult: true,
   },
 ];
 
 async function loginTest(driver, email, password) {
   await driver.get('http://localhost:3000/');
   let loginBtn = await driver.findElement(By.className('loginBtn'));
   await loginBtn.click();
   await driver.wait(until.urlContains('/login'), 3000);
 
   let emailInput = await driver.findElement(By.css('input[type="text"]'));
   await emailInput.clear();
   await emailInput.sendKeys(email);
 
   let passwordInput = await driver.findElement(
     By.css('input[type="password"]'),
   );
   await passwordInput.clear();
   await passwordInput.sendKeys(password);
 
   let loginButton = await driver.findElement(By.className('login-btn'));
   await loginButton.click();
 
   const loginSuccess = await driver
     .wait(async () => {
       const user = await driver.executeScript(
         "return localStorage.getItem('user');",
       );
       return user !== null;
     }, 2500)
     .catch(() => false);
 
   console.log(
     loginSuccess
       ? `PASSED ✅ Đăng nhập thành công: ${email}`
       : `FAILED ❌ Đăng nhập thất bại: ${email}`,
   );
   return loginSuccess;
 }
 
 const flightSearchCases = [
   {
     from: 'Hồ Chí Minh',
     to: 'Hà Nội',
     date: '03/31/2025',
     expectedResult: true,
   },
   { from: '', to: 'Phú Quốc', date: '03/31/2025', expectedResult: false }, // Thiếu điểm đi
 ];
 async function flightSearchTest(driver, from, to, date, expectedResult) {
   await driver.get('http://localhost:3000/');
 
   let fromInput = await driver.findElement(By.className('from-input'));
   await fromInput.clear();
   await fromInput.sendKeys(from);
 
   let toInput = await driver.findElement(By.className('to-input'));
   await toInput.clear();
   await toInput.sendKeys(to);
 
   let dateInput = await driver.findElement(By.className('date-input'));
   await dateInput.clear();
   await dateInput.sendKeys('3312025');
 
   let btnFind = await driver.findElement(
     By.xpath("//*[contains(@class, 'btnFind')]"),
   );
   await btnFind.click();
 
   const searchSuccess = await driver
     .wait(async () => {
       let currentURL = await driver.getCurrentUrl();
       return currentURL.includes('/ticketplane');
     }, 3000)
     .catch(() => false);
 
   console.log(
     searchSuccess === expectedResult
       ? `PASSED ✅ Tìm chuyến bay thành công: ${from} -> ${to}`
       : `FAILED ❌ Tìm chuyến bay thất bại: ${from} -> ${to}`,
   );
 }
 
 (async function runTests() {
   let driver = await new Builder().forBrowser('MicrosoftEdge').build();
 
   try {
     for (const testCase of testCases) {
       await driver.manage().window().maximize();
       let loginSuccess = await loginTest(
         driver,
         testCase.email,
         testCase.password,
       );
 
       if (loginSuccess) {
         console.log('🔍 Bắt đầu kiểm thử tìm chuyến bay...');
         for (const flightCase of flightSearchCases) {
           await flightSearchTest(
             driver,
             flightCase.from,
             flightCase.to,
             flightCase.date,
             flightCase.expectedResult,
           );
         }
       }
 
       await driver.executeScript('localStorage.clear();');
     }
   } catch (error) {
     console.error('Lỗi trong quá trình kiểm thử:', error);
   } finally {
     await driver.quit();
   }
 })();