function init() {
    Game.Notify("CookieBot", "Hi", 1, 100);
    console.log(Game.Objects[0].getSumPrice(1)); 
    const clickInterval = setInterval(() => Game.ClickCookie(), 20);
    if (Game.Objects[0].getSumPrice(1) < Game.cookies) {
        Game.Notify("CookieBot", "Buy", 1, 100);
        Game.Objects[0].buy(1);
    }
}
init();