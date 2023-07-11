function BuyBestSimple() {
    if(Game.ObjectsById[0].getSumPrice(1) < Game.cookies) {
        Game.ObjectsById[0].buy(1);
    }
    for(var upgrade of Game.UpgradesInStore) {
        if(!upgrade.bought) {
            if(upgrade.getPrice() < Game.cookies) {
                upgrade.buy(true);
            }
        }
    }
}

function BuyBest() {
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

function init() {
    const clickInterval = setInterval(() => Game.ClickCookie(), 100);
    const buyInterval = setInterval(() => BuyBest(), 1000);
}

init();