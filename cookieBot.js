function init() {
    Game.Notify("CookieBot", "Hello",1,100);
    const clickInterval = setInterval(() => Game.ClickCookie(), 4)
}
init();