function init() {
    Game.Notify("CookieBot", Game.Objects[0].getSumPrice(1), 1, 100);
    const clickInterval = setInterval(() => Game.ClickCookie(), 20)
    if (Game.Objects[0].getSumPrice(1) < Game.cookies) {
        Game.Notify("CookieBot", "Buy", 1, 100);
        Game.Objects[0].buy(1);
    }
}
init();