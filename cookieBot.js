function init() {
    Game.Notify("CookieBot", "Hello",1,100);
    const clickInterval = setInterval(() => Game.ClickCookie(), 20)
    if (Game.Objects[0].getSumPrice(checkAmount) < Game.cookies) {
        Game.Notify("CookieBot", "Buy",1,100);
        Game.Objects[0].buy(1);
    }
}
init();