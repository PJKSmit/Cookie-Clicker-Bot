var cookieBotOn = false

function BuyBest() {
    if(cookieBotOn) {
        var fastestReturnOnInvestment = Infinity
        var bestBuilding = Game.ObjectsById[0];
        for(var i = 0; i < Game.ObjectsById.length; i++) {
            building = Game.ObjectsById[i];
            var returnOnInvestement = (building.getSumPrice(1) / building.cps(building)) + (building.getSumPrice(1) / (Game.cookiesPs + 10));
            if(returnOnInvestement < fastestReturnOnInvestment) {
                fastestReturnOnInvestment = returnOnInvestement;
                bestBuilding = building;
            }
        }
        if(bestBuilding.getSumPrice(1) < Game.cookies) {
            bestBuilding.buy(1);
        }
    }
}

function CheckName() {
    if(Game.bakeryNameL.textContent == "start's bakery") {
        cookieBotOn = true;
    } else if (Game.bakeryNameL.textContent == "stop's bakery") {
        cookieBotOn = false;
    }
}

function ClickCookie() {
    if(cookieBotOn) {
        Game.ClickCookie();
    }
}

function init() {
    const clickInterval = setInterval(() => ClickCookie(), 100);
    const buyInterval = setInterval(() => BuyBest(), 1000);
    const nameCheckInterval = setInterval(() => CheckName(), 5000);
}

init();