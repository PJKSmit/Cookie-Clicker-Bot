//Data for the graphs. (Debuging only)
/*  
    0. Return on investment for every building and upgrade. 
    1. When the bot bought what 
    2. Cookies per second.
    3. Total cookies baked (all time).
    4. Total cookies baked (this ascension).
*/
var data = [[], [], [], [], [], []];

//Initialize the data variable. (Debuging only)
function InitData() {
    for(var i in Game.Objects) {
        building = Game.Objects[i];
        data[0][building.id] = {x: [], y: [], mode: "lines", name: building.name};
    }
    for(var i in Game.Upgrades) {
        upgrade = Game.Upgrades[i];
        data[0][upgrade.id + Game.ObjectsN] = {x: [], y: [], mode: "lines", name: upgrade.name};
    }
    data[0][data[0].length] = {x: [],y: [], mode: "lines", name: "Lowest return on investment"};
    data[0][data[0].length] = {x: [], y: [], mode: "markers", name: "Golden Cookies"};
    data[2][0] = {x: [], y: [], mode: "lines", name: "Cookies per second"};
    data[3][0] = {x: [], y: [], mode: "lines", name: "Total cookies baked (all time)."};
    data[4][0] = {x: [], y: [], mode: "lines", name: "Total cookies baked (this ascension)."};
}

//Show graph. (Debuging only)
function ShowGraph() {
    var graphWindow = window.open("https://pjksmit.github.io/Cookie-Clicker-Bot/GraphSite.html");
    setTimeout(function(){graphWindow.postMessage(data, "*")}, 1000);
    graphWindow.focus();
}

var clicksPerSecond = 10;
const ascensionReturnOnInvestment = 1000000;

//Game intervals
var clickInterval;
var buyInterval;
var goldenCookieInterval;
var sugarLumpInterval;
var minigameInterval;
var smallAchievementInterval;
const startDate = Date.now() + 7200;

//Best thing to buy
var bestOption;
//For checking if a buff has ended, because the best option should then be recalculated
var oldCpsMult = 0;
var oldClickMult = 0;
var backupHeight = 0;

var cookieBotOn = false;
//True when the first the minigame is unlocked
var playMinigames = false;
//Is the bot currently trying to mutate new plants.
var waitingForPlants = true;
//Does the bot want to ascend.
var wantsToAscend = false;

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
const cursorMultipliers = [1, 4, 45, 950, 19000, 380000, 7600000, 152000000, 3040000000, 60800000000, 1216000000000000, 24320000000000];

//Kitten multipliers.
const kittenMultipliers = [0, 0.1, 0.125, 0.15, 0.175, 0.2, 0.2, 0.2, 0.2, 0.2, 0.175, 0.15, 0.125, 0.115, 0.11, 0.105, 0.1, 0.05];

//Heavenly chip multipliers.
const heavenlyChipMultipliers = [0.05, 0.20, 0.25, 0.25, 0.25];

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
    "Lucky day":                    0.25,
    "Serendipity":                  0.125,
    "Get lucky":                    0.0625,
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

//Grimoire, Pantheon, Garden, Stock market
var minigameUnlockOrder = [7, 6, 2, 5];
var pantheonGods = ["ruin", "mother", "industry"];

//Plants that give bonusses when harvested.
const harvestBonusPlants = ["bakeberry","chocoroot","whiteChocoroot","queenbeet","queenbeetLump","duketater"];

//Order for getting garden plants and which plants they need
const plantOrder = [
    ["thumbcorn","bakerWheat","bakerWheat"],
    ["bakeberry","bakerWheat","bakerWheat"],
    ["cronerice","bakerWheat","thumbcorn"], 
    ["gildmillet","thumbcorn","cronerice"], 
    ["chocoroot","bakerWheat","brownMold"],
    ["whiteMildew","brownMold","brownMold"],
    ["wrinklegill","crumbspore","brownMold"]
    ["doughshroom","crumbspore","crumbspore"],
    ["clover","bakerWheat","gildmillet"],
    ["goldenClover","bakerWheat","gildmillet"],
    ["glovemorel","thumbcorn","crumbspore"],
    ["queenbeet","chocoroot","bakeberry"],
    ["whiteChocoroot","chocoroot","whiteMildew"],
    ["wardlichen","cronerice","whiteMildew"], 
    ["tidygrass","bakerWheat","whiteChocoroot"],
    ["shimmerlily","gildmillet","clover"],
    ["duketater","queenbeet","queenbeet"],
    ["greenRot","clover","whiteMildew"],
    ["elderwort","cronerice","shimmerlily"],
    ["whiskerbloom","whiteChocoroot","shimmerlily"],
    ["keenmoss","brownMold","greenRot"],
    ["cheapcap","crumbspore","shimmerlily"],
    ["foolBolete","greenRot","doughshroom"],
    ["chimerose","whiskerbloom","shimmerlily"],
    ["nursetulip","whiskerbloom","whiskerbloom"],
    ["drowsyfern","chocoroot","keenmoss"],
    ["ichorpuff","crumbspore","elderwort"],
    ["everdaisy","elderwort","tidygrass"],
    ["queenbeetLump","queenbeet","queenbeet"],
    ["shriekbulb","wrinklegill","elderwort"],
    ["buffs", "goldenClover", "nursetulip"]
];

//Which plant in plantOrder is currently planted.
var currentPlant = 0;

//Plants which have special needs for mutatign.
const weirdToMutatePlants = ["shriekbulb", "everdaisy", "queenbeetLump"];

//Configurations for planting (From wiki).
const plantConfigurations = [
    [[0, 1], [0, 2]], //Normal Lvl1
    [[0, 1, 0], [0, 2, 0]], //Normal Lvl2
    [[0, 1, 0], [0, 2, 0], [0, 1, 0]], //Normal Lvl3
    [[0, 0, 0, 0], [2, 1, 1, 2], [0, 0, 0, 0]], //Normal Lvl4
    [[2, 0, 0, 2], [0, 1, 0, 0], [0, 0, 1, 0], [2, 0, 0, 2]], //Normal Lvl5
    [[2, 0, 1, 0, 2], [0, 0, 0, 0, 0], [0, 1, 0, 2, 1], [2, 0, 0, 0, 0]], //Normal Lvl6
    [[1, 0, 0, 1, 0], [2, 0, 0, 2, 0], [0, 0, 0, 0, 0], [1, 0, 0, 1, 0], [2, 0, 0, 2, 0]], //Normal Lvl7
    [[0, 1, 0, 0, 1, 0], [0, 2, 0, 0, 2, 0], [0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 0], [0, 2, 0, 0, 2, 0]], //Normal Lvl8
    [[0, 0, 0, 0, 0, 0], [1, 2, 1, 0, 2, 1], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [1, 2, 0, 1, 2, 1], [0, 0, 0, 0, 0, 0]], //Normal Lvl9
    [[1, 0, 1, 0, 1, 0], [0, 1, 0, 0, 1, 0], [0, 1, 0, 0, 1, 0], [0, 1, 0, 0, 1, 0], [0, 1, 0, 0, 1, 0], [1, 0, 1, 0, 1, 0]], //Shreekbulbs Lvl9
    [[2, 2, 2, 2, 2, 2], [1, 0, 1, 1, 0, 1], [1, 0, 1, 0, 0, 1], [2, 2, 2, 2, 2, 2], [1, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1]], //Everdaisy Lvl9
    [[1, 1, 1, 1, 1, 1], [1, 0, 1, 1, 0, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 0, 1, 1, 0, 1], [1, 1, 1, 1, 1, 1]], //Juicy queenbeet Lvl9
    [[1, 1, 1, 1, 1, 1], [1, 2, 1, 1, 2, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 2, 1, 1, 2, 1], [1, 1, 1, 1, 1, 1]], //Passive effects Lvl9
];

//Values at which the bot should buy or sell stocks on the stockmarket.
const buyValues =   [4.85,  5.45,   7.7,    13.36,  22.25,  31.8,   41.58,  51.33,  61.14,  70.91,  80.74,  90.67,  100.55, 110.46, 120.42];
const sellValues =  [23.97, 31.41,  41.59,  51.29,  61.21,  70.96,  80.90,  90,     97.67,  103.98, 113.33, 123.09, 133.01, 142.94, 152.99];

//Called every second, checks whether the bot has enough cookies to buy the best option.
function BuyBest() {
    Game.popups = 0;
    if(typeof bestOption === "undefined") CalculateBestOption(false);
    if(bestOption.getPrice() < Game.cookies) {
        bestOption.buy(1);
        data[1].push({item: bestOption.name, time: new Date(Date.now() + 7200).toISOString().slice(11, 19)});
        setTimeout(() => CalculateBestOption(false), 75);
    }
}

//Calculates the most effecient thing to buy with the formula: P / B + P / CPS. Where P = the price of the item, B is the extra CPS it gives and CPS is de the current cookies per second.
function CalculateBestOption(byGoldenCookie) {
    var fastestReturnOnInvestment = Infinity;
    //Check the return on investment of all the available buildings.
    for(var i in Game.ObjectsById) {
        if(Game.ObjectsById[i - 1] && Game.ObjectsById[i - 1].amount == 0) break;
        building = Game.ObjectsById[i];
        var returnOnInvestement = BuildingReturnOnInvestment(building);
        if(!byGoldenCookie) {
            data[0][building.id]["x"].push(new Date(Date.now() + 7200).toISOString().slice(11, 19));
            data[0][building.id]["y"].push(Math.round(returnOnInvestement));
        }
        if(returnOnInvestement < fastestReturnOnInvestment) {
            fastestReturnOnInvestment = returnOnInvestement;
            bestOption = building;
        }
    }
    //Check the return on investment of all the available upgrades.
    for(var i in Game.UpgradesInStore) {
        upgrade = Game.UpgradesInStore[i]
        var returnOnInvestement = UpgradeReturnOnInvestment(upgrade);
        if(!byGoldenCookie) {
            data[0][upgrade.id + Game.ObjectsN]["x"].push(new Date(Date.now() + 7200).toISOString().slice(11, 19));
            data[0][upgrade.id + Game.ObjectsN]["y"].push(Math.round(returnOnInvestement));
        }
        if(returnOnInvestement < fastestReturnOnInvestment) {
            fastestReturnOnInvestment = returnOnInvestement;
            bestOption = upgrade;
        }
    }
    if(!byGoldenCookie) {
        data[0][data[0].length - 2]["x"].push(new Date(Date.now() + 7200).toISOString().slice(11, 19));
        data[0][data[0].length - 2]["y"].push(Math.round(fastestReturnOnInvestment));
        data[2][0]["x"].push(new Date(Date.now() + 7200).toISOString().slice(11, 19));
        data[2][0]["y"].push(Game.unbuffedCps);
        data[3][0]["x"].push(new Date(Date.now() + 7200).toISOString().slice(11, 19));
        data[3][0]["y"].push(Game.cookiesEarned);
        data[4][0]["x"].push(new Date(Date.now() + 7200).toISOString().slice(11, 19));
        data[4][0]["y"].push(Game.cookiesEarned + Game.cookiesReset);
    }
    HandleAscension(fastestReturnOnInvestment);
    console.log(bestOption.name + " because " + fastestReturnOnInvestment + " at " + new Date(Date.now() + 7200).toISOString().slice(11, 19));
}

//Calculates the return on investment for buildings
function BuildingReturnOnInvestment(building) {
   var bonus = building.storedCps * Game.globalCpsMult;
    return (building.getSumPrice(1) / bonus) + (Math.max(building.getSumPrice(1) - Game.cookies, 0) / (Game.cookiesPs + clicksPerSecond * Game.computedMouseCps));
}

//Calculates the return on investment for upgrades
function UpgradeReturnOnInvestment(upgrade) {
    var bonus = upgrade.getPrice() / 1000;
    if(upgrade.name in upgradeOverrides) { //Upgrades that do not have a fixed or have an unclear bonus.
    } else if(upgrade.pool == "cookie") { //Cookieupgrades
        bonus = Game.cookiesPs * upgrade.power / 100;
    } else if(upgrade.pool == "") { //Other upgrades
        if(upgrade.icon[0] == 0) { //Cursor
            if(upgrade.tier < 4) {
                bonus = Game.ObjectsById[0].storedTotalCps * Game.globalCpsMult + Game.computedMouseCps * clicksPerSecond
            } else {
                var amountOfBuildings = -Game.ObjectsById[0].amount;
                for(i in Game.Objects) {
                    amountOfBuildings += Game.Objects[i].amount;
                }
                bonus = amountOfBuildings * Game.ObjectsById[0].amount * 0.01 * cursorMultipliers[upgrade.tier - 4];
            }
        } else if(upgrade.icon[0] in icons && (upgrade.icon[1] < 3 || upgrade.icon[1] > 12) && upgrade.icon[1] != 32) { //Non-cursor
            var building = Game.ObjectsById[icons[upgrade.icon[0]]];
            bonus = building.storedCps * building.amount * Game.globalCpsMult;
        } else if(upgrade.icon[0] == 11 && (upgrade.icon[1] < 3 || upgrade.icon[1] > 12) && upgrade.icon[1] != 32) { //Manualclicks
            bonus = clicksPerSecond * Game.cookiesPs / 100;
        } else if(upgrade.icon[0] == 18 && (upgrade.icon[1] < 3 || upgrade.icon[1] > 12) && upgrade.icon[1] != 32) { //Kittens
            var milkMult=1;
			if (Game.Has("Santa's milk and cookies")) milkMult*=1.05;
			milkMult*=1+Game.auraMult("Breath of Milk")*0.05;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod("mother");
				if (godLvl==1) milkMult*=1.1;
				else if (godLvl==2) milkMult*=1.05;
				else if (godLvl==3) milkMult*=1.03;
			}
			milkMult*=Game.eff("milk");
            bonus = Game.cookiesPs * (Game.milkProgress * kittenMultipliers[upgrade.tier] * milkMult) 
        } else if(upgrade.icon = [10, 9]) { //Grandma synergie
            var grandmaNumber = upgrade.buildingTie.id - 1;
            bonus = Game.ObjectsById[1].amount / grandmaNumber * upgrade.buildingTie.storedTotalCps / 100 + Game.ObjectsById[1].storedTotalCps;
        } else if(upgrade.name == "Bingo center/Research facility") { //Bingo center/Research facility: half of the bonus given by the first upgrade.
            bonus = Game.ObjectsById[1].storedTotalCps * 3 * Game.globalCpsMult;
        } else if(upgrade.icon[0] > 14 && upgrade.icon[0] < 20 && upgrade.icon[1] == 7) { //Heavenly chip upgrades
            bonus = Game.prestige * Game.cookiesPs * heavenlyChipMultipliers[-upgrade.icon[0] + 19];
        }
    } else if(upgrade.pool == "tech") { //Tech upgrades
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
    return (upgrade.getPrice() / bonus) + (Math.max(upgrade.getPrice() - Game.cookies, 0) / (Game.cookiesPs + clicksPerSecond * Game.computedMouseCps));
}

//Calculates the return on investment for upgrades
function HandleGoldenCookies(recalculate = true) {
    if (Game.TickerEffect) Game.tickerL.click();
    for(shimmer in Game.shimmers) {
        shimmer = Game.shimmers[shimmer];
        if (shimmer.type == "golden") {
            shimmer.pop();
            data[0][data[0].length - 1]["x"].push(new Date(Date.now() + 7200).toISOString().slice(11, 19));
            data[0][data[0].length - 1]["y"].push(-10000);
            if(recalculate) setTimeout(() => CalculateBestOption(true), 1000);
            HandleGoldenCookies(false);
        }
    }
    cpsMult = 1;
    clickMult = 1;
    for (var i in Game.buffs)
    {
        if(typeof Game.buffs[i].multCpS !== "undefined") cpsMult *= Game.buffs[i].multCpS;
        if(typeof Game.buffs[i].multClick !== "undefined") clickMult *= Game.buffs[i].multClick;
    }
    if(oldCpsMult != cpsMult || oldClickMult != clickMult) CalculateBestOption(true);
    oldCpsMult = cpsMult;
    oldClickMult = clickMult;
}

//Collects and spends sugarlumps
function HandleSugarLumps() {
    if (!Game.canLumps()) return;
    if(Date.now() - Game.lumpT > Game.lumpRipeAge) {
        Game.clickLump();
    }
    if(Game.lumps > 0) {
        SpendSugarLumps();
    }
}

//Spends sugarlumps
function SpendSugarLumps() {
    for(var i in minigameUnlockOrder) {
        building = Game.ObjectsById[minigameUnlockOrder[i]];
        if(!building.level && Game.lumps) {
            playMinigames = true;
            building.levelUp();
            //Start playing minigames
            if(!minigameInterval) minigameInterval = setInterval(() => PlayMinigames(), 1000);
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
    if(!Game.isMinigameReady(Game.Objects["Wizard tower"])) return;
    wizardTower = Game.Objects["Wizard tower"].minigame;
    conjureBakedGoods = wizardTower.spells["conjure baked goods"];
    forceHandOfFate = wizardTower.spells["hand of fate"];
    if(Game.globalCpsMult > 1) { //If there is a cps buff active.
        if(wizardTower.magic > wizardTower.getSpellCost(conjureBakedGoods) && Game.cookiesPs * 60 * 30 < Game.cookies * 0,15 * 2 ) { 
            /* And half an hour worth of cookies is less than 30% (15% is better but otherwise this would never trigger.) 
            of the cookies in the bank and there is enough magic use "Conjure Baked Goods" to add to the buff that already is active.*/
            wizardTower.castSpell(conjureBakedGoods); 
            CalculateBestOption(false);
            return; 
        } else if(wizardTower.magic > wizardTower.getSpellCost(forceHandOfFate)) { //Otherwise try to get another buff from a golden cookie
            wizardTower.castSpell(forceHandOfFate);
            CalculateBestOption(false);
        }
    }
    if(wizardTower.magic / wizardTower.magicM >= 0.95 && wizardTower.magic > wizardTower.getSpellCost(forceHandOfFate)) {//Try to get a golden cookie
        wizardTower.castSpell(forceHandOfFate);
        CalculateBestOption(false);
    }
}

//Worships gods, only swaps them when there are three swaps available. It also deals with the effect of Godzamok, sells the some buildings when it is most effective.
function PlayPantheon() {
    if(!Game.isMinigameReady(Game.Objects["Temple"])) return;
    var temple = Game.Objects["Temple"].minigame;
    for(var i = 0; i < 3; i++) {
        if (temple.swaps < 3) break;
        if (temple.slot[i] != temple.gods[pantheonGods[i]].id) {temple.slotHovered = i; temple.dragging = temple.gods[pantheonGods[i]]; temple.dropGod();}
        CalculateBestOption(false);
    }
    for (var i in Game.buffs) {
        if (typeof Game.buffs[i].multClick != "undefined" && Game.buffs[i].multClick > 1) {
            for(var i in Game.Objects) {
                building = Game.Objects[i];
                if(building.name != "Grandma" && building.storedTotalCps * Game.globalCpsMult / Game.unbuffedCps < 0.01) {
                    building.sell(-1);
                    CalculateBestOption(false);
                } 
            }
        }
    }
}

function PlayGarden() {
    if(!Game.isMinigameReady(Game.Objects["Farm"])) return;
    farm = Game.Objects["Farm"].minigame;
    HarvestGarden(farm);
    PlantGarden(farm);
    //Work In Progress
}

function HarvestGarden(farm) {
    for(var x = farm.plotLimits[farm.parent.level][0]; x < farm.plotLimits[farm.parent.level][2]; x++) {
        for(var y = farm.plotLimits[farm.parent.level][1]; y < farm.plotLimits[farm.parent.level][3]; y++) {
            tile = farm.getTile(x, y);
            if(tile[0]) {
                plant = farm.plantsById[tile[0] - 1];
                if(!plant.unlocked) {
                    if(tile[1] >= plant.mature) {
                        if(plantOrder[currentPlant][0] == plant.key) {currentPlant++; ClearGarden(farm);}
                        farm.harvest(x, y); //Harvest plant if it is not unlocked and it is mature
                    }
                } else if(plant.key in harvestBonusPlants) {
                    if((plantOrder[currentPlant][1] == plant.key || plantOrder[currentPlant][2] == plant.key) && !wantsToAscend) PlantPlant(farm, plant, x, y);
                    if(Game.globalCpsMult > 200) farm.harvest(x, y); //Harvest plant if it gives a Cps boost and one is active already.
                }
                if(tile[1] >= plant.mature - (plant.ageTick + plant.ageTickR)) {
                    if((plantOrder[currentPlant][1] == plant.key || plantOrder[currentPlant][2] == plant.key)  && !wantsToAscend) PlantPlant(farm, plant, x, y);
                    farm.harvest(x, y); //Harvest plant when it is about to die.
                }
            }
        }
    }
}

function PlantGarden(farm) {
    if(!farm.plants["meddleweed"].unlocked) {
        ChangeSoil(farm, "fertilizer");
        return;
    }
    if(currentPlant < 0) currentPlant = 0;
    if(Game.globalCpsMult > 100) return;
    if(!farm.plants["crumbspore"].unlocked || !farm.plants["brownMold"].unlocked) {
        for(var x = farm.plotLimits[farm.parent.level][0]; x < farm.plotLimits[farm.parent.level][2]; x++) {
            for(var y = farm.plotLimits[farm.parent.level][1]; y < farm.plotLimits[farm.parent.level][3]; y++) {
                PlantPlant(farm, "meddleweed", x, y);
                return
            }
        }
        CalculateBestOption(false);
    }
    if(farm.plants[plantOrder[currentPlant][0]].unlocked) {currentPlant++; ClearGarden(farm);}
    if(currentPlant >= plantOrder.length) {
        currentPlant = plantOrder.length - 1;
        PlantConfiguration(farm, plantConfigurations[12], currentPlant);
        waitingForPlants = false;
        return
    }
    plant = plantOrder[currentPlant];
    if(!PlantInGarden(farm, plantOrder[currentPlant][0])) {
        if(!plant[0] in weirdToMutatePlants) {
            PlantConfiguration(farm, plantConfigurations[farm.parent.level], currentPlant);
            CalculateBestOption(false);
        } 
        if(farm.parent.level >= 9) {
            if(plant[0] == "shriekbulb") {
                PlantConfiguration(farm, plantConfigurations[9], currentPlant);
                CalculateBestOption(false);
            } else if(plant[0] == "everdaisy") {
                PlantConfiguration(farm, plantConfigurations[10], currentPlant);
                CalculateBestOption(false);
            } else if(plant[0] == "queenbeetLump") {
                PlantConfiguration(farm, plantConfigurations[11], currentPlant);
                CalculateBestOption(false);
            }
        }
    } 
}

function ChangeSoil(farm, soil) {
    var soil = farm.soils[soil];
    if(farm.soil == soil.id || farm.parent.bought < soil.req) return;
    FireEvent(l("gardenSoil-" + soil.id), "click");
    return;
}

function PlantConfiguration(farm, configuration, plant) {
    totalCost = 0
    for(var y = 0; y < configuration.length; y++) {
        for(var x = 0; x < configuration[y].length; x++) {
            if(configuration[x][y] != 0) totalCost += farm.plants[plantOrder[plant][configuration[x][y]]].cost;
        }
    }
    totalCost *= 60 * Game.cookiesPs;
    if(Game.cookies < totalCost) return;
    for(var y = 0; y < configuration.length; y++) {
        for(var x = 0; x < configuration[y].length; x++) {
            if(configuration[x][y] != 0) PlantPlant(farm, plantOrder[plant][configuration[x][y]], x, y);
        }
    }
}

function PlantPlant(farm, plant, x, y) {
    tile = farm.getTile(x, y);
    if(tile[0] == plant) return;
    if(tile[0] == 0) {farm.useTool(farm.plants[plant].id, x, y); return;}
    if(!farm.plantsById[tile[0]].unlocked) {
        if(tile[1] > farm.plantsById[tile[0]].mature) {
            farm.harvest(x, y);
            farm.useTool(farm.plants[plant].id, x, y);
        }
    } else {
        farm.harvest(x, y);
        farm.useTool(farm.plants[plant].id, x, y);
    }
}

function PlantInGarden(farm, plant) {
    for(var x = farm.plotLimits[farm.parent.level][0]; x < farm.plotLimits[farm.parent.level][2]; x++) {
        for(var y = farm.plotLimits[farm.parent.level][1]; y < farm.plotLimits[farm.parent.level][3]; y++) {
            if(farm.getTile(x, y)[0] = plant) return true;
        }
    }
    return false;
}

function ClearGarden(farm) {
    for(var x = farm.plotLimits[farm.parent.level][0]; x < farm.plotLimits[farm.parent.level][2]; x++) {
        for(var y = farm.plotLimits[farm.parent.level][1]; y < farm.plotLimits[farm.parent.level][3]; y++) {
            tile = farm.getTile(x, y);
            if(tile[0].unlocked || tile[1] >= Game.plantsById[tile[0] - 1].mature) {
                farm.harvest(x, y);
            }
        }
    }
}

function PlayStockMarket() {
    if(!Game.isMinigameReady(Game.Objects["Bank"])) return;
    bank = Game.Objects["Bank"].minigame;
    //buyValue: buyValues[stock.id], sellValue: sellValues[stock.id]
    if (market.brokers < market.getMaxBrokers()) { //Buy brokers
        if (10 * bank.getBrokerPrice() < Game.cookies) {
            l("bankBrokersBuy").click();
            CalculateBestOption(false);
        } 
    }
    if (bank.officeLevel < bank.offices.length-1) { //Upgrade offices
        var office = bank.offices[bank.officeLevel];
        if (office.cost && Game.Objects["Cursor"].amount >= office.cost[0] && Game.Objects["Cursor"].level >= office.cost[1]) {
            l("bankOfficeUpgrade").click();
            CalculateBestOption(false);
        }
      }
    for(var stock in bank.goods) {
        if(stock.val < buyValues[stock.id]) {
            bank.buyGood(stock.id,10000);
            CalculateBestOption(false);
        }
    }

    for(var stock in bank.goods) {
        if(stock.val > sellValues[stock.id]) {
            bank.sellGood(stock.id,10000);
            CalculateBestOption(false);
        }
    }
}

//Small achievements to help the milk multiplier.
function DoSmallAchievements() {
    //Click very fast
    if(!Game.Achievements["Uncanny Clicker"]) for(var i = 0; i < 15; i++) setTimeout(() => Game.ClickCookie(), 50 * i);   
    //Click the news clicker 50 times.
    if(!Game.Achievements["Tabloid addiction"].won)for(var i = 0; i < 50; i++) Game.tickerL.click();
    if(!Game.Achievements["Here you go"].won) Game.Achievements["Here you go"].click();
    if(!Game.Achievements["Tiny cookie"].won) Game.ClickTinyCookie();
    var bakeryName = Game.bakeryName;
    if(!Game.Achievements["God complex"].won) {
        Game.bakeryName = "Orteil"; Game.bakeryNamePrompt(); Game.ConfirmPrompt();
        Game.bakeryName = bakeryName; Game.bakeryNamePrompt(); Game.ConfirmPrompt();
    }
    if(!Game.Achievements["Third-party"].won) Game.Win("Third-party");
    if(!Game.Achievements["Olden days"].won) {
        menu = Game.onMenu;
        Game.ShowMenu("log");
        menuDivs = l("menu").getElementsByTagName("div");
        madeleine = menuDivs[menuDivs.length - 1];
        madeleine.scrollIntoView();
        madeleine.click();
        Game.tickerL.scrollIntoView();
        Game.ShowMenu(menu);
    }
    if(!Game.Achievements["Cookie-dunker"].won && Game.milkProgress>1 && Game.milkHd>0.34) {
        if(backupHeight) {
            Game.LeftBackground.canvas.height = backupHeight;
            backupHeight = 0;
        } else {
            backupHeight = Game.LeftBackground.canvas.height;
            Game.LeftBackground.canvas.height = 400;
            setTimeout(() => UnDunk(), 20*1000);
        }
    }
    if(!Game.Achievements["Stifling the press"].won) {
        savedNarrowSize = Game.tickerTooNarrow;
        Game.tickerTooNarrow = Game.windowW+10;
        Game.tickerL.click();
        Game.tickerTooNarrow = savedNarrowSize;
    }
    if(!Game.Achievements["In her likeness"].won) {
        Game.YouCustomizer.load("9,6,-,3,-,0,3",true);
        // this is already correct, but we need to trigger the change
        Game.YouCustomizer.offsetGene("head",-1);
    }
}

UnDunk = function() {
    if (!Game.Achievements["Cookie-dunker"].won) {
        setTimeout(() => UnDunk(), 20*1000);
        return;
    }
    Game.LeftBackground.canvas.height = backupHeight;
    backupHeight = 0;
}

//Checks the name of the bakery, if the name is start the bot is started and if it is stop the bot stops.
function CheckName() {
    if(!cookieBotOn && Game.bakeryNameL.textContent == "start's bakery") {
        CalculateBestOption(false);
        clickInterval = setInterval(() => Game.ClickCookie(), 1000/clicksPerSecond);
        buyInterval = setInterval(() => BuyBest(), 100);
        goldenCookieInterval = setInterval(() => HandleGoldenCookies(), 1000);
        sugarLumpInterval = setInterval(() => HandleSugarLumps(), 1000);
        smallAchievementInterval = setInterval(() => DoSmallAchievements(), 10000);
        if(playMinigames)  minigameInterval = setInterval(() => PlayMinigames(), 1000);
        cookieBotOn = true;
    } else if (cookieBotOn && Game.bakeryNameL.textContent == "stop's bakery") {
        clearInterval(clickInterval);
        clearInterval(buyInterval);
        clearInterval(goldenCookieInterval);
        clearInterval(sugarLumpInterval);
        clearInterval(smallAchievementInterval);
        clearInterval(minigameInterval);
        cookieBotOn = false;
    }
}

function Init() {
    if (!Game.ready) {
        setTimeout(() => init(), 1000);
        return;
    }
    var nameCheckInterval = setInterval(() => CheckName(), 1000);
    InitData();
}

Init();