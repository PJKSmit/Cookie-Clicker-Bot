var clicksPerSecond = 10;
var minigameUnlockOrder = [7, 6, 2, 5];
var pantheonGods = ["ruin", "mother", "industry"];

//Game intervals
var clickInterval;
var buyInterval;
var goldenCookieInterval;
var sugarLumpInterval;
var minigameInterval;

var bestOption;
var oldLengthBuffsL = 0;

var cookieBotOn = false;
var playMinigames = false;

//What icon corresponds to what building.
const icons = {
    0:  0,
    1:  1,
    2:  2,
    3:  3,
    4:  4,
    15: 5,
    16: 6,
    17: 7,
    5:  8,
    6:  9,
    7:  10,
    8:  11,
    13: 12,
    14: 13,
    19: 14,
    20: 15,
    32: 16,
    33: 17,
    34: 18,
    35: 19
}

//Multiplier of cursor upgrades after tier three.
const cursorMultipliers = [1, 5, 10, 20, 20, 20, 20, 20, 20, 20, 20, 20];

//Kitten multipliers.
const kittenMultipliers = [0, 0.1, 0.125, 0.15, 0.175, 0.2, 0.2, 0.2, 0.2, 0.2, 0.175, 0.15, 0.125, 0.115, 0.11, 0.105, 0.1, 0.05];

//Tech Multipliers.
const techMultipliers = {
    "Specialized chocolate chips":  0.01,
    "Designer cocoa beans":         0.02,
    "Underworld ovens":             0.03,
    "Exotic nuts":                  0.04,
    "Arcane sugar":                 0.05
}

//Overrides for upgrades that do not have a fixed or have an unclear bonus.
const upgradeOverrides = {
    "Lucky day":                    0.5,
    "Serendipity":                  0.5,
    "Get lucky":                    0.5,
    "A crumbly egg":                0.5,
    "A festive hat":                0.1,
    "Reindeer baking grounds":      0.1,
    "Weighted sleighs":             0.1,
    "Ho ho ho-flavored frosting":   0.1,
    "Season savings":               0.01,
    "Toy workshop":                 0.05,
    "Santa\"s bottomless bag":      0.1,
    "Santa\"s helpers":             clicksPerSecond * 0.1,
    "Golden goose egg":             0.05,
    "Faberge egg":                  0.01,
    "Wrinklerspawn":                0.05,
    "Cookie egg":                   clicksPerSecond * 0.1,
    "Omelette":                     0.1,
    "Elder Pledge":                 0.1
}

function CalculateBestOption() {
    var fastestReturnOnInvestment = Infinity;
    for(var i in Game.ObjectsById) {
        if(Game.ObjectsById[i - 1] && Game.ObjectsById[i - 1].amount == 0) break;
        building = Game.ObjectsById[i];
        var returnOnInvestement = BuildingReturnOnInvestment(building);
        if(returnOnInvestement < fastestReturnOnInvestment) {
            fastestReturnOnInvestment = returnOnInvestement;
            bestOption = building;
        }
    }
    for(var i in Game.UpgradesInStore) {
        upgrade = Game.UpgradesInStore[i]
        var returnOnInvestement = UpgradeReturnOnInvestment(upgrade);
        if(returnOnInvestement < fastestReturnOnInvestment) {
            fastestReturnOnInvestment = returnOnInvestement;
            bestOption = upgrade;
        }
    }
    console.log(bestOption.name + " because " + fastestReturnOnInvestment);
}

function BuyBest() {
    Game.popups=0;
    if(typeof bestOption === "undefined") CalculateBestOption();
    if(bestOption.getPrice() < Game.cookies) {
        bestOption.buy(1);
        setTimeout(() => CalculateBestOption(), 75);
    }
}

function CheckName() {
    if(!cookieBotOn && Game.bakeryNameL.textContent == "start's bakery") {
        CalculateBestOption();
        clickInterval = setInterval(() => Game.ClickCookie(), 1000/clicksPerSecond);
        buyInterval = setInterval(() => BuyBest(), 100);
        goldenCookieInterval = setInterval(() => HandleGoldenCookies(), 1000);
        sugarLumpInterval = setInterval(() => HandleSugarLumps(), 1000);
        if(playMinigames)  minigameInterval = setInterval(() => PlayMinigames(), 1000);
        cookieBotOn = true;
    } else if (cookieBotOn && Game.bakeryNameL.textContent == "stop's bakery") {
        clearInterval(clickInterval);
        clearInterval(buyInterval);
        clearInterval(goldenCookieInterval);
        clearInterval(sugarLumpInterval);
        clearInterval(minigameInterval);
        cookieBotOn = false;
    }
}

function BuildingReturnOnInvestment(building) {
   var bonus = building.storedCps * Game.globalCpsMult;
    return (building.getSumPrice(1) / bonus) + (Math.max(building.getSumPrice(1) - Game.cookies, 0) / (Game.cookiesPs + 10));
}

function HandleGoldenCookies() {
    if (Game.TickerEffect) Game.tickerL.click();
    for(shimmer in Game.shimmers) {
        shimmer = Game.shimmers[shimmer];
        if (shimmer.type == "golden") {
            shimmer.pop();
            CalculateBestOption();
        }
    }
    if(oldLengthBuffsL > Game.buffsL.length) CalculateBestOption();
}

function HandleSugarLumps() {
    if (!Game.canLumps()) return;
    if(Date.now() - Game.lumpT > Game.lumpRipeAge) {
        Game.clickLump();
    }
    if(Game.lumps > 0) {
        SpendSugarLumps();
    }
}

function SpendSugarLumps() {
    for(var i in minigameUnlockOrder) {
        building = Game.ObjectsById[minigameUnlockOrder[i]];
        if(!building.level && Game.lumps) {
            playMinigames = true;
            building.levelUp();
            minigameInterval = setInterval(() => PlayMinigames(), 1000);
        }
    }
    farm = Game.ObjectsById[2];
    if(farm.level < 9 && Game.lumps > farm.level) {farm.levelUp(); return;}
    cursor = Game.ObjectsById[0];
    if(cursor.level < 12 && Game.lumps > cursor.level) {cursor.levelUp(); return;}
    if(farm.level == 9 && Game.lumps > farm.level + 94) {farm.levelUp(); return;}
    if(cursor.level < 20 && Game.lumps > cursor.level + 95) {cursor.levelUp(); return;}
    for(var i in Game.Objects) {
        building = Game.Objects[i];
        if(building.level < 10 && Game.lumps > building.level + 100) {building.levelUp(); return;}
    }
}

function PlayMinigames() {
    PlayGrimoire();
    PlayPantheon();
    PlayGarden();
    PlayStockMarket();
}

function PlayGrimoire() {
    wizardTower = Game.Objects["Wizard tower"].minigame;
    if(!Game.isMinigameReady(Game.Objects["Wizard tower"])) return;
    conjureBakedGoods = wizardTower.spells["conjure baked goods"];
    forceHandOfFate = wizardTower.spells["hand of fate"];
    if(Game.cookiesPs / Game.unbuffedCps > 100) { //If there is a cps buff active.
        if(wizardTower.magic > wizardTower.getSpellCost(conjureBakedGoods) && Game.cookiesPs * 60 * 30 < Game.cookies * 0,15 * 2 ) { 
            /* And half an hour worth of cookies is less than 30% (best is 15% but sacrifices are necessary) 
            of the cookies in the bank and there is enough magic use 'Conjure Baked Goods' to add to the buff that already is active.*/
            wizardTower.castSpell(conjureBakedGoods); 
            CalculateBestOption();
            return; 
        } else if(wizardTower.magic > wizardTower.getSpellCost(forceHandOfFate)) { //Otherwise try to get another buff from a golden cookie
            wizardTower.castSpell(forceHandOfFate);
            CalculateBestOption();
        }
    }
    if(wizardTower.magic / wizardTower.magicM >= 0.95 && wizardTower.magic > wizardTower.getSpellCost(forceHandOfFate)) {//Try to get a golden cookie
        wizardTower.castSpell(forceHandOfFate);
        CalculateBestOption();
    }
}

function PlayPantheon() {
    var temple = Game.Objects["Temple"].minigame;
    if(!Game.isMinigameReady(Game.Objects["Temple"])) return;
    for(var i = 0; i < 3; i++) {
        if (temple.swaps < 3) break;
        if (temple.slot[i] != temple.gods[pantheonGods[i]].id) {temple.slotHovered = i; temple.dragging = temple.gods[pantheonGods[i]]; temple.dropGod();}
        CalculateBestOption();
    }
    for (var i in Game.buffs)
    {
        if (typeof Game.buffs[i].multClick != 'undefined' && Game.buffs[i].multClick > 1) {
            for(var i in Game.Objects) {
                building = Game.Objects[i];
                if(building.name != "Grandma" && building.storedTotalCps * Game.globalCpsMult / Game.unbuffedCps < 0.01) {
                    building.sell(-1);
                    CalculateBestOption();
                } 
            }
        }
    }
}

function PlayGarden() {
    //Work In Progress
}

function PlayStockMarket() {
    //Work In Progress
}

function UpgradeReturnOnInvestment(upgrade) {
    var bonus = upgrade.getPrice() / 1000;
    //Upgrades that do not have a fixed or have an unclear bonus.
    if(upgrade.name in upgradeOverrides) {
        bonus = upgradeOverrides[upgrade.name] * Game.cookiesPs;
    }
    //Cookieupgrades
    if(upgrade.pool == "cookie") {
        bonus = Game.cookiesPs * upgrade.power / 100;
    //buildingupgrades
    } else if(upgrade.pool == "") {
        //Cursor
        if(upgrade.icon[0] == 0) {
            if(upgrade.tier < 4) {
                bonus = Game.ObjectsById[0].storedCps * Game.ObjectsById[0].amount * Game.globalCpsMult + Game.computedMouseCps * clicksPerSecond
            } else {
                var amountOfBuildings = -Game.ObjectsById[0].amount;
                for(i in Game.Objects) {
                    amountOfBuildings += Game.Objects[i].amount;
                }
                bonus = amountOfBuildings * 0.01 * cursorMultipliers[upgrade.tier - 4];
            }
        //Non-cursor
        } else if(upgrade.icon[0] in icons && (upgrade.icon[1] < 3 || upgrade.icon[1] > 12) && upgrade.icon[1] != 32) {
            var building = Game.ObjectsById[icons[upgrade.icon[0]]];
            if(typeof building === "undefined") console.log(icons[upgrade.icon[0]]);
            bonus = building.storedCps * building.amount * Game.globalCpsMult;
        //Manualclicks
        } else if(upgrade.icon[0] == 11 && (upgrade.icon[1] < 3 || upgrade.icon[1] > 12) && upgrade.icon[1] != 32) {
            bonus = clicksPerSecond * Game.cookiesPs / 100;
        //Kittens
        } else if(upgrade.icon[0] == 18 && (upgrade.icon[1] < 3 || upgrade.icon[1] > 12) && upgrade.icon[1] != 32) {
            var milkMult=1;
			if (Game.Has('Santa\'s milk and cookies')) milkMult*=1.05;
			milkMult*=1+Game.auraMult('Breath of Milk')*0.05;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('mother');
				if (godLvl==1) milkMult*=1.1;
				else if (godLvl==2) milkMult*=1.05;
				else if (godLvl==3) milkMult*=1.03;
			}
			milkMult*=Game.eff('milk');
            bonus = Game.cookiesPs * (Game.milkProgress * kittenMultipliers[upgrade.tier] * milkMult)
        //Grandma synergie 
        } else if(upgrade.icon = [10, 9]) {
            var grandmaNumber = upgrade.buildingTie.id - 1;
            bonus = Game.ObjectsById[1].amount / grandmaNumber * upgrade.buildingTie.storedTotalCps / 100 + Game.ObjectsById[1].storedTotalCps;
        //Bingo center/Research facility: half of the bonus given by the first upgrade. (Completely arbitrary)
        } else if(upgrade.name == "Bingo center/Research facility") {
            bonus = Game.ObjectsById[1].storedTotalCps * 3;
        }
    //Tech upgrades
    } else if(upgrade.pool == "tech") {
        if(upgrade.name in techMultipliers) bonus = Game.cookiesPs * techMultipliers[upgrade.name];
        else if(upgrade.name == "Ritual rolling pins") bonus = Game.ObjectsById[1].storedTotalCps;
        else if(upgrade.name == "One mind" || upgrade.name == "Communal brainsweep") {
            grandma = Game.ObjectsById[1];
            bonus = grandma.storedCps / grandma.baseCps * grandma.amount * 0.02 * grandma.amount; //+ elderWrath effect, communal brainsweep might not be worth it
        } else if(upgrade.name == "Elder Pact") {
            grandma = Game.ObjectsById[1];
            bonus = grandma.storedCps / grandma.baseCps * grandma.amount * 0.05 * Game.ObjectsById[10];
        }
    }
    return (upgrade.getPrice() / bonus) + (Math.max(upgrade.getPrice() - Game.cookies, 0) / (Game.cookiesPs + 10));
}

function init() {
    if (!Game.ready) {
        setTimeout(() => init(), 1000);
        return;
    }
    var nameCheckInterval = setInterval(() => CheckName(), 1000);
}

init()