describe('permission.ng', function() {

  var demoUrl = 'http://localhost:8000/test/e2e/permission-ng/assets/demo.html';

  it('should load page without errors', function() {
    browser.get(demoUrl);

    var doUiViewLoaded = element(by.tagName('article')).isDisplayed();
    expect(doUiViewLoaded).toBeTruthy();
  });

  it('should hide nav elements for not logged in user', function() {
    browser.get(demoUrl);

    var workBtnPresent = element(by.id('work')).isDisplayed();
    var pinBtnPresent = element(by.id('pin')).isDisplayed();
    var toggleMenuBtnPresent = element(by.id('toggle-menu')).isDisplayed();

    expect(workBtnPresent).toBeFalsy();
    expect(pinBtnPresent).toBeFalsy();
    expect(toggleMenuBtnPresent).toBeFalsy();
  });

  it('should reveal nav elements after login', function() {
    browser.get(demoUrl);

    element(by.id('authorize')).click();
    element(by.id('toggle-menu')).click();

    var workBtnPresent = element(by.id('work')).isDisplayed();
    var pinBtnPresent = element(by.id('pin')).isDisplayed();
    var toggleMenuBtnPresent = element(by.id('toggle-menu')).isDisplayed();

    expect(workBtnPresent).toBeTruthy();
    expect(pinBtnPresent).toBeTruthy();
    expect(toggleMenuBtnPresent).toBeTruthy();
  });

  it('should navigate logged user to protected states', function() {
    browser.get(demoUrl);

    element(by.id('authorize')).click();
    element(by.id('work')).click();

    expect(browser.getLocationAbsUrl()).toBe('/#work');
  });
});