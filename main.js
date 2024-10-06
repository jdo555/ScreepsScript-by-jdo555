/////////////////////////////////
//// AUTHOR: Jacob Olson     ////
//// GITHUB: jdo555          ////
/////////////////////////////////
//// ScreepsScript by jdo555 ////
/////////////////////////////////

// this object is meant to be used together with the function travelToTargetRoom
// it is formatted such that the travelObject has target-room-names as keys, and each target-room-name points to an object that has current-room-names as keys...
// ... each current-room-name points to a coordinate-pair telling how to go to "get closer to" the target-room from within the current-room
// ... these coordinate-pairs must always be a room's edge-coordinates, thus ensuring that travelling to them leads a creep to a new room, (and eventually the target-room)
// ! the primary purpose of this object and its related function is optimization; in order to avoid high-CPU calls to moveTo, where a single creep's movement might max out CPU
// !!! note that this object is meant to be manually (and admittedly tediously) filled out; a more convenient alternative might involve using room memory to hold ...
// ... route directions (having this room memory automatically filled out by something like a scout creep...)
var travelObject = {
    W16S22: {
        W16S21: [30,49],
        W16S20: [26,49],
        W17S20: [49,25],
        W18S20: [49,25],
        W19S20: [49,34],
        W19S21: [32,0],
        W19S22: [38,0],
    },
    W18S22: {
        W19S22: [49,22],
    },
    W19S22: {
        W18S22: [0,23],
    },
};

// makes creep move to a specified room according to the data in the above "travel object"
// roomType must be 0 or 1 or something else...
// ... if 0, then creep will go to the room designated by targetRoom in its memory
// ... if 1, then creep will return to base (assuming base is set in memory)
// ... if something else, then passedRoomName is the target, and it must be a valid value
// ! this function will trigger warnings or errors depending on the severity of the issue
function travelToTargetRoom(creep, roomType = 0, passedRoomName) {
    let targetRoomName;
    if (roomType == 0) {
        targetRoomName = creep.memory.targetRoom;
        if (!targetRoomName) {
            console.log("WARNING: targetRoom must be set in creep's memory! (for creep "+creep.name+")");
            return;
        }
    } else if (roomType == 1) {
        targetRoomName = creep.memory.base;
    } else {
        if (!passedRoomName) {
            throw new Error("Did not pass a room name to the function, travelToTargetRoom!");
        } else {
            targetRoomName = passedRoomName;
        }
    }
    let coords;
    let innerTravelObject = travelObject[targetRoomName];
    if (innerTravelObject) {
        coords = innerTravelObject[creep.room.name];
    }
    if (coords == undefined) {
        if (innerTravelObject) {
            console.log("WARNING: coords is undefined for the room "+creep.room.name+" when traveling to "+targetRoomName+".");
        } else {
            console.log ("WARNING: "+targetRoomName+" is not provided as key in travelObject!");
        }
    } else {
        // ! note the options for the moveTo function: maxRooms should be 1 to work properly with "travelObject"; and reusePath is high to save CPU
        creep.moveTo(coords[0], coords[1], {maxRooms: 1, reusePath: 40, visualizePathStyle: {stroke: '#ffffff'}});
    }
}

// GENERAL CONSTANTS

const ROOM_MEMORY_SET = "roomMemorySet";
const MAIN_STRUCTURES = "mainStructures";
const OVERSEER_POSITION = "overseerPosition";
const OVERSEER_POSITION_SET = "overseerPositionSet";
const TOWERCHARGER_POSITION = "towerChargerPosition";
const TOWERCHARGER_POSITION_SET = "towerChargerPositionSet";
const SOURCES = "sources";
const SOURCES_SET = "sourcesSet";
const HARVESTING_MINE = "harvestingMine";
const HARVESTING_MINE_SET = "harvestingMineSet";
const UPGRADE_MINE = "upgradeMine";
const UPGRADE_MINE_SET = "upgradeMineSet";
const DROP_MINES = "dropMines";
const DROP_MINES_SET = "dropMinesSet";
const LINK_MINES = "linkMines";
const LINK_MINES_SET = "linkMinesSet";
const RESET_ROADBLOCK_LOCATIONS = "resetRoadblockLocations";
const ROADBLOCK_LOCATIONS = "roadblockLocations";
const ROADBLOCK_LOCATIONS_SET = "roadblockLocationsSet";
const CONTROLLER_LINK = "controllerLink";
const CONTROLLER_LINK_SET = "controllerLinkSet";
const WAIT_LOCATION = "waitLocation";
const WAIT_LOCATION_SET = "waitLocationSet";
const EXTRACTOR_LOCATION = "extractorLocation";
const EXTRACTOR_LOCATION_SET = "extractorLocationSet";
const INNER_FORTIFICATIONS = "innerFortifications";
const INNER_FORTIFICATIONS_SET = "innerFortificationsSet";
const OUTER_FORTIFICATIONS = "outerFortifications";
const OUTER_FORTIFICATIONS_SET = "outerFortificationsSet";
const AUTO_ROADS = "autoRoads";
const AUTO_ROADS_SET = "autoRoadsSet";
const MANUAL_ROADS = "manualRoads";
const MANUAL_ROADS_SET = "manualRoadsSet";

const DROPMINER_MIN_CONTROLLER_LEVEL = 4;
const DROPMINER_MAX_CONTROLLER_LEVEL = 5;
const LINKMINER_MIN_CONTROLLER_LEVEL = 5;
const CONTROLLER_LINK_LATE_CLVL = 7;
const CONTROLLER_LINK_EARLY_CLVL = 6;
const EXTRACTOR_MIN_CONTROLLER_LEVEL = 6;
const FORTIFICATIONS_MIN_CONTROLLER_LEVEL = 5;

const CONTROLLER_LINK_MIN_ENERGY = 400;
const MAXIMUM_AMOUNT_TO_TRANSFER_TO_CONTROLLER_LINK = 1000 - CONTROLLER_LINK_MIN_ENERGY; // 1000 is the maximum capacity of any link
const MINIMUM_AMOUNT_TO_TRANSFER_TO_CONTROLLER_LINK = 150; // ! this value must be less than the above constant's value, and must not exceed the cLvl 6 overseer's carrying capacity

const ROAD = "road";
const FORT = "fort";
const MAIN = "main";
const IDS = "IDs";
const INDEX = "index";
const REGIS = "toRegister";
const SITE = "site";

// GENERAL FUNCTIONS

// creates and returns a string version of a coordinate (mostly for use in a set or other object...)
function coordToString(coord) {
    return ""+coord[0]+","+coord[1];
}

// reverses the process of the function coordToString
// ! note that this function assumes that str is of correct format
function stringToCoord(str) {
    let arr = str.split(',');
    return [Number(arr[0]), Number(arr[1])];
}

// returns a simple array that is based on the passed RoomPosition object
function posObjToCoordArray(pos) {
    return [pos.x, pos.y];
}

// returns a string formatted in the same way as the function coordToString that is based a the passed RoomPosition object
function posObjToCoordString(pos) {
    return ""+pos.x+","+pos.y;
}

// returns all the valid coordinates, as an array of coordinate pairs, around an [x,y] coordinate according to reach
function getCoordsByRange(x, y, reach) {
    const gridMax = 49;
    let coords = [];
    for (let i = -reach; i <= reach; i++) {
        for (let j = -reach; j <= reach; j++) {
            let c = [x+i, y+j];
            if (c[0] < 0 || c[0] > gridMax || c[1] < 0 || c[1] > gridMax || (i == 0 && j == 0)) { // if coord out-of-bounds or at center...
                // ignore this coord
            } else {
                coords.push(c);
            }
        }
    }
    return coords;
}

// collects and returns, as an array, the selected "details" about all structures of a given type that exist in a given room based on the contents of the room's memory
// ! note that structures that are not listed in the room's memory will not be found; also, only structures within the scope of the current controller-level are considered
// detail should be a string that is also the name of the given structure's property, such as "id" or "name"
// ! this function is most commonly used to collect all IDs of a given structure type for a specified room
function getStructureDetailsByRoomMemory(curRoom, structType, detail) {
    let allDetails = [];
    let obj = curRoom.memory[MAIN_STRUCTURES];
    // for all controller levels up to the current level...
    for (let i = 1; i <= curRoom.controller.level; i++) {
        if (obj[i][structType]) { // if structure exists in room memory at given controller level
            // for each coordinate pair where this structure can be found
            for (let coord of obj[i][structType]) {
                // for each structure found at those coordinates
                for (let struct of curRoom.lookForAt(LOOK_STRUCTURES, coord[0], coord[1])) {
                    if (struct.structureType == structType) { // if this structure is the sought after one...
                        allDetails.push(struct[detail]);
                        break; // structure was found, so stop examining other structures at same location
                    }
                }
            }
        }
    }
    return allDetails;
}

// returns a single "detail" for a structure in a given room, from the passed memory-object by the passed controller level
// ! note this this is mostly a convenience and efficiency function, hence the passing of an already collected memory object, for example
// as with the previous function, detail should be a string that is also the name of the given structure's property, such as "id" or "name"
// roomMemoryObj must be a valid memory object; more specifically it is curRoom.memory[MAIN_STRUCTURES]
// controllerLevel is required to be passed, again, for the sake of efficiency (to save CPU)
// !!! perhaps this function may cause errors as base destruction occurs?
// !!! should it return something specific in case the structure is not found?
function getSingleStructureDetailsByRoomMemory(curRoom, structType, detail, roomMemoryObj, controllerLevel) {
    let coords = roomMemoryObj[controllerLevel][structType];
    if (coords) { // if the memory lookup succeeds...
        // setting coord to be the first coordinate pair in coords
        let coord = coords[0];
        // for each structure found at coord
        for (let struct of curRoom.lookForAt(LOOK_STRUCTURES, coord[0], coord[1])) {
            if (struct.structureType == structType) { // if this structure is the sought after one...
                return struct[detail];
            }
        }
    } else {
        throw new Error("The function getSingleStructureDetailsByRoomMemory was misused somewhere!");
    }
}

/////////////////////////////////////////////////

// the following class holds base-specific data, such that every "base" created in-game has a corresponding class associated with it
// every such base object is held onto by a later class, the ScreepsScript class, such that any base can be looked up by name in a hash-table
// this class has many base-specific methods, such as...
// ... ones that collect IDs of all different structures in the base,
// ... ones to determine proper harvesting locations within the base,
// ... ones to indicate (with efficiency) good targets for workers,
// ... ones to find and deal with hostiles within the base, etc....
// perhaps the most important method in this group is the performTickBasedChecks method, which handles all tasks that are done each and every in-game tick
// ! most of the below hold onto IDs because in-game objects are recreated each tick, thereby making it useless (except for tick-based operations) to hold onto the object itself
// !!! note that if a base is lost, a re-execution must be done... for various reasons...
class Base {
    constructor(roomName, roleCountObject, baseNum) {
        this.baseName = roomName; // the name of the room with the controller
        this.baseNumber = baseNum; // the number of the base (starting with 0); used primarily for timing the spawn-checks and some tick-based checks; also is used in creep names merely to ensure uniqueness
                                   // ! note that baseNumber can change at code re-commit (such as when a base is lost or a new base is claimed [thereby making current creep-names irrelevant])
        this.roleCounts = roleCountObject; // roleCounts for this base specifically
        this.spawnNames = this.getSpawnNamesForBase(); // all spawn names in the given room, in an array
        this.centralPos = this.getCentralPosition(); // in format [x, y]
        this.towerIDs = this.getTowerIDsForBase(); // all tower IDs in the room, in an array; many of the below are similar...
        this.sourceIDs = this.getSourceIDsForBase();
        // mine section
        // ! note that the ordering of mine creation is very important due to precedence of mine-type
        this.upgradeMine = null; // an object that has the upgradeMine id, the creep who works it, and the position; there can only be one upgradeMine per base and only when there are at least 2 sources
        this.prepareUpgradeMineDataForBase();
        this.linkMines = this.prepareMineArrayAtInit(); // an array of fixed size, that relates to the room-memory array for sources; each element is either a linkMine object or is undefined...
        this.centralLinkID = null;
        this.controllerLinkID = null;
        this.linkIDs = this.prepareLinkDataAndGetLinkIDsForBase();
        this.dropMines = this.prepareMineArrayAtInit(); // an array of fixed size, that relates to the room-memory array for sources; each element is either a dropMine object or is undefined...
        this.containerIDs = this.prepareDropminesAndGetContainerIDsForBase();
        this.harvestingMines = this.prepareMineArrayAtInit(); // an array of fixed size, that relates to the room-memory array for sources; each element is either a harvestingMine object or is undefined...
        this.prepareHarvestingMineDataForBase();
        // end of mine section...
        this.overseerPosition = {};
        this.towerChargerPosition = null;
        this.factoryID = null;
        this.nukerID = null;
        this.centralSpawnID = null;
        this.powerSpawnID = null;
        this.mineralID = null;
        this.mineralName = null;
        this.extractorID = null;
        this.prepareRemainingBaseData();
        this.attackPriorities =  [WORK, ATTACK, RANGED_ATTACK, HEAL, "other"]; // ! these can be reorganized to prioritize target-types for fighters/towers
        this.towerTargetID = null; // !!! NOT IN USE // the first creep that the tower targeted according to attack priorities; will be set to null again upon enemy death or departure from room, etc...
        this.siteRegistration = this.createSiteRegistrationObjAtInit(); // an object wherein a structure type relates to a function for registering its site
        this.structureRegistration = this.createStructureRegistrationObjAtInit(); // an object wherein a structure type relates to a function for registering it
        // ___THE BELOW ARE TICK-BASED DATA___
        this.lastControllerLevel;
        this.controllerLeveledUp = false; // is used to trigger construction (primarily) whenever a controller levels up
        this.enemies = this.makeEnemiesObjectAtInit(); // an object that contains each enemy object (NOT ID) based on type and proximity to central part of base.
                                                       // !!! if enemies are targeted over multiple ticks then IDs will be needed!
        this.enemyPresence = false; // indicates whether there are enemies anywhere within the base (map tile)
        this.ticksSinceEnemyArrival = 0;
        this.sustainedEnemyPresence = false;
        this.lowestHealthStructureID;
        this.lowestHealthStructure; // holds onto actual object, not ID
        // !!! could add most hurt enemy, closest enemy, nearest healer, etc... (as many enemy stats as seems useful...)
        this.spawnOrExtIDs = []; // contains the ids of all spawns or extensions that will (since the last search) be used by gatherers or harvesters
        this.spawnOrExtIndex = 0;
        this.spawnOrExt; // contains the actual spawn or extension object to be used this tick
        this.mostUnderchargedTower; // contains the actual tower object (that is not fully charged, and with least energy among all towers) to be used this tick
        this.constructionStarted = false; // indicates whether construction sites have been recently created by the code, and, thus, whether checks for them should be done
        this.constructionSitesObject = this.prepareConstructionSitesObjectAtInit(); // see the preparation method for details on constructionSitesObject
        this.scavengerItem; // contains dropped resource, grave, or ruin
        this.scavengerItemType; // refers to whether withdraw or pickup is used to collect from item
        // other...
        this.spawnScavenger = false;
    }
    
    // returns all spawn names, within an array, that exist within a single base, according to room memory
    getSpawnNamesForBase() {
        let allSpawnNames = [];
        let curRoom = Game.rooms[this.baseName];
        if (curRoom.memory[ROOM_MEMORY_SET]) {
            allSpawnNames = getStructureDetailsByRoomMemory(curRoom, STRUCTURE_SPAWN, "name");
        } else {
            console.log("Need to set room memory for "+this.baseName+"!");
        }
        return allSpawnNames;
    }
    
    // returns the coordinate pair that relates to the "central position" of a given base, according to room memory
    // the central position is particularly important for towers, as it helps to determine their target when enemies are present, based on enemy proximity to central position
    getCentralPosition() {
        let curRoom = Game.rooms[this.baseName];
        if (curRoom.memory[ROOM_MEMORY_SET]) {
            return curRoom.memory[OVERSEER_POSITION];
        } else {
            console.log("Need to set room memory for "+this.baseName+"!");
        }
    }
    
    // returns all tower IDs, within an array, that exist within a single base, according to room memory
    getTowerIDsForBase() {
        let allTowerIDs = [];
        let curRoom = Game.rooms[this.baseName];
        if (curRoom.memory[ROOM_MEMORY_SET]) {
            allTowerIDs = getStructureDetailsByRoomMemory(curRoom, STRUCTURE_TOWER, "id");
        } else {
            console.log("Need to set room memory for "+this.baseName+"!");
        }
        return allTowerIDs;
    }
    
    // returns all source IDs, within an array, that exist within a single base, according to room memory
    getSourceIDsForBase() {
        let curRoom = Game.rooms[this.baseName];
        if (curRoom.memory[SOURCES_SET]) {
            return curRoom.memory[SOURCES];
        } else {
            console.log("Need to set room memory for "+this.baseName+"!");
        }
    }
    
    // prepares upgrade-mine data for a single base according to room memory, returning nothing
    // ! note that upgradeMiners are only used on or after controller level 6 for the sake of efficiency
    // ! notice that this.upgradeMine is not an array like other mines, because only 1 upgradeMiner is allowed per base
    // ! note that upgradeMines take precedence over all other mines
    prepareUpgradeMineDataForBase() {
        let curRoom = Game.rooms[this.baseName];
        if (curRoom.memory[UPGRADE_MINE_SET] && curRoom.controller.level >= 6) {
            let upgradeMineObj = curRoom.memory[UPGRADE_MINE];
            if (upgradeMineObj) {
                this.upgradeMine = { sourceIndex: upgradeMineObj.sourceIndex, sourceID: upgradeMineObj.sourceID, pos: new RoomPosition(upgradeMineObj.x, upgradeMineObj.y, this.baseName) };
            }
        }
    }
    
    // returns an array that is the same size as the number of sources in the base, when source-memory is set; otherwise returns nothing and gives a warning
    // this array is meant to be fixed in size, never changing in its length after script initialization
    // ! note that this method is used to create this.dropMines and this.linkMines
    // if used to create the array this.dropMines, for example, each element in this array must be a dropMine object or else undefined...
    // ... when a dropMine object can be found at an index in this.dropMines, that means that dropMiners should be active on the related source...
    // ... and when a dropMine is to be no longer used, simply use "delete" on the element of the array that relates to the source index
    prepareMineArrayAtInit() {
        let curRoom = Game.rooms[this.baseName];
        if (curRoom.memory[SOURCES_SET]) {
            return new Array(curRoom.memory[SOURCES].length)
        } else {
            console.log("Need to set room memory for "+this.baseName+"!");
        }
    }
    
    // returns the count of defined elements within the mineArray
    // ! note that mineArray should be this.dropMines and this.linkMines, which are described immediately above...
    getMineArrayCount(mineArray) {
        let c = 0;
        for (let mine of mineArray) {
            if (mine) {
                c++;
            }
        }
        return c;
    }
    
    // returns the first valid mine index from a mineArray (meaning the index of the first encountered element that is NOT undefined)
    // returns null if there are no valid mines
    // ! note that mineArray should be this.dropMines and this.linkMines, which are described above...
    getFirstValidMineIndex(mineArray) {
        for (let i = 0; i < mineArray.length; i++) {
            if (mineArray[i]) {
                return i;
            }
        }
        return null;
    }
    
    // this is a standard method for creating a linkMine object
    // returns a valid linkMine object when provided with valid arguments; otherwise returns a negative integer as error code
    // ! note that every element of the array this.linkMines is a linkMine object
    createLinkMineObject(sourceID, linkID, siteID, roomPosObj, linkX, linkY) {
        // doing minimal error checks on select arguments...
        if (linkID != null && siteID != null) { // if neither is null
            return -1;
        } else if (!linkID && !siteID) { // if both are false as booleans
            return -2;
        }
        // creating object
        let obj = {
            sourceID: sourceID, // the ID of the source for the linkMine
            linkID: linkID, // the ID of the link // ! must be null if NOT completed
            siteID: siteID, // the ID of the construction site of the link, if it is not yet completed... // ! must be null if completed
            pos: roomPosObj, // an object created with RoomPosition; this is where the linkMiner stands
            linkX: linkX, // the x position of the link
            linkY: linkY, // the y position of the link
            creepNames: {}, // names of all creeps (though there should only be one) collecting here
        };
        return obj;
    }
    
    // prepares all link data (central-link, linkmines, and controller-link) for links of a single base, and returns all link IDs, within an array, according to room memory
    // ! note that although linkMine room-memory does not necessarily follow the ordering of sources in room-memory, this.linkMines DOES follow source-order
    // ! note that upgradeMines take precedence over linkMines
    prepareLinkDataAndGetLinkIDsForBase() {
        let allLinkIDs = [];
        let curRoom = Game.rooms[this.baseName];
        if (curRoom.memory[ROOM_MEMORY_SET]) {
            this.centralLinkID = getStructureDetailsByRoomMemory(curRoom, STRUCTURE_LINK, "id")[0]; // !!! this could be replaced by something more specific (and faster)
            allLinkIDs.push(this.centralLinkID);
            if (curRoom.memory[LINK_MINES_SET] && curRoom.controller.level >= LINKMINER_MIN_CONTROLLER_LEVEL) {
                for (let obj of curRoom.memory[LINK_MINES]) {
                    if (this.upgradeMine && this.upgradeMine.sourceIndex == obj.sourceIndex) { // if this source is already part of an upgradeMine
                        continue; // move on to next potential linkMine...
                    }
                    let structureFound = false;
                    // finding the linkMine structure if it exists...
                    for (let struct of curRoom.lookForAt(LOOK_STRUCTURES, obj.linkX, obj.linkY)) {
                        if (struct.structureType == STRUCTURE_LINK) {
                            this.linkMines[obj.sourceIndex] = this.createLinkMineObject(obj.sourceID, struct.id, null, new RoomPosition(obj.minerX, obj.minerY, this.baseName), obj.linkX, obj.linkY);
                            allLinkIDs.push(struct.id);
                            structureFound = true;
                            break;
                        }
                    }
                    if (!structureFound) {
                        // finding the linkMine construction-site if it exists...
                        for (let site of curRoom.lookForAt(LOOK_CONSTRUCTION_SITES, obj.linkX, obj.linkY)) {
                            if (site.structureType == STRUCTURE_LINK) {
                                this.linkMines[obj.sourceIndex] = this.createLinkMineObject(obj.sourceID, null, site.id, new RoomPosition(obj.minerX, obj.minerY, this.baseName), obj.linkX, obj.linkY);
                                break;
                            }
                        }
                    }
                }
            }
            if (curRoom.memory[CONTROLLER_LINK_SET]) {
                let coords = curRoom.memory[CONTROLLER_LINK];
                for (let struct of curRoom.lookForAt(LOOK_STRUCTURES, coords[0], coords[1])) {
                    if (struct.structureType == STRUCTURE_LINK) {
                        allLinkIDs.push(struct.id);
                        this.controllerLinkID = struct.id;
                        break;
                    }
                }
            }
        }
        return allLinkIDs;
    }
    
    // this is a standard method for creating a dropMine object
    // returns a valid dropMine object when provided with valid arguments; otherwise returns a negative integer as error code
    // ! note that every element of the array this.dropMines is a dropMine object or is otherwise undefined
    createDropMineObject(sourceID, containerID, siteID, roomPosObj) {
        // doing minimal error checks on select arguments...
        if (containerID != null && siteID != null) { // if neither is null
            return -1;
        } else if (!containerID && !siteID) { // if both are false as booleans
            return -2;
        }
        // creating object
        let obj = {
            sourceID: sourceID, // the ID of the source adjacent to the dropMine
            containerID: containerID, // the ID of the container at the dropMine // ! must be null if NOT completed
            siteID: siteID, // the ID of the construction site of the container, if it was not yet completed... // ! must be null if completed
            pos: roomPosObj, // an object created with RoomPosition; this is the position of the container, and also where miner stands
            creepNames: {}, // names of all creeps (though there should only be one) dropMining here
            gathererNames: {}, // names of gatherers (though, again, there should only be one) gathering from this dropMine
        };
        return obj;
    }
    
    // prepares all dropmine data for a single base, and returns all dropMine container IDs, within an array, according to room memory
    // ! note that although dropMine room-memory does not necessarily follow the ordering of sources in room-memory, this.dropMines DOES follow source-order
    // ! note that linkMines and upgradeMines take precedence over dropMines
    prepareDropminesAndGetContainerIDsForBase() {
        let curRoom = Game.rooms[this.baseName];
        let allContainerIDs = [];
        if (curRoom.memory[DROP_MINES_SET]) {
            let dropMineMemory = curRoom.memory[DROP_MINES];
            for (let i = 0; i < dropMineMemory.length; i++) {
                let obj = dropMineMemory[i];
                if (this.linkMines[obj.sourceIndex] || (this.upgradeMine && this.upgradeMine.sourceIndex == obj.sourceIndex)) { // if this source is already part of a linkMine or upgradeMine
                    continue; // move on to next potential dropMine...
                }
                let structureFound = false;
                for (let struct of curRoom.lookForAt(LOOK_STRUCTURES, obj.x, obj.y)) {
                    if (struct.structureType == STRUCTURE_CONTAINER) {
                        this.dropMines[obj.sourceIndex] = this.createDropMineObject(obj.sourceID, struct.id, null, new RoomPosition(obj.x, obj.y, this.baseName));
                        allContainerIDs.push(struct.id);
                        structureFound = true;
                        break;
                    }
                }
                if (!structureFound) {
                    for (let site of curRoom.lookForAt(LOOK_CONSTRUCTION_SITES, obj.x, obj.y)) {
                        if (site.structureType == STRUCTURE_CONTAINER) {
                            this.dropMines[obj.sourceIndex] = this.createDropMineObject(obj.sourceID, null, site.id, new RoomPosition(site.pos.x, site.pos.y, this.baseName));
                            break;
                        }
                    }
                }
            }
        }
        return allContainerIDs;
    }
    
    // counts the total number of harvesting positions available in a base throughout all harvestingMines and returns the integer value
    getHarvestingPositionCountForBase() {
        let c = 0;
        for (let mine of this.harvestingMines) {
            if (mine) {
                c += mine.positionData.length;
            }
        }
        return c;
    }
    
    // prepares harvesting-position data for a single base according to room memory, returning nothing
    // ! note that harvestingMines are created last and only after confirming that other more efficient mines do not exist
    // ! note that linkMines, DropMines, and upgradeMines take precedence over harvestingMines
    prepareHarvestingMineDataForBase() {
        let curRoom = Game.rooms[this.baseName];
        let clvl = curRoom.controller.level;
        let harvestingMines = curRoom.memory[HARVESTING_MINE];
        for (let harvestingMine of harvestingMines) {
            let sourceIndex = harvestingMine.sourceIndex;
            if (this.dropMines[sourceIndex]) { 
                continue; // skip this source because it is a dropMine
            }
            if (this.linkMines[sourceIndex]) { 
                continue; // skip this source because it is a linkMine
            }
            if (this.upgradeMine && this.upgradeMine.sourceIndex == sourceIndex) {
                continue; // skip this source because it is an upgradeMine
            }
            // the source will be a harvestingMine; beginning harvestingMine data creation...
            let harvestingMineObj = {
                positionData: [], // each element of this array will be an object with the properties pos (yielding a RoomPosition object) and creepNames (a set of creepNames that are using this position)
                sourceID: harvestingMine.sourceID, // the ID of the source at this mine
            };
            let positionsFound = 0;
            // filling out the positionData array
            for (let coord of harvestingMine.locations) {
                harvestingMineObj.positionData.push({ pos: new RoomPosition(coord[0], coord[1], this.baseName), creepNames: {} });
                positionsFound++;
                if (positionsFound >= 5) { // !!! the restrictive process here could be more complex
                    break; // stop creating additional harvesting positions at this mine (in order to prevent over-harvesting of the related source)
                }
            }
            this.harvestingMines[harvestingMine.sourceIndex] = harvestingMineObj;
        }
    }
    
    // prepares the remaining base data from room memory, returning nothing
    // ! prepares data for central-spawn, overseer position, towerCharger position, mineral-data, extractor, etc., by setting related Base properties
    prepareRemainingBaseData() {
        let curRoom = Game.rooms[this.baseName];
        if (curRoom.memory[ROOM_MEMORY_SET]) {
            let obj = curRoom.memory[MAIN_STRUCTURES];
            let controllerLevel = curRoom.controller.level;
            this.centralSpawnID = getSingleStructureDetailsByRoomMemory(curRoom, STRUCTURE_SPAWN, "id", obj, 1);
            let overseerPos = curRoom.memory[OVERSEER_POSITION];
            this.overseerPosition["x"] = overseerPos[0];
            this.overseerPosition["y"] = overseerPos[1];
            let towerChargerPos = curRoom.memory[TOWERCHARGER_POSITION];
            this.towerChargerPosition = new RoomPosition(towerChargerPos[0], towerChargerPos[1], this.baseName);
            if (curRoom.memory[EXTRACTOR_LOCATION_SET]) {
                let coord = curRoom.memory[EXTRACTOR_LOCATION];
                for (let mineral of curRoom.lookForAt(LOOK_MINERALS, coord[0], coord[1])) { // ! only iterates once because only a single mineral can be found at a given location
                    this.mineralID = mineral.id;
                    this.mineralName = mineral.mineralType;
                }
                if (controllerLevel >= EXTRACTOR_MIN_CONTROLLER_LEVEL) {
                    for (let struct of curRoom.lookForAt(LOOK_STRUCTURES, coord[0], coord[1])) {
                        if (struct.structureType == STRUCTURE_EXTRACTOR) {
                            this.extractorID = struct.id;
                            break;
                        }
                    }
                }
            }
            const FACTORY_LEVEL = 7;
            if (controllerLevel >= FACTORY_LEVEL) {
                this.factoryID = getSingleStructureDetailsByRoomMemory(curRoom, STRUCTURE_FACTORY, "id", obj, FACTORY_LEVEL);
            }
            const LAST_LEVEL = 8;
            if (controllerLevel >= LAST_LEVEL) {
                this.nukerID = getSingleStructureDetailsByRoomMemory(curRoom, STRUCTURE_NUKER, "id", obj, LAST_LEVEL);
                this.powerSpawnID = getSingleStructureDetailsByRoomMemory(curRoom, STRUCTURE_POWER_SPAWN, "id", obj, LAST_LEVEL);
            }
        }
    }
    
    // creates and returns the "enemies object" at initialization, which is an object whose keys are the values of this.attackPriorities where each associated value ...
    // ... is an object representing a potentially present enemy-type within the base
    // ! note that the creep and distance properties of the individual enemy-object are updated each tick within performTickBasedChecks, but will be null when ...
    // ... no relevant enemy unit exists within the base on that tick
    // !!! this could certainly be improved or otherwise changed (also, may later need to use IDs since in-game objects are recreated each tick)
    makeEnemiesObjectAtInit() {
        let meo = (bodypart) => {
            let enemyObj = {
                bodypart: bodypart, // this is based on this.attackPriorities such that each element in the object has one of the distinct body-part types
                creep: null, // this will be set to a enemy creep object
                distance: null // this is the distance that the enemy creep is from the central structure
            }
            return enemyObj;
        }
        let enemiesObj = {};
        for (let i = 0; i < this.attackPriorities.length; i++) {
            enemiesObj[this.attackPriorities[i]] = meo(this.attackPriorities[i]);
        }
        return enemiesObj;
    }
    
    // resets this.enemies such that every tick-based property (which does NOT include bodypart) is set to null
    // ! this method must be consistent with meo arrow function as found in makeEnemiesObjectAtInit()
    resetEnemiesObject() {
        for (let enemyType of this.attackPriorities) {
            this.enemies[enemyType].creep = null;
            this.enemies[enemyType].distance = null;
        }
    }
    
    // this method creates and returns the "site registration object" at initialization, for the setting of this.siteRegistration
    // the object is meant to receive a structureType as key, thereby yielding a specialized function that can register a construction-site (passed as argument) of structureType
    // the object created here is used to "register" new construction-sites so that the Base class (for the relevant base) has the appropriate information about them
    // the object is used within the "tick-based checks" section so that any relevant construction-site just started will be registered through it
    // ! note that site registration does NOT execute on first tick (see tickBasedChecks), since other methods collect site data for the considered structureTypes
    // ! note that the method checkBaseStructuresAgainstRoomMemory handles the stricter constraints of building new structures, whereas the functions contained ...
    // ... in this object mostly just look to see whether a given construction-site exists in the room at the memory-indicated place
    createSiteRegistrationObjAtInit() {
        let obj = {};
        obj[STRUCTURE_CONTAINER] = (site) => {
            let mineStarted = false;
            let sourceIndex;
            let curRoom = Game.rooms[this.baseName];
            // updating dropMines array if new container construction-site is part of a dropMine...
            for (let obj of curRoom.memory[DROP_MINES]) {
                if (site.pos.x == obj.x && site.pos.y == obj.y) { // if site is part of a dropMine location...
                    if (this.dropMines[obj.sourceIndex]) { // if a dropMine has already existed here since initialization...
                        // ! this section should execute only when (within same execution) the site or structure was previously destroyed and new construction was triggered
                        this.dropMines[obj.sourceIndex].containerID = null;
                        this.dropMines[obj.sourceIndex].siteID = site.id;
                    } else { // when the dropMine is "new"
                        this.dropMines[obj.sourceIndex] = this.createDropMineObject(obj.sourceID, null, site.id, new RoomPosition(site.pos.x, site.pos.y, this.baseName));
                    }
                    mineStarted = true;
                    sourceIndex = obj.sourceIndex;
                    break;
                }
            }
            if (mineStarted) {
                if (this.harvestingMines[sourceIndex]) { // if a harvestingMine uses the same source...
                    delete this.harvestingMines[sourceIndex]; // removing the harvestingMine (by setting the array element to undefined) // ! this should cause the harvesters to recycle
                }
            }
        };
        obj[STRUCTURE_LINK] = (site) => {
            let mineStarted = false;
            let sourceIndex;
            let curRoom = Game.rooms[this.baseName];
            // updating linkMines array if new link construction-site is part of a linkMine...
            for (let obj of curRoom.memory[LINK_MINES]) {
                if (site.pos.x == obj.linkX && site.pos.y == obj.linkY) {
                    if (this.linkMines[obj.sourceIndex]) { // if a linkMine has already existed here since initialization...
                        // ! this section should execute only when (within same execution) the site or structure was previously destroyed and new construction was triggered
                        this.linkMines[obj.sourceIndex].linkID = null;
                        this.linkMines[obj.sourceIndex].siteID = site.id;
                    } else { // when the linkMine is "new"
                        this.linkMines[obj.sourceIndex] = this.createLinkMineObject(obj.sourceID, null, site.id, new RoomPosition(obj.minerX, obj.minerY, this.baseName), obj.linkX, obj.linkY);
                    }
                    mineStarted = true;
                    sourceIndex = obj.sourceIndex;
                    break;
                }
            }
            if (mineStarted) {
                if (this.harvestingMines[sourceIndex]) { // if a harvestingMine uses the same source...
                    delete this.harvestingMines[sourceIndex]; // removing the harvestingMine (by setting the array element to undefined) // ! this should cause the harvesters to recycle
                }
                if (this.dropMines[sourceIndex]) { // if a dropMine uses the same source...
                    delete this.dropMines[sourceIndex]; // removing the dropMine (by setting the array element to undefined) // ! this should cause the dropMiner and gatherer to recycle
                }
            }
        };
        return obj;
    }
    
    // this method creates and returns the "structure registration object" at initialization, for the setting of this.structureRegistration
    // the object is meant to receive a structureType as key, thereby yielding a specialized function that can register a structure (passed as argument) of structureType
    // the object created here is used to "register" newly completed structures so that the Base class (for the relevant base) has the appropriate information about them
    // the object is used within the "tick-based checks" section so that any relevant structure just completed will be registered through it
    // ! note that the method checkBaseStructuresAgainstRoomMemory handles the stricter constraints of building new structures, whereas the functions contained ...
    // ... in this object mostly just look to see whether a given structure exists in the room at the memory-indicated place
    // !!!!! could certainly add more things to this method and make other general improvements...
    createStructureRegistrationObjAtInit() {
        let obj = {};
        obj[STRUCTURE_CONTAINER] = (struct) => {
            this.containerIDs.push(struct.id); // saving id of completed container
            // finding the dropMine and updating the appropriate properties...
            // ! note that the dropMine array entry should exist due to a prior site-registration, or else due to re-committal of code
            for (let i = 0; i < this.dropMines.length; i++) {
                let mine = this.dropMines[i];
                if (mine && mine.containerID == null && struct.pos.x == mine.pos.x && struct.pos.y == mine.pos.y) {
                    // saving the containerID now that the construction site is finally a complete structure, and, hence, also removing the (construction) siteID
                    this.dropMines[i].containerID = struct.id;
                    this.dropMines[i].siteID = null;
                    return; // ! ending loop and returning since the structure necessarily relates to only a single dropMine
                }
            }
        };
        obj[STRUCTURE_EXTRACTOR] = (struct) => {
            this.extractorID = struct.id;
        };
        obj[STRUCTURE_FACTORY] = (struct) => {
            this.factoryID = struct.id;
        };
        //obj[STRUCTURE_LAB] = (struct) => {
            // !!! ... not yet storing labIDs
        //};
        obj[STRUCTURE_LINK] = (struct) => {
            this.linkIDs.push(struct.id);
            let curRoom = Game.rooms[this.baseName];
            if (curRoom.memory[ROOM_MEMORY_SET]) {
                let coord = curRoom.memory[MAIN_STRUCTURES][5][STRUCTURE_LINK][0];
                if (struct.pos.x == coord[0] && struct.pos.y == coord[1]) {
                    this.centralLinkID = struct.id;
                    return;
                }
            }
            if (curRoom.memory[LINK_MINES_SET]) {
                // finding the linkMine and updating the appropriate properties...
                // ! note that the linkMine array entry should exist due to a prior site-registration
                for (let i = 0; i < this.linkMines.length; i++) {
                    let mine = this.linkMines[i];
                    if (mine && mine.linkID == null && struct.pos.x == mine.linkX && struct.pos.y == mine.linkY) {
                        this.linkMines[i].linkID = struct.id;
                        this.linkMines[i].siteID = null;
                        return;
                    }
                }
            }
            if (curRoom.memory[CONTROLLER_LINK_SET]) {
                // !!!!!!!!!!!!! needs to be tested...
                let coord = curRoom.memory(CONTROLLER_LINK);
                if (struct.pos.x == coord[0] && struct.pos.y == coord[1]) {
                    this.controllerLinkID = struct.id;
                    return;
                }
            }
            console.log("LINK NOT FOUND!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        };
        obj[STRUCTURE_POWER_SPAWN] = (struct) => {
            this.powerSpawnID = struct.id;
        };
        obj[STRUCTURE_NUKER] = (struct) => {
            this.nukerID = struct.id;
        };
        obj[STRUCTURE_SPAWN] = (struct) => {
            if (this.spawnNames.length == 0) { // !!!!! not good... should use room memory (like the link section)...
                this.centralSpawnID = struct.id;
            }
            this.spawnNames.push(struct.name);
        };
        obj[STRUCTURE_STORAGE] = (struct) => {
            //this.storageID = struct.id; // !!! storageID is not currently held onto...
            this.controllerLeveledUp = true; // ! the controller did not actually level up; this is done to trigger checks against room memory (so that dropMines can now be built for example...)
        };
        //obj[STRUCTURE_TERMINAL] = (struct) => { // !!! not yet storing terminalID...
        //    this.terminalID = struct.id;
        //};
        obj[STRUCTURE_TOWER] = (struct) => {
            this.towerIDs.push(struct.id);
        };
        return obj;
    }
    
    // this method creates and returns a single object for the grouping of all construction-sites at script initialization, for the Base property this.constructionSitesObject
    // ! note that this object sorts out construction-sites into distinct groups (or "types" -- which are explained below, immediately above the variable allSiteTypes)
    // ... because of this sorting into groups, different roles can access the current site related to their build-preferences (fortifiers target the FORT site, for example)
    // ! the object prepared here is updated through tickBasedChecks, either at first tick or when this.constructionStarted is true
    // ! note that this object uses global constants to help prevent troublesome typographical errors, since the object is used throughout the role functions
    prepareConstructionSitesObjectAtInit() {
        // ! note that ROAD refers to all road construction-sites; FORT referts to all fortification construction-sites (walls and ramparts); and MAIN refers to everything else
        let allSiteTypes = [ROAD, FORT, MAIN];
        let obj = {};
        for (let type of allSiteTypes) {
            obj[type] = {};
            obj[type][IDS] = []; // all IDs of construction-sites in a base of "type" 
                                 // ! note that all IDs will be collected at exec or recreated when 'constructionStarted' is true
            obj[type][INDEX] = -1; // is the current index for IDs of "type"; is used to set "site" below; ! note that when index is NOT -1, construction is ongoing
            obj[type][REGIS] = {}; // an object that holds, at each "index", the details of a construction-site of same index (as in "IDs") that will later need ...
                                   // ... to be registered with the related function from this.structureRegistration
                                   // ! note that this is only relevant to the MAIN structures currently...
            obj[type][SITE] = null; // holds the construction-site object that relevant creeps are meant to build; when set, is the site related to the ID at "index"
                                    // ! note that structure registration only happens with immediate timing when "site" was used to complete the structure
        }
        return obj;
    }
    
    // this method registers sites and, as needed, pre-registers the related structure for all construction sites according to their type within a base
    // this method is only called at a specific point within the method performTickBasedChecks
    // ! "registering the site" refers to executing the appropriate this.siteRegistration function (when one exists); for example, registering a link-site ... 
    // ... so that this.linkMines (for example) could be modified when the link-site is at the intended location of a linkMine according to room memory
    // ! "pre-registering a structure" refers to saving details about a site so that when it is a finished structure we have the necessary details available ...
    // ... to call its related this.structureRegistration function (when one exists); for example, we would save details about a tower-site so that when the site ...
    // ... is finished and gone we can reference those details to make sure that a tower does exist at the specified location, and, if it does, then register the tower
    saveAndRegisterAllConstructionSitesForBase(tickCount) {
        let indexObj = {}; // ! note that the index must be distinct for each TYPE of construction site
        indexObj[ROAD] = -1; // ! all indexes start at -1 because they are incremented immediately upon determining type
        indexObj[FORT] = -1;
        indexObj[MAIN] = -1;
        for (let site of Game.rooms[this.baseName].find(FIND_MY_CONSTRUCTION_SITES)) {
            let type; // indicates type for this.constructionSitesObject; is meant to be used thus: this.constructionSitesObject[type]
            if (site.structureType == STRUCTURE_ROAD) { // if site is a road-site...
                type = ROAD;
            } else if (site.structureType == STRUCTURE_RAMPART || site.structureType == STRUCTURE_WALL) { // is a fortification-site...
                type = FORT;
            } else { // otherwise is a "main" site
                type = MAIN;
            }
            // incrementing the appropriate index immediately, since all indexes started at -1
            indexObj[type]++;
            // saving the ID...
            this.constructionSitesObject[type][IDS].push(site.id);
            // registering construction-site (if valid site)...
            if (tickCount > 0 && this.siteRegistration[site.structureType]) { // if not first tick AND this is a registerable site...
                // ! note that construction-sites should already be registered by other methods on the very first tick
                this.siteRegistration[site.structureType](site);
            }
            // pre-registering the structure (if site is of valid structureType)
            if (this.structureRegistration[site.structureType]) { // if this structureType has an associated structure registration function
                // saving details of site (by its index) for later registration
                this.constructionSitesObject[type][REGIS][indexObj[type]] = {
                    structureType: site.structureType,
                    x: site.pos.x,
                    y: site.pos.y,
                };
            }
        }
    }
    
    // this method checks every type relevant to the constructionSitesObject and, for every "type", sets the INDEX value to 0 whenever there are saved IDs...
    // ... thereby indicating that construction of the sites of that "type" should begin at the first site found (at index 0 of the IDs array)
    // ! this method is called in tickBasedChecks whenever new sites are looked for (at first tick or when this.constructionStarted is true)
    resetConstructionSiteIndexes() {
        for (let type in this.constructionSitesObject) {
            if (this.constructionSitesObject[type][IDS].length > 0) {
                this.constructionSitesObject[type][INDEX] = 0; // ! construction will begin from first site found...
            }
        }
    }
    
    // resets the registration-object for EVERY type of construction-site so that it is again an empty object as {}
    resetPreregisteredSites() {
        for (let type in this.constructionSitesObject) {
            this.constructionSitesObject[type][REGIS] = {};
        }
    }
    
    // this method sets the SITE value for each relevant "type" of construction-site, re-setting it to null
    // if the actual site still exists in-game, then the site property will be updated during the current tick through the method performTickBasedChecks
    // ! note that api-accessible in-game objects are recreated every tick, thus an object retrieved last tick with Game.getObjectById would no longer be valid this tick
    resetAllConstructionSiteObjects() {
        for (let type in this.constructionSitesObject) {
            this.constructionSitesObject[type][SITE] = null;
        }
    }
    
    // this method is executed every single tick for every base (via the Screeps main loop), performing a large variety of tasks
    // ! to clarify, this method collects information about enemies within the base, about damaged or low-health owned structures, about energy-fillable structures ...
    // ... about tower energy-levels, about construction sites in base, about ruins, gravestones, and drops, etc...
    performTickBasedChecks(tickCount, baseCount) {
        // reset variables first (except those that use IDs, such as spawnOrExtID)
        this.resetEnemiesObject();
        this.lowestHealthStructure = null;
        this.spawnOrExt = null;
        this.mostUnderchargedTower = null;
        this.resetAllConstructionSiteObjects();
        this.scavengerItem = null;
        this.scavengerItemType = null;
        let currentRoom = Game.rooms[this.baseName];
        // check for controller level up
        if (!this.lastControllerLevel) { // if last controller level is unset
            this.lastControllerLevel = currentRoom.controller.level;
        } else {
            if (this.lastControllerLevel < currentRoom.controller.level) {
                this.lastControllerLevel = currentRoom.controller.level;
                this.controllerLeveledUp = true;
            } // !!! what about clvl downgrades...?
        }
        
        // find enemies to attack...
        let hostileCreeps = currentRoom.find(FIND_HOSTILE_CREEPS);
        if (hostileCreeps.length > 0) {
            if (this.enemyPresence) { // if enemies were already present...
                this.ticksSinceEnemyArrival++;
            } else {
                this.enemyPresence = true;
            }
            if (this.ticksSinceEnemyArrival >= 100) { // !!! reexecutions can cause trouble here! (also, in simulation, large numbers won't work (due to frequent auto-reexec))
                this.sustainedEnemyPresence = true;
            }
            // looking at all enemy creeps in room and filling out this.enemies such that each "type" has at most one creep associated with it according to which is closest
            // ! note that each creep will be associated with at most one type
            for (let creep of hostileCreeps) {
                let distance = Math.abs(this.centralPos[0] - creep.pos.x) + Math.abs(this.centralPos[1] - creep.pos.y);
                for (let enemyType of this.attackPriorities) {
                    if (enemyType == "other" || creep.getActiveBodyparts(this.enemies[enemyType].bodypart) > 0) {
                        if (this.enemies[enemyType].creep == null || distance < this.enemies[enemyType].distance) {
                            console.log("There is an enemy in "+this.baseName+": " + enemyType);
                            this.enemies[enemyType].creep = creep;
                            this.enemies[enemyType].distance = distance;
                            break; // move on to next enemy, since this.enemies[enemyType] was just set for this creep
                        }
                    }
                }
            }
        } else {
            this.enemyPresence = false;
            this.ticksSinceEnemyArrival = 0;
            this.sustainedEnemyPresence = false;
        }
        
        // find damaged (or low-health) structures
        // ! note that the lowest health structure might reach full health before the check is repeated for the same base (causing a break in repair activities)
        // !!! perhaps low-health-checks should be divided up into two separate sections, where one checks things like roads, and the other checks everything else
        // !!! because roads and other things are held together, it frequently happens that all towers shoot together once a new target has been found ...
        // ... this is because a road was maxed with one shot or so (hence all shooting stopped); all towers then get filled in the meantime, (hence all shoot when new target found)
        if (tickCount == 0 || tickCount % baseCount == this.baseNumber) {
            //console.log("Finding lowest health structure in "+this.baseName+"...");
            let structuresByLowestHealth = currentRoom.find(FIND_STRUCTURES, { filter: object => object.hits < object.hitsMax });
            if (structuresByLowestHealth.length > 0) {
                structuresByLowestHealth.sort((a,b) => a.hits - b.hits);
                this.lowestHealthStructureID = structuresByLowestHealth[0].id;
            } else {
                this.lowestHealthStructureID = null;
            }
        }
        this.lowestHealthStructure = Game.getObjectById(this.lowestHealthStructureID);
        
        // find spawns or extensions for harvesters, distributors, etc....
        if (currentRoom.energyAvailable < currentRoom.energyCapacityAvailable) { // if spawns or extensions are not yet full...
            if (this.spawnOrExtIDs.length > 0) { // if filling of spawns/extensions has already begun...
                let curSpawnOrExt = Game.getObjectById(this.spawnOrExtIDs[this.spawnOrExtIndex]);
                if (!curSpawnOrExt || curSpawnOrExt.store.getFreeCapacity(RESOURCE_ENERGY) == 0) { // if current spawn or ext no longer exists or is full
                    this.spawnOrExtIndex++;
                }
            }
            if (this.spawnOrExtIDs.length == 0 || this.spawnOrExtIndex >= this.spawnOrExtIDs.length) { // if filling of spawns/extensions has NOT begun or current list of to-be-filled has concluded...
                console.log("Performing spawn or extension check in "+this.baseName+"!");
                this.spawnOrExtIDs = [];
                // collecting all IDs of spawns and extensions that are not full
                for (let soe of Game.rooms[this.baseName].find(FIND_MY_STRUCTURES)) {
                    if ((soe.structureType == STRUCTURE_EXTENSION || soe.structureType == STRUCTURE_SPAWN) && soe.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        this.spawnOrExtIDs.push(soe.id);
                    }
                }
                this.spawnOrExtIndex = 0; // spawns/extensions will be filled starting from index 0...
            }
            // collecting spawn or extension structure for the current tick...
            this.spawnOrExt = Game.getObjectById(this.spawnOrExtIDs[this.spawnOrExtIndex]);
        } else { // when spawns and extensions are all full...
            this.spawnOrExtIDs = [];
            this.spawnOrExtIndex = 0;
        }
        
        // finding the tower (if any) that is not fully charged and that has lowest energy among all towers for this base (for use by towerChargers, harvesters, etc.)
        let leastChargedTower;
        for (let towerID of this.towerIDs) {
            let tower = Game.getObjectById(towerID);
            if (leastChargedTower == undefined || tower.store.getUsedCapacity(RESOURCE_ENERGY) < leastChargedTower.store.getUsedCapacity(RESOURCE_ENERGY)) {
                leastChargedTower = tower;
            }
        }
        if (leastChargedTower && leastChargedTower.store.getUsedCapacity(RESOURCE_ENERGY) < leastChargedTower.store.getCapacity(RESOURCE_ENERGY)) { // if tower is NOT full
            this.mostUnderchargedTower = leastChargedTower;
        }
        
        // finding all construction sites for building creeps to work on, while also preparing registration data for any relevant sites
        // ! note that sites are stored in separate arrays according to structureType, and only the site at the related index will be worked on by default
        // ! note that construction sites are only looked for at first tick or when this.constructionStarted is true
        if (tickCount == 0 || this.constructionStarted) {
            console.log("Finding construction sites in "+this.baseName+"...");
            this.constructionStarted = false;
            this.resetPreregisteredSites();
            this.saveAndRegisterAllConstructionSitesForBase(tickCount);
            this.resetConstructionSiteIndexes(); // ! all building will start from the site at index 0...
        }
        // getting the current construction site (if any) that building creeps will be set to work with by default, according to the "type"...
        // ... while also registering the completed structure from any finished sites, when appropriate
        for (let type in this.constructionSitesObject) {
            let conObj = this.constructionSitesObject[type];
            if (conObj[INDEX] != -1) { // if there are (expected to be) construction sites to work on of this type (because of a NON-negative-one value)
                let cs = Game.getObjectById(conObj[IDS][conObj[INDEX]]);
                if (cs) { // if construction is NOT yet finished...
                    conObj[SITE] = cs;
                } else { // if construction site has been finished (or possibly destroyed)...
                    let registrationDetailsObj = conObj[REGIS][conObj[INDEX]];
                    if (registrationDetailsObj) { // if the presumably finished construction site needs to be registered...
                        // confirming the existence of the structure, and then registering it if it exists...
                        for (let struct of currentRoom.lookForAt(LOOK_STRUCTURES, registrationDetailsObj.x, registrationDetailsObj.y)) {
                            if (struct.structureType == registrationDetailsObj.structureType) {
                                this.structureRegistration[struct.structureType](struct);
                                break; // ! only act on the single matching structure...
                            }
                        }
                    }
                    // moving on to the next construction-site (if any)...
                    conObj[INDEX]++;
                    if (conObj[INDEX] >= conObj[IDS].length) { // if all sites are completed...
                        // resetting all appropriate values...
                        conObj[IDS] = [];
                        conObj[INDEX] = -1;
                        conObj[REGIS] = {};
                        conObj[SITE] = null;
                    } else { // move on to the next site...
                        conObj[SITE] = Game.getObjectById(conObj[IDS][conObj[INDEX]]);
                    }
                }
            }
        }
        
        // find dropped resources, tombs, or ruins for scavengers and similar roles
        // !!! this section could be improved (for example, could hold all found things in an array, reusing the array until empty (similar to spawn/extension section))
        let item = currentRoom.find(FIND_DROPPED_RESOURCES)[0];
        let itemType = 1;
        if (!item) {
            itemType = 0;
            for (let tomb of currentRoom.find(FIND_TOMBSTONES)) {
                if (tomb.store.getUsedCapacity() > 0) {
                    item = tomb;
                    break;
                }
            }
            if (!item) {
                for (let ruin of currentRoom.find(FIND_RUINS)) {
                    if (ruin.store.getUsedCapacity() > 0) {
                        item = ruin;
                        break;
                    }
                }
            }
        }
        if (item) {
            this.scavengerItem = item;
            this.scavengerItemType = itemType;
        }
    }
}

// this class holds data relevant to a raiding-party, which is a grouping of creeps with the "raider" role
// this class is to be initialized in only one place: as an element in the array raidingParties, which is a property of the ScreepsScript class
// ! see the raider role for other details about how a raiding-party functions
// !!!!! could set the raiders to work with flags, such that flags like "attack" would determine their target, "gather" will determine their gathering point in battle, etc...
class RaidingParty {
    constructor(partySize, pos) {
        if (!Number.isInteger(partySize) || partySize < 1 || partySize > 4) {
            throw new Error("partySize must be an integer between 1-4 inclusive!");
        }
        this.partySize = partySize; // this value refers to the intended party-size AT finalization // ! is restricted by above "if"
        this.startingPosition = pos; // where the leader will wait when gathering // ! note that space must be available around this point for the other gathering raiders
        this.gatheringPositions = null; // when set, is an array of room position objects such that each position indicates where a single raider will stand when gathering
        this.raiders = []; // is an array of all Raiders in the raiding party, orderred according to their line-based movement, with leader at index 0
                           // ! note that this.raiders.length will refer to that actual current size of a finalized party
        this.mostHurtUnit; // the creep object of the raider that has the most missing health (not necessarily least health)
        // the following array has all memory options specific to the leader of a raiding party; these are tracked here for the convenience of setting memory automatically
        // ! every element is itself an array where the first element is the named memory property and the second element is the default value when setting memory for leader
        this.leaderMemoryOptions = [
            // ! automatic memory (DO NOT MANUALLY CHANGE)
            ["partyFinalized", false], // is automatically set to true once all raiders have done inital gathering around this.startingPosition
            // ! manual memory (is meant to be changed through memory console)
            // movement group 1 (gathering around leader)
            ["forceReGathering", false], // can be set to true to force party to re-gather around leader's current position
            // movement group 2 (moving in a line with leader at front)
            ["targetRoom", null], // when set, is the targetRoom to move to while moving as a line; if not set, then moving in current room
            ["x", null], // x coordinate to move to in a line
            ["y", null], // y coordinate to move to in a line
            // movement group 3 (moving as one solid unit in same direction)
            ["moveAsUnit", null], // must be 1 - 9 matching the direction constants; otherwise, should be null
            ["xMovesAsUnit", null], // number of moves to make in "moveAsUnit" direction
            // movement group 4 (rotating all units in raiding party such that each raider moves into the position of the adjacent raider)
            ["rotationDirection", null], // must -1 or 1, for left or right; otherwise should be null
            ["rotationCount", null], // number of moves to complete while rotating
            // memory for attacking
            ["targetID", null], // must be null or the id of an attackable target; raiders will attack this target when in range of it
        ];
    }
    
    // returns a "Raider" object that will fill out a raiders array
    // ! I opted to use a very simple object instead of a class, because all that was really needed (since memory handles pretty much everything) were two simple things: ...
    // ... name and creep; these two are needed because creep must be derived from name each tick, whereas name does not change
    createRaiderObject(creepName) {
        return { name: creepName, creep: null };
    }
    
    // sets the array, gatheringPositions, so that it contains partySize positions where each position is used by one of the raiders
    // note that leaderPos is optional; when passed, x, y, and roomName will be derived from leaderPos; otherwise they will be derived from the raidingParty instance
    // ! note that this function will only work for a partySize of 4 or less; and it is because of this method that there is a check against partySize in constructor
    // !!! could be expanded to work with more raiders in a party...
    setGatheringPositions(leaderPos=null) {
        let gp = [];
        let x;
        let y;
        let roomName;
        if (leaderPos) {
            x = leaderPos.x;
            y = leaderPos.y;
            roomName = leaderPos.roomName;
        } else {
            x = this.startingPosition.x;
            y = this.startingPosition.y;
            roomName = this.startingPosition.roomName;
        }
        gp.push(new RoomPosition(x, y, roomName));
        x++;
        gp.push(new RoomPosition(x, y, roomName));
        y++;
        gp.push(new RoomPosition(x, y, roomName));
        x--;
        gp.push(new RoomPosition(x, y, roomName));
        this.gatheringPositions = gp;
    }
    
    // is used to update the creep object in this.raiders each and every tick
    // ! note that this method is used in the main loop in the raider section, and that it MUST be before the role section
    setRaiderCreepObjectsEachTick() {
        for (let raider of this.raiders) {
            raider.creep = Game.creeps[raider.name];
        }
    }
    
    // sets this.mostHurtUnit to the creep object of the raider with the most missing health (not necessarily the least health)
    // ! this is also used each tick and has the same requirements as the previous method
    findMostHurtRaider() {
        let mostHurt = null;
        for (let raider of this.raiders) {
            let creep = raider.creep;
            if (creep.hits < creep.hitsMax && (!mostHurt || creep.hitsMax - creep.hits > mostHurt.hitsMax - mostHurt.hits)) {
                mostHurt = creep;
            }
        }
        this.mostHurtUnit = mostHurt;
    }
    
    // returns true when all raiders of same party have no fatigue; otherwise returns false (upon finding first fatigued raider)
    isReadyToMove() {
        for (let raider of this.raiders) {
            let creep = raider.creep;
            if (creep.fatigue > 0) {
                return false;
            }
        }
        return true;
    }
}

// this is the primary class structure for the entire program
// it keeps track of all necessary data and is the class that is initialized immediately before the main loop, being kept and used throughout
// it is through this class, primarily, that my script keeps all data persistent and available, and this is why my script uses comparatively little room memory
// this class holds a variety of important data; such as all roles, the spawn arrays, base templates and all other base data, etc.
class ScreepsScript {
    constructor() {
        this.tickCount = -1; // is incremented at the very start of the main loop, meaning the first tick is numbered 0
        this.totalCreepCount = 0;
        this.uniqueRoles = 0; // the count of all unique roles // ! is set to correct value at end of setRolesObjectAtInit()
        this.roles = {}; // all roles in a lookup-table by role name
        this.powerCreepRoles = {} // all powerCreep roles in a lookup-table by role name
        this.setRolesObjectAtInit();
        this.spawnArraysByControllerLevel; // used for spawning basic units for every base as determined by its controller level
        this.spawnArraysByBase; // used to spawn specific units as needed in a given base
        this.createSpawnObjectsAtInit();
        this.baseTemplates; // an object containing all different base templates
        this.baseBuildDetails; // indicates the base type and other important details of each existing base
        this.prepareBaseDataAtInit();
        this.bases = {}; // an object containing Base objects where each room name gives a Base object
        this.baseCount;
        this.setBasesAtInit();
        // ! note that this.raidingParties SHOULD NOT generally be altered when raiders exist; especially DO NOT shorten the raidingParties array so as to displace indexes
        // ! if you want to get rid of a raiding party that currently has living raiders, then replace the appropriate array element with null and then re-execute
        this.raidingParties = [ // each element in this array must be a RaidingParty object
            //new RaidingParty(4, new RoomPosition(33, 2, "E8N18"))
        ];
        this.countAllCreepsAtInit();
        this.runRoleRecommitFunctionAtInit();
    }
    
    // returns true if there is any room for a raider in any raiding party
    // ! note that the parameter creep is optional, and, when passed, if there is an open party the creep will be added to it and memory will be set accordingly
    // this method is used exclusively in the raider's spawn-condition and birth-condition
    thereIsRoomInAnyRaidingParty(creep=null) {
        for (let partyIndex = 0; partyIndex < this.raidingParties.length; partyIndex++) {
            let raidingParty = this.raidingParties[partyIndex];
            if (!raidingParty) {
                continue;
            }
            let raiderIndex = raidingParty.raiders.length;
            let leader;
            if (raidingParty.raiders.length > 0) { // if there is at least 1 raider in party... (meaning the party must have a leader)
                leader = Game.creeps[raidingParty.raiders[0].name];
            }
            if ((!leader || (leader && !leader.memory.partyFinalized)) && raiderIndex < raidingParty.partySize) { // when the party is NOT finalized and there is room for the raider in this party...
                if (creep) {
                    // add this raider to the party
                    raidingParty.raiders.push(raidingParty.createRaiderObject(creep.name));
                    // set this raider's memory accordingly
                    creep.memory.partyIndex = partyIndex;
                    creep.memory.raiderIndex = raiderIndex;
                    if (raiderIndex == 0) { // if this is first creep to be added to party...
                        // set this creep as leader
                        for (let arr of raidingParty.leaderMemoryOptions) {
                            creep.memory[arr[0]] = arr[1];
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }
    
    // prepares all role data at the initialization of the script (specifically prepares this.roles, this.uniqueRoles, and this.powerCreepRoles)
    // this is a large method that contains the full code for every distinct role
    setRolesObjectAtInit() {
        let rolesArr = []; // temporarily holds all role-objects until they are saved into class variables...
        let powerCreepRolesArr = []; // temporarily holds all powerCreepRole objects
        
        // role memory constants
        const ROLE_NAME = "name";
        const RUN_FUNCTION = "runFunction";
        const SPAWN_CONDITION = "spawnCondition";
        const BIRTH_FUNCTION = "birthFunction";
        const RECOMMIT_FUNCTION = "recommitFunction";
        const DEATH_FUNCTION = "deathFunction";
        const REQUIRED_MEMORY = "requiredMemory";
        const AUTOMATIC_MEMORY = "automaticMemory";
        const CURRENT_COUNT = "curCount"; // ! note that curCount is handled automatically and should NOT be manually set in role section...
        
        // this arrow-function is used by the arrow-function makeCreepRole...
        let defaultSpawnCondition = () => {
            return true;
        };
        
        // this function is used to create each individual creep role
        // after this function has been called, then, in creating a new role, all needed properties of the returned object should be set according to the role's requirements
        // ! note that only ROLE_NAME and RUN_FUNCTION are required for basic functionality
        let makeCreepRole = () => {
            let creepRole = {};
            creepRole[ROLE_NAME] = null; // the name of the role or roleType...
            creepRole[RUN_FUNCTION] = null; // what the creep will do every single tick
            creepRole[SPAWN_CONDITION] = defaultSpawnCondition, // must be a function that returns true or false to indicate whether this unit should be spawned
            creepRole[BIRTH_FUNCTION] = null; // used when a role is spawned that has certain data that must be saved to base class, or that needs manual memory set
            creepRole[RECOMMIT_FUNCTION] = null; // reassigns Base data as set by birthFunction when code is re-committed (since this.bases is rebuilt at re-commit)
            creepRole[DEATH_FUNCTION] = null; // similar to birth function, except that the same Base data is typically removed or appropriately altered
            creepRole[REQUIRED_MEMORY] = null; // an array of memory constants that are required to be within the extraMemory object of the spawn object
            creepRole[AUTOMATIC_MEMORY] = null; // an array of memory constants that are disallowed from being in the extraMemory object of the spawn object
            // !!! have other options?
            creepRole[CURRENT_COUNT] = 0; // the current count of ALL creeps of this role; ! again, note that CURRENT_COUNT is handled automatically and should not be manually set in role section
            return creepRole;
        };
        
        // this function is used to create each individual powerCreep role
        // ! note that there is no count associated with powerCreep roles
        let makePowerCreepRole = () => {
            let powerCreepRole = {};
            powerCreepRole[ROLE_NAME] = null; // the name of the role or roleType...
            powerCreepRole[RUN_FUNCTION] = null; // what the powerCreep will do every single tick
            return powerCreepRole;
        };
        
        // other role memory constants
        const TARGET_ROOM = "targetRoom";
        const TARGET_ID = "targetID";
        const TARGET_TYPE = "targetType";
        const TARGET_SOURCE = "targetSource";
        const TARGET_COORDS = "targetCoords";
        const TO_ROOM = "toRoom";
        const FROM_ROOM = "fromRoom";
        const TO_STRUCTURE = "toStructure";
        const FROM_STRUCTURE = "fromStructure";
        const STORAGE_OR_SOURCE_ID = "storageOrSourceID";
        const STORAGE_OR_SOURCE = "storageOrSource";
        const ENEMY_ID = "enemyID";
        const ALLY_ID = "allyID";
        const LINK_ID = "linkID";
        const RESOURCE_TYPE = "resourceType";
        const TASK = "task";
        const MIN_HITS = "minHits";
        const X = "x";
        const Y = "y";
        const WAIT = "wait";
        const WAIT_X = "waitX";
        const WAIT_Y = "waitY";
        const IDLE_X = "idleX";
        const IDLE_Y = "idleY";
        const COLLECT = "collect";
        const DMI = "dmi";
        const LMI = "lmi";
        const HMI = "hmi";
        const HPI = "hpi";
        const RECYCLE = "recycle";
        const PEEKED_ROOM = "peekedRoom";
        const ENTER_X = "enterX";
        const ENTER_Y = "enterY";
        const PEEK_X = "peekX";
        const PEEK_Y = "peekY";
        const EXIT_X = "exitX";
        const EXIT_Y = "exitY";
        const USE_BASE_STORAGE = "useBaseStorage";
        const REMITTING_TICK = "remittingTick";
        const GENERATE_POWER = "generatePower";
        const DISTRIBUTE_ENERGY = "distributeEnergy";
        const FILL_NUKER = "fillNuker";
        const PARTY_INDEX = "partyIndex";
        const RAIDER_INDEX = "raiderIndex";
        const FINALIZED = "finalized";
        const PARTY_FINALIZED = "partyFinalized";
        const MOVE_AS_UNIT = "moveAsUnit";
        const X_MOVES_AS_UNIT = "xMovesAsUnit";
        const ROTATION_DIRECTION = "rotationDirection";
        const ROTATION_COUNT = "rotationCount";
        
        // numerical role constants
        // ! it is strongly recommended that these not be changed, unless you REALLY know what you are doing
        const BUILDER_USE_STORAGE_THRESHOLD = 1000;
        const FORTIFIER_SPAWN_THRESHOLD = 10000;
        const FORTIFIER_USE_STORAGE_THRESHOLD = 4000;
        const FORTIFIER_MINIMUM_RAMPART_HEALTH = 3000;
        const PAVER_USE_STORAGE_THRESHOLD = 2500;
        const PAVER_SPAWN_THRESHOLD = 15000;
        const HARVESTER_TOWER_CHARGE_THRESHOLD = 500;
        const HARVESTER_MIN_STORAGE_THRESHOLD = 2000;
        const HARVESTER_MAX_STORAGE_THRESHOLD = 5000;
        const LINKMINER_STOP_HARVESTING_THRESHOLD = 700000;
        const OVERSEER_TERMINAL_MIN_ENERGY = 50000;
        const OVERSEER_STOP_CHARGING_NUKER_THRESHOLD = 15000;
        const OVERSEER_USE_STORAGE_FOR_CONTROLLER_LINK_THRESHOLD = 200000;
        const OVERSEER_EXTRA_TASKS_THRESHOLD = 500000;
        const REPAIRER_USE_STORAGE_THRESHOLD = 2250;
        const REPAIRER_EARLY_SPAWN_THRESHOLD = 50000;
        const REPAIRER_LATE_SPAWN_THRESHOLD = 150000;
        const REPAIRER_LATE_WITH_UM_SPAWN_THRESHOLD = 600000;
        const TOWERCHARGER_SPAWN_THRESHOLD = 7500;
        const UPGRADER_USE_STORAGE_THRESHOLD = 1250;
        const UPGRADER_EARLY_SPAWN_THRESHOLD = 20000;
        const UPGRADER_S_EARLY_SPAWN_THRESHOLD = 125000;
        const UPGRADER_S_LATE_SPAWN_THRESHOLD = 200000;
        
        // GENERAL FUNCTIONS FOR ROLES...
        // ! note that all generic role functions included here are arrow-functions to retain the use of "this"
        
        // sets the boolean collect according to the creep's current inventory (focusing on energy) and returns it, while also altering the creeps "collect" memory variable
        // ! this function is used to ensure that creeps will collect energy until store is full, and then do work until all energy is expended, before collecting energy again
        let setTaskForEnergyCollection = (creep, clearedMemory) => {
            let collect = creep.memory.collect;
            if (collect && creep.store.getFreeCapacity() == 0) {
                creep.memory.collect = false;
                collect = false;
            } else if (!collect && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                creep.memory.collect = true;
                collect = true;
                if (clearedMemory) {
                    creep.memory[clearedMemory] = undefined;
                }
            }
            return collect;
        }
        
        // sets the boolean collect according to the creep's current inventory (focusing on no material in particular) and returns it, while also altering the creeps "collect" memory variable
        // ! this function is used to ensure that creeps will collect resources until store is full, and then do things with those resources until all are expended ...
        // ... before collecting resources again
        let setTaskForGeneralCollection = (creep) => {
            let collect = creep.memory.collect;
            if (collect && creep.store.getFreeCapacity() == 0) {
                creep.memory.collect = false;
                collect = false;
            } else if (!collect && creep.store.getFreeCapacity() == creep.store.getCapacity()) {
                creep.memory.collect = true;
                collect = true;
            }
            return collect;
        }
        
        // makes the creep move to target, with the assumption that the target is within the same room (hence the maxRooms option)
        // ! note that throughout my code I have restricted moveTos, ensuring that every moveTo only ever spans a single room
        // ... hence, any inter-room travel must be done by use of the travelObject
        let moveCreepToLocalTarget = (creep, target, additionalMoveToOptions=null) => {
            let options = {maxRooms: 1, visualizePathStyle: {stroke: '#ffaa00'}};
            if (additionalMoveToOptions) {
                Object.assign(options, additionalMoveToOptions);
            }
            creep.moveTo(target, options);
        }
        
        // once the creep is sufficiently close to death, makes the creep return to base, returning any carried resources to the storage (remitting); creep then commits suicide
        // returns true if creep is "dying" and completing the remitting process (including the suicide) or else just suiciding; returns false otherwise
        // ticksToLive must be an integer; once the creeps actual ticksToLive falls below the passed ticksToLive this function will begin to schedule actions for the creep
        // set explicitRemit to false to prevent unit from explicitly returning resources (even when storage exists), so that they will simply suicide once store is empty
        // ! if there is no storage at base, then explicit remittance cannot occur;
        // ! note that units that tend to exist without a storage present in the base can still benefit from this function, however, as it will help to prevent them ...
        // ... from dropping resources by causing suicide the moment the unit's store is empty thereby preventing the next collection
        // ! this function's return value must be used to trigger an end to the creep's role code in order to prevent the role code from interfering with scheduled actions
        let remitWhenDying = (creep, baseName, ticksToLive, explicitRemit=true) => {
            if (!Number.isInteger(ticksToLive)) {
                console.log("WARNING: ticksToLive, as an argument to the function call remitWhenDying, is not an integer! (Perhaps remittingTick must be set in memory for creep "+creep.name+".) Skipping remit code.");
                return false; // ! attempt to execute role-code
            }
            if (creep.ticksToLive >= ticksToLive) { // ! if NOT "dying"
                return false; // ! resume execution of role-code...
            } else { // when "dying"
                if (creep.store.getUsedCapacity() == 0) { // if NOT carrying anything...
                    creep.suicide();
                    return true; // ! immediately terminate role-code
                } else { // when creep is carrying resources...
                    let baseRoom = Game.rooms[baseName];
                    let st = baseRoom.storage;
                    if (st && st.my && explicitRemit) { // if there is a storage to return carried resources to and explicitRemit is true...
                        if (creep.room.name != baseName) {
                            // return to base first
                            travelToTargetRoom(creep, 1);
                            return true;
                        } else { // if in base
                            // place first resource in store into storage... // !!! this section could perhaps be factored out and improved...
                            for (let rt in creep.store) { // ! this loop must iterate at least once, since it has already been confirmed that the creep has resources...
                                if (creep.transfer(st, rt) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(st, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                                }
                                return true; // ! immediately stop scheduling tasks to ensure that resources are delivered to storage
                            }
                        }
                    } else { // if there is NO storage to return carried resources to or explicitRemit is false...
                        return false; // ! resume execution of role-code...
                    }
                }
            }
        }
        
        // if creep.memory.recycle is true, makes a creep return to base, place any carried resources in the storage, and then recycle at the central spawn; otherwise does nothing
        // returns true if creep is to be recycled; false otherwise
        // when spawnScavenger is set to true, a scavenger should eventually spawn (due to Base triggers) to collect any dropped resources from recycling...
        // this method is mostly intended to be used on miner creeps, such as when they are to be replaced by another miner type (such as harvesters replaced by dropMiner)
        // ! this function's return value must be used to trigger an end to the creep's role code in order to prevent the role code from interfering with scheduled actions
        let recycleWhenRedundant = (creep, baseName, spawnScavenger=false) => {
            if (!creep.memory.recycle) { // ! if NOT recycling
                return false;
            } else { // if recycling
                if (creep.room.name != baseName) {
                    // return to base first
                    travelToTargetRoom(creep, 1);
                } else { // if in base
                    let base = this.bases[baseName];
                    let st = creep.room.storage;
                    // place all resources into storage... // !!! this section could be factored out and improved...
                    if (st && st.my) {
                        for (let rt in creep.store) { // rt is resource type
                            if (creep.transfer(st, rt) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(st, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                            }
                            return true; // ! immediately stop scheduling tasks if creep has resources in store to ensure that they are delivered to storage
                        }
                    }
                    let sp = Game.getObjectById(base.centralSpawnID);
                    // recycle at spawn
                    if (sp.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sp, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    if (spawnScavenger) {
                        base.spawnScavenger = true;
                    }
                }
                return true;
            }
        }
        
        // !!! note that this is not used anywhere at this point; I am simply keeping it here on the off-chance that I might update it and use it later...
        let renewWhenDying = (creep, baseName, collect) => {
            if (creep.memory.renewing || (collect && creep.store.getFreeCapacity() == creep.store.getCapacity() && creep.ticksToLive < 800 && creep.room.name == baseName)) {
                let sp = Game.spawns[this.bases[baseName].spawnNames[0]];
                if (creep.ticksToLive < 1480) {
                    if (sp.renewCreep(creep) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sp, {maxRooms: 1, reusePath: 15, visualizePathStyle: {stroke: '#ffffff'}})
                    }
                    creep.memory.renewing = true;
                } else {
                    creep.memory.renewing = false;
                }
            }
        }
        
        // makes creep move to a space immediately adjacent to the wait location that was set in room memory
        // if remit is true, then the creep will place all resources in store before going to wait location
        let rallyAtWaitLocation = (creep, baseName, remit=false) => {
            let room = Game.rooms[baseName];
            if (room.memory[WAIT_LOCATION_SET]) {
                if (remit) { // if returning all resources before waiting...
                    let st = creep.room.storage;
                    // place all resources into storage... // !!! this section could be factored out and improved...
                    if (st && st.my) {
                        for (let rt in creep.store) { // rt is resource type
                            if (creep.transfer(st, rt) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(st, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                            }
                            return; // ! immediately stop scheduling tasks if creep has resources in store to ensure that they are delivered to storage
                        }
                    }
                }
                let loc = room.memory[WAIT_LOCATION];
                if (creep.pos.getRangeTo(loc[0], loc[1]) != 1) { // ! attempts at moves will only be made when the creep is not at specified range of 1
                    creep.moveTo(loc[0], loc[1], {maxRooms: 1, range: 1, visualizePathStyle: {stroke: '#ffffff'}}); // ! notice the range option...
                }
            }
        }
        
        // makes the creep wait (or idle) in the current room at coordinates [idleX, idleY] when those properties are set within the creep's memory
        let idleInCurrentRoom = (creep) => {
            let idleX = creep.memory.idleX;
            if (idleX) {
                let idleY = creep.memory.idleY;
                if (idleY) {
                    if (creep.pos.x != idleX || creep.pos.y != idleY) {
                        creep.moveTo(idleX, idleY, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
        
        // sets the setMemoryString-value (in creep's memory) to newTarget's ID when the current target is no longer valid according to the lambdaBooleanExpression...
        // ... but otherwise not changing memory at all, returning the in-game object associated with resulting memory
        let setTargetInMemory = (creep, newTarget, lambdaBooleanExpression, setMemoryString="targetID") => {
            let target = Game.getObjectById(creep.memory[setMemoryString]);
            if (lambdaBooleanExpression(target)) {
                if (newTarget) {
                    target = newTarget;
                    creep.memory[setMemoryString] = newTarget.id;
                } else {
                    target = null;
                    creep.memory[setMemoryString] = null;
                }
            }
            return target;
        }
        
        // makes creep move to and attack target; when the target is a moving one, enables the creep to move with the target while still successfully attacking each tick
        // ! note that the chasing creep will not necessarily pursue into another room, however (depending on whether unit returns to base or targetRoom, for example)
        // !!!!! this should probably be updated with other attack types, such as rangedAttack... maybe with passed arguments for the sake of efficiency...
        let chaseAndAttack = (creep, target) => {
            creep.attack(target);
            if (creep.pos.getRangeTo(target) == 1) {
                creep.move(creep.pos.getDirectionTo(target));
            } else {
                creep.moveTo(target, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        
        // makes creep move to and heal target; when the target is a moving one, enables the creep to move with the target while still successfully healing each tick
        // if the target is not within 1 unit of range, the healer will attempt to do rangedHeals
        // note that the healer will heal target no matter what the target's health is
        // set healAlreadyScheduled to true to prevent scheduling of any heal-actions, for when a unit may have already scheduled healing of self but used this function ...
        // ... anyway for both the potential need to heal the chased target and also to simply continue chasing
        // ! note that the healer may not pursue into another room
        let chaseAndHeal = (creep, target, healAlreadyScheduled=false) => {
            if (creep.pos.getRangeTo(target) == 1) {
                creep.move(creep.pos.getDirectionTo(target));
                if (!healAlreadyScheduled) {
                    creep.heal(target);
                }
            } else {
                creep.moveTo(target, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                if (!healAlreadyScheduled) {
                    creep.rangedHeal(target);
                }
            }
        }
        
        // makes creep heal self when health is not full
        // returns true when creep has scheduled healing of self; false, otherwise
        let healSelfWhenInjured = (creep) => {
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
                return true;
            } else {
                return false;
            }
        }
        
        // sets a target for attacking in creep's memory, with targetID, according to the passed array priorities, returning the target object at end (which may be undefined)
        // priorities is an array of STRUCTURE_* constants or else the string "creeps" (indicating that the nearest enemy creep should be targeted)
        // the order of strings in the priorities array indicates the ordering of the search for a target
        // this function sets targetID in the memory of the passed creep
        // !!!!! this could be reworked to be more generic such that it could be a method of ScreepsScript that is called by any creep in any room ...
        // ..... and would be called something like requestTargetForAttack, accepting the additional option of roomName so that, perhaps, previous requests could be ...
        // ..... cached and reused; thus improving efficiency of attacking creeps
        let getTargetForAttackFromPriorities = (creep, priorities) => {
            let findTarget = false;
            let target;
            if (creep.memory.targetID) { // if targetID is set in memory...
                target = Game.getObjectById(creep.memory.targetID); 
                if (!target || target.room.name != creep.room.name) { // ... but the target no longer exists or is in another room...
                    findTarget = true;
                    creep.memory.targetID = null;
                }
            } else { // if there is NO targetID in memory...
                findTarget = true;
            }
            if (findTarget) {
                // iterating though priorities until first valid target is found (if any)
                for (let enemyType of priorities) {
                    if (enemyType === "creeps") {
                        let enemyCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        if (enemyCreep) {
                            creep.memory.targetID = enemyCreep.id;
                            target = Game.getObjectById(enemyCreep.id);
                            break;
                        }
                    } else {
                        let enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: { structureType: enemyType }});
                        if (enemyStructures.length > 0) {
                            creep.memory.targetID = enemyStructures[0].id;
                            target = Game.getObjectById(enemyStructures[0].id);
                            break;
                        }
                    }
                }
            }
            return target;
        }
        
        // this function returns the first resourceType encountered in a store; if none are encountered, returns null
        let getFirstResourceFromStore = (store) => {
            for (let resourceType in store) {
                return resourceType;
            }
            return null;
        }
        
        // this function returns the first resourceType (except RESOURCE_ENERGY) encountered in a store; if none are encountered, returns null
        let getFirstNonEnergyResourceFromStore = (store) => {
            for (let resourceType in store) {
                if (resourceType != RESOURCE_ENERGY) {
                    return resourceType;
                }
            }
            return null;
        }
        
        // returns true if the passed store has any energy in it; otherwise, returns false
        let storeHasEnergy = (store) => {
            return (store.getUsedCapacity(RESOURCE_ENERGY) > 0);
        }
        
        // returns true if the store has minerals; otherwise, returns false
        // ! note that this function assumes that the passed store is a general one capable of holding minerals; this function may yield strange results if passed a non-generic store
        let storeHasMinerals = (store) => {
            return (store.getUsedCapacity() > store.getUsedCapacity(RESOURCE_ENERGY));
        }
        
        // returns true if the passed store is a general one, meaning it can hold both energy and minerals; otherwise, returns false
        let isGeneralStore = (store) => {
            if (store.getCapacity() == null) {
                return false;
            } else {
                return true;
            }
        }
        
        // sets target for looting in creep's memory, with targetID, according to the passed array priorities, returning the target object at end (which may be undefined)
        // energyOrMineralsBoolean must be a boolean value; when true, only energy will be collected; when false, only minerals will be collected
        // priorities is an array of FIND_* constants or else the constant STRUCTURE_STORAGE...
        // ... the order of strings in the array indicates the ordering of the search while looking for a target to loot from
        // this function sets targetID and targetType in the memory of the passed creep
        // ! note that targetType is 0 for withdraw-able resources, and 1 for pickUp-able resources
        let getTargetForLootingFromPriorities = (creep, energyOrMineralsBoolean, priorities) => {
            let resourceType; // ! note that this is not a true resourceType, and it will indicate either RESOURCE_ENERGY or else (through a custom string) all-minerals
            if (energyOrMineralsBoolean) {
                resourceType = RESOURCE_ENERGY; // collecting only energy
            } else {
                resourceType = "all_minerals"; // collecting only minerals
            }
            let findTarget = false;
            let target;
            let targetID = creep.memory.targetID;
            if (targetID) {
                target = Game.getObjectById(targetID);
                if (!target || (creep.memory.targetType != 1 && (resourceType == RESOURCE_ENERGY && !storeHasEnergy(target.store)) || (resourceType != RESOURCE_ENERGY && !storeHasMinerals(target.store)))) {
                    findTarget = true;
                    // clearing memory
                    creep.memory.targetID = undefined;
                    creep.memory.targetType = undefined;
                }
            } else {
                findTarget = true;
            }
            if (findTarget) {
                for (let px of priorities) {
                    let targetType = 0; // every target is of type 0, except for dropped resources because they can only be retrieved with the function pickUp
                    if (px == STRUCTURE_STORAGE) {
                        if (creep.room.storage && !creep.room.storage.my && ((resourceType == RESOURCE_ENERGY && storeHasEnergy(creep.room.storage.store))
                                                                             || (resourceType != RESOURCE_ENERGY && storeHasMinerals(creep.room.storage.store)))) {
                            creep.memory.targetID = creep.room.storage.id;
                            creep.memory.targetType = targetType;
                            target = creep.room.storage;
                            break;
                        }
                    } else if (px == FIND_HOSTILE_STRUCTURES) {
                        let structures = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (st) => {
                            return (st.store && st.structureType != STRUCTURE_NUKER && ((resourceType == RESOURCE_ENERGY && storeHasEnergy(st.store))
                                                                                        || (resourceType != RESOURCE_ENERGY && isGeneralStore(st.store) && storeHasMinerals(st.store))));
                        }});
                        if (structures.length > 0) {
                            creep.memory.targetID = structures[0].id;
                            creep.memory.targetType = targetType;
                            target = structures[0];
                            break;
                        }
                    } else {
                        let foundTargets;
                        if (px == FIND_DROPPED_RESOURCES) {
                            targetType = 1;
                            foundTargets = creep.room.find(px, {filter: (obj) => {
                                return ((resourceType == RESOURCE_ENERGY && obj.resourceType == RESOURCE_ENERGY)
                                        || (resourceType != RESOURCE_ENERGY && obj.resourceType != RESOURCE_ENERGY));
                            }});
                        } else {
                            foundTargets = creep.room.find(px, {filter: (obj) => {
                                return ((resourceType == RESOURCE_ENERGY && storeHasEnergy(obj.store))
                                        || (resourceType != RESOURCE_ENERGY && isGeneralStore(obj.store) && storeHasMinerals(obj.store)));
                            }});
                        }
                        if (foundTargets.length > 0) {
                            creep.memory.targetID = foundTargets[0].id;
                            creep.memory.targetType = targetType;
                            target = foundTargets[0];
                            break;
                        }
                    }
                }
                if (!target) { // if no target was found...
                    // clearing memory
                    creep.memory.targetID = undefined;
                    creep.memory.targetType = undefined;
                }
            }
            return target;
        }
        
        // sets a target in creep's memory, with targetID, according to the passed array priorities, returning the target object at end (which may be undefined)
        // ! note that this function uses findClosestByRange for every target selection WITHOUT any checks at to whether the target might have moved, died, is empty, etc....
        // priorities is an array of FIND_* constants, indicating the order of the search
        let getClosestTargetByPriority = (creep, priorites) => {
            let findTarget = false;
            let target;
            let targetID = creep.memory.targetID;
            if (targetID) {
                target = Game.getObjectById(targetID)
            } else {
                findTarget = true;
            }
            if (findTarget) {
                for (let findConstant of priorities) {
                    target = creep.pos.findClosestByRange(findConstant);
                    if (target) {
                        creep.memory.targetID = target.id;
                        break; // stop after finding first valid target
                    }
                }
            }
            return target;
        }
        
        // makes the creep move to the target controller, and upgrade it
        // ! note that this function assumes target is a valid controller
        let moveToAndUpgradeTarget = (creep, target, additionalMoveToOptions=null) => {
            if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                moveCreepToLocalTarget(creep, target, additionalMoveToOptions);
            }
        }
        
        // makes the creep move to the target construction site, and build it
        // ! note that this function assumes that target is a valid construction site
        let moveToAndBuildTarget = (creep, target, additionalMoveToOptions=null) => {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                moveCreepToLocalTarget(creep, target, additionalMoveToOptions);
            }
        }
        
        // makes the creep move to the target structure, and then repair it
        // ! note that this function assumes that target is a valid structure, and it also makes no assessment of the current health of the structure
        let moveToAndRepairTarget = (creep, target, additionalMoveToOptions=null) => {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                moveCreepToLocalTarget(creep, target, additionalMoveToOptions);
            }
        }
        
        // makes the creep move to the target source, and then harvest from it
        // ! note that this function assumes that target is a valid source
        let moveToAndHarvestFromTarget = (creep, target, additionalMoveToOptions=null) => {
            let code = creep.harvest(target);
            if (code == ERR_NOT_IN_RANGE || code == ERR_NOT_ENOUGH_RESOURCES) { // !!! is this "code" approach better here?
                moveCreepToLocalTarget(creep, target, additionalMoveToOptions);
            }
        }
        
        // makes the creep move to the target and transfer all of resourceType from its store to the store of the target
        // ! note that this function assumes that target still exists and has a valid store and that creep has resourceType in own store
        let moveToAndTransferResourceToTarget = (creep, target, resourceType, additionalMoveToOptions=null) => {
            if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                moveCreepToLocalTarget(creep, target, additionalMoveToOptions);
            }
        }
        
        // makes a creep transfer all energy to the target depending on certain conditions, explained immediately below
        // when a threshold was passed and the target exists, the creep will only transfer when the target has less than the threshold...
        // ... but if a threshold was NOT passed and the target exists, the creep will move to target and attempt to transfer all energy
        // ... but if target is invalid, creep will not be scheduled to do anything
        // this function returns true whenever a creep is scheduled to move to and transfer to the target; otherwise, returns false
        let transferEnergyToTarget = (creep, target, threshold) => {
            if (target) {
                if (target.structureType == STRUCTURE_STORAGE && !target.my) {
                    return false; // do not allow transferring to enemy storage...
                }
                if (threshold) {
                    if (target.store.getUsedCapacity(RESOURCE_ENERGY) < threshold) {
                        moveToAndTransferResourceToTarget(creep, target, RESOURCE_ENERGY);
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    moveToAndTransferResourceToTarget(creep, target, RESOURCE_ENERGY);
                    return true;
                }
            } else {
                return false;
            }
        }
        
        // makes a creep transfer all carried energy into the highest priority target, or, more specifically, the first valid target encountered in the priorities array
        // note that each element of priorities must be a structure object that has a store capable of holding energy OR ELSE ...
        // ... it must be a construction site, in which case the creep will build instead of technically "transfer" OR ELSE ...
        // ... it must be an array where index 0 is the structure object, and index 1 is a threshold value
        // this function returns true whenever the creep was scheduled some task relating to a target; it returns false when nothing was scheduled (because no valid target)
        // !!!!! could make something similar for other resourceTypes...
        let transferEnergyByPriority = (creep, priorities) => {
            for (let target of priorities) {
                if (Array.isArray(target)) {
                    if (transferEnergyToTarget(creep, target[0], target[1])) {
                        return true;
                    }
                } else if (target && Game.constructionSites[target.id]) {
                    moveToAndBuildTarget(creep, target);
                    return true;
                } else {
                    if (transferEnergyToTarget(creep, target)) { // if target exists (and, hence, a move was done or transfer attempted)
                        return true;
                    }
                }
            }
            return false;
        }
        
        // makes the creep move to target (structure, grave, ruin, etc.) to withdraw (as much as holdable) the specified resourceType from it
        // ! note that this function assumes that the target exists and has a valid store containing specified resourceType, and that the creep has carrying capacity
        let moveToAndWithdrawResourceFromTarget = (creep, target, resourceType, additionalMoveToOptions=null) => {
            if (creep.withdraw(target, resourceType) == ERR_NOT_IN_RANGE) {
                moveCreepToLocalTarget(creep, target, additionalMoveToOptions);
            }
        }
        
        // makes the creep move to target dropped resource, and pick it up
        // ! note that this function assumes that the dropped resource still exists and that the creep has carrying capacity
        let moveToAndPickUpDroppedResource = (creep, target, additionalMoveToOptions=null) => {
            if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
                moveCreepToLocalTarget(creep, target, additionalMoveToOptions);
            }
        }
        
        // makes the creep move to target (if it exists) and pick it up or withdraw from it (depending on whether it is dropped resource or resource in store)
        // this is used primarily by looters, who frequently pick up dropped resources or loot resources from objects
        // resourceType is optional, and when not provided the creep will loot first available resource from store; however, resourceType may be set to ...
        // ... a special argument "mineralsOnly", to trigger the collection of minerals exclusively, such that all RESOURCE_ENERGY in target store will be ignored
        // ! note that the passed creep must have targetType set in memory to use this function
        let pickupOrWithdrawFromTarget = (creep, target, resourceType, additionalMoveToOptions=null) => {
            if (target) {
                let targetType = creep.memory.targetType;
                if (targetType == 0) {
                    if (!resourceType) {
                        resourceType = getFirstResourceFromStore(target.store);
                    } else if (resourceType == "mineralsOnly") {
                        resourceType = getFirstNonEnergyResourceFromStore(target.store);
                    }
                    moveToAndWithdrawResourceFromTarget(creep, target, resourceType, additionalMoveToOptions);
                } else {
                    moveToAndPickUpDroppedResource(creep, target, additionalMoveToOptions);
                }
            }
        }
        
        // makes a creep withdraw energy from storage or harvest at energy source while setting the creep's memory to the task to maintain relative efficiency
        // the creep will only withdraw from storage when storage's store of energy is above the passed threshold
        // the creep will not try to use any source that is empty or that is in use by dropMiners, linkMiners, or upgradeMiners
        // returns true if the creep has been set to work; otherwise, false
        // ! note that this function uses creep memory "storageOrSource" and "storageOrSourceID"; ...
        // ... storageOrSource is 0 when creep is using storage, but is 1 when creep is using source for collecting energy; ...
        // ... storageOrSourceID is simply the ID-string of the storage or source currently in use by creep
        let withdrawOrHarvestEnergy = (creep, storageThreshold) => {
            let target = Game.getObjectById(creep.memory.storageOrSourceID);
            // when no target, or the target should not be used, or is empty...
            if (!target ||
              (creep.memory.storageOrSource == 0 && target.store.getUsedCapacity(RESOURCE_ENERGY) < storageThreshold) ||
              (creep.memory.storageOrSource == 1 && target.energy == 0)) {
                // then find new target...
                target = null;
                if (creep.room.storage && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > storageThreshold) {
                    target = creep.room.storage;
                    creep.memory.storageOrSourceID = target.id;
                    creep.memory.storageOrSource = 0;
                } else {
                    let index = -1;
                    for (let sourceID of this.bases[creep.memory.base].sourceIDs) {
                        index++;
                        let source = Game.getObjectById(sourceID);
                        // when the source is not empty and it is not a dropMine, linkMine, or upgradeMine ...
                        if (source.energy > 0 && (!this.linkMines || !this.linkMines[index])
                                              && (!this.dropMines || !this.dropMines[index])
                                              && (!this.upgradeMine || this.upgradeMine.sourceIndex != index)) {
                            // ... then use this source
                            target = source;
                            creep.memory.storageOrSourceID = source.id;
                            creep.memory.storageOrSource = 1;
                            break;
                        }
                    }
                }
                // when target still hasn't been set...
                if (!target) {
                    // ... reset related memory
                    creep.memory.storageOrSourceID = null;
                    creep.memory.storageOrSource = null;
                }
            }
            let working = true;
            let targetType = creep.memory.storageOrSource;
            if (target && targetType == 0) {
                moveToAndWithdrawResourceFromTarget(creep, target, RESOURCE_ENERGY);
            } else if (target && targetType == 1) {
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {maxRooms: 1, visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                working = false;
            }
            return working;
        }
        
        // makes the creep work on a construction-site of the given siteType; returns true if a site of that type exists and actions were scheduled; otherwise, false
        // siteType must be one the global constants FORT, ROAD, or MAIN
        let workOnConstructionForSiteType = (creep, baseName, siteType) => {
            let target = this.bases[baseName].constructionSitesObject[siteType][SITE];
            if (target) {
                moveToAndBuildTarget(creep, target);
                return true;
            } else {
                return false;
            }
        }
        
        // makes the creep withdraw max carrying-capacity of resourceType from the storage within the same room (assuming the storage exists)
        // when the storage does not exist no tasks will be scheduled and a warning will be issued
        // ! note that this function assumes that the creep has carrying capacity, and that the storage contains resourceType
        let withdrawFromLocalStorage = (creep, resourceType) => {
            let storage = creep.room.storage;
            if (storage) {
                if (creep.withdraw(storage, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, {maxRooms: 1, visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                console.log("WARNING: Creep "+creep.name+" tried to withdraw from storage in room "+creep.room.name+", but storage does not exist!");
            }
        }
        
        // makes the creep transfer all carried resourceType to the storage within the same room (assuming the storage exists)
        // when the storage does not exist no tasks will be scheduled
        // ! note that this function assumes that the creep has a valid non-empty store containing resourceType
        let transferToLocalStorage = (creep, resourceType, additionalMoveToOptions=null) => {
            let storage = creep.room.storage;
            if (storage) {
                if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                    moveCreepToLocalTarget(creep, storage, additionalMoveToOptions);
                }
            }
        }
        
        // makes the creep move to passed target and transfer all carried resources to the same target
        // returns true if the target exists and actions (movement and/or transferring) have been scheduled; otherwise, false
        // ! note that this function assumes that the creep has a valid non-empty store, and that target (when existing) has an appropriate store
        let transferAllCarriedToTarget = (creep, target, additionalMoveToOptions=null) => {
            if (target) {
                for (let resourceType in creep.store) {
                    moveToAndTransferResourceToTarget(creep, target, resourceType, additionalMoveToOptions);
                    return true;
                }
            }
            return false;
        }
        
        // makes the creep transfer all carried energy into the spawn or extension that relates to the base object, spawnOrExt
        // returns true when a valid target exists, and a moveTo and/or transfer was scheduled; otherwise, returns false and schedules no action
        // ! note that this function assumes that the creep has energy in store, and also demands that the base of baseName exists
        let transferEnergyToSpawnOrExtension = (creep, baseName) => {
            let target = this.bases[baseName].spawnOrExt;
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                }
                return true;
            } else {
                return false;
            }
        }
        
        // makes the creep move to the position [x,y] within the current room
        // returns true when movement towards position has occurred; returns false when the creep is already in position
        let moveToPositionXY = (creep, x, y, additionalMoveToOptions=null) => {
            if (creep.pos.x != x || creep.pos.y != y) {
                let options = {maxRooms: 1, visualizePathStyle: {stroke: '#ffaa00'}};
                if (additionalMoveToOptions) {
                    Object.assign(options, additionalMoveToOptions);
                }
                creep.moveTo(x, y, options);
                return true;
            } else {
                return false;
            }
        }
        
        // makes the creep move to the passed position
        // ! note that position should be a valid RoomPosition object (but can otherwise be a custom object with the properties of x and y)
        // returns true when movement towards position has occurred; returns false when the creep is already in position
        let moveToPosition = (creep, position, additionalMoveToOptions=null) => {
            return moveToPositionXY(creep, position.x, position.y, additionalMoveToOptions);
        }
        
        // makes a mine-working creep build a mine-related structure (when enough energy in store) or otherwise harvest energy (when store is below threshold)
        // siteID must be an ID-string, and should generally be either dropMine.siteID or else linkMine.siteID, due to the specific nature of this function
        // ! this function is meant to be used within the role code for dropMiners and linkMiners, who assist with the construction of their related structures
        let buildMineOrHarvestEnergy = (creep, siteID, source) => {
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 40) {
                creep.build(Game.getObjectById(siteID));
            } else {
                creep.harvest(source);
            }
        }
        
        // assigns the creep to the least occupied mining position for the provided base
        // ! this function is to be used to assign dropMiners, gatherers, and linkMiners to their respective mine-type (from within their birth-function)
        // mineArray must be one of the mine arrays and will thus be one of the following: base.dropMines or base.linkMines
        // memoryIndexString should be one of the constants DMI or LMI accordingly
        // nameString should be left at default for dropMiners and linkMiners, but for gatherers it must be set to the string "gathererNames"; note that both ...
        // ... of these values are set according to the contents of the base method createDropMineObject
        // ! note that dropMines and linkMines are only supposed to have one miner each, despite what this function enables
        let assignCreepToMine = (creep, mineArray, memoryIndexString, nameString="creepNames") => {
            let lowest = {
                count: -1,
                index: -1
            };
            let index = -1;
            let minesFound = 0;
            for (let mine of mineArray) {
                index++;
                if (mine) {
                    minesFound++;
                    let assigneeCount = 0;
                    for (let x in mine[nameString]) {
                        assigneeCount++;
                    }
                    if (lowest.count == -1 || assigneeCount < lowest.count) {
                        lowest.count = assigneeCount;
                        lowest.index = index;
                    }
                }
            }
            if (minesFound >= 1) { // if at least one mine exists...
                mineArray[lowest.index][nameString][creep.name] = true;
                creep.memory[memoryIndexString] = lowest.index;
            }
        }
        
        // this is a convenience function for the overseer role exclusively that sets overseer memory so as to trigger the appropriate task each subsequent tick
        // ! note that each tick the overseer will generally either be collecting resources from some structure, or else transferring said resources to some other structure
        // id should be the ID-string of an overseer-adjacent structure, indicating that it will receive the upcoming transfer
        // resourceType indicates what resource was just collected, and will thus be transferred on next action
        // collectingThisTick, when true, causes creep.memory.collect to be set to false, because collection will be done this tick and next tick's action will be a transfer;
        // ... when false, creep.memory.collect will be set to true, because this tick the transfer will be completed and next tick's action will be collection
        // ! when collectingThisTick is set to false, note that id and resourceType must BOTH be set to NULL, to ensure correct setting of memory
        let setMemoryForNextTransfer = (creep, id, resourceType, collectingThisTick=true) => {
            creep.memory.targetID = id;
            creep.memory.resourceType = resourceType;
            if (collectingThisTick) {
                creep.memory.collect = false;
            } else {
                creep.memory.collect = true;
            }
        }
        
        // sets every passed memory property in the array memoryArray to null in the creep's memory, if not already set in the creep's memory, so that ...
        // ... it is visible and available within the console
        // memoryArray should be an array consisting only of role memory constants of the appropriate type, such as IDLE_X, IDLE_Y, etc....
        // ! this function is meant to be used mostly in birth-functions for memory properties that can be manually adjusted through the console
        let setManualMemoryForCreepWhenUndefined = (creep, memoryArray) => {
            for (let mem of memoryArray) {
                if (creep.memory[mem] == undefined) {
                    creep.memory[mem] = null;
                }
            }
        }
        
        // BEGINNING ROLE CREATION...
        // every distinct creep role is created within this section
        // each role is created within a separate block to help prevent scope issues and follows a standardized order of tasks...
        // ... first, a role is created with the function makeCreepRole, then the appropriate individual properties are set, and then the role-object is pushed onto rolesArr
        // ... so that, by end, the array should hold every created role; it is then used to set the object this.roles and to set the integer value for this.uniqueRoles
        // see the makeCreepRole function above for a list of all role properties and their descriptions
        // ! arrow functions are used for the RUN_FUNCTIONs to make it so that "this" refers to the ScreepsScript object
        // ! roles are ordered alphabetically by ROLE_NAME
        // ! note that if, for any creep, memory.role is directly changed through the console or GUI, creep counts need to be redone (by means of a re-commit)
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "antagonizer";
            
            // the antagonizer stands in one position within a (preferably enemy-owned) room, indicated by targetRoom, standing at position idleX/idleY
            // this role is meant to have HEAL parts and plenty of toughs, as it does nothing except take hits where it stands (usually from turret-fire)
            // this role is meant to be used primarily to annoy (or antagonize) opponents and waste their energy (again, mostly through turret-fire)
            
            role[RUN_FUNCTION] = (creep) => {
                let targetRoom = creep.memory.targetRoom;
                if (creep.room.name == targetRoom || creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
                if (creep.room.name != targetRoom) {
                    travelToTargetRoom(creep);
                } else {
                    idleInCurrentRoom(creep);
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, IDLE_X, IDLE_Y];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "attacker";
            
            // the attacker moves to an enemy room, indicated by targetRoom, and then attacks targets in the room according to a specific priority
            // this role prioritizes attacks thus: tower, spawn, hostile-creeps, and then extensions (note that this role does not target terminals, storage, etc.)
            // this role is to be used when walls are not an issue and there is no particularly strong defense; in other words for low-lvl bases and cleanup
            // this role can be made to wait at a coordinate in the targetRoom when no targets exist, by setting idleX and idleY in unit memory
            
            role[RUN_FUNCTION] = (creep) => {
                if (creep.room.name != creep.memory.targetRoom) {
                    travelToTargetRoom(creep);
                } else {
                    let target = getTargetForAttackFromPriorities(creep, [STRUCTURE_TOWER, STRUCTURE_SPAWN, "creeps", STRUCTURE_EXTENSION]);
                    if (!target) {
                        idleInCurrentRoom(creep);
                    } else {
                        chaseAndAttack(creep, target);
                    }
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                setManualMemoryForCreepWhenUndefined(creep, [IDLE_X, IDLE_Y]);
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "attackerX";
            
            // the attackerX moves to a room, indicated by targetRoom, and then stays within that room attacking only a single specified target, as indicated by targetID
            
            role[RUN_FUNCTION] = (creep) => {
                if (creep.room.name != creep.memory.targetRoom) {
                    travelToTargetRoom(creep);
                } else {
                    let target = Game.getObjectById(creep.memory.targetID);
                    if (target) {
                        chaseAndAttack(creep, target);
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "builder";
            
            // the builder builds all construction sites except roads, walls, and ramparts
            // this role will withdraw exclusively from storage (as long as the storage has at least a specific amount), but will otherwise harvest from sources
            // note that this role will not harvest from sources that are used by dropMiners, linkMiners, or upgradeMiners
            // this role will wait at the room-memory-based wait-location when it cannot collect any resources
            // when all (MAIN) construction is done, this role will recycle
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        if (!withdrawOrHarvestEnergy(creep, BUILDER_USE_STORAGE_THRESHOLD)) { // when withdrawing or harvesting cannot be completed
                            rallyAtWaitLocation(creep, baseName);
                        }
                    } else {
                        if (!workOnConstructionForSiteType(creep, baseName, MAIN)) { 
                            creep.memory.recycle = true; // ! creep is no longer needed since all construction is complete...
                        }
                    }
                }
            }
            
            // !!! could be improved upon... (such as by fine tuning according to controller level and storage amounts)
            role[SPAWN_CONDITION] = (baseName) => {
                let site = this.bases[baseName].constructionSitesObject[MAIN][SITE];
                let room = Game.rooms[baseName];
                if (room.controller.level >= 7 && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 45000) { // !!!!!!!! TEMP (this is to ensure that builder does not deplete storage when building expensive structures)
                    return false;
                }
                if (site) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT, STORAGE_OR_SOURCE_ID, STORAGE_OR_SOURCE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "builderX";
            
            // the builderX moves to targetRoom to build a specified (by targetID) site, using energy taken from storage exclusively
            // when creep's memory option useBaseStorage is true, collects energy from base's storage; when false, collects energy from targetRoom's storage
            // once the target site is completed, this role will work on MAIN sites if targetRoom is a base; otherwise this role will do nothing
            // this role is meant to be used to help building in less developed bases
            // !!! a spawn-condition would be useful to have for a few reasons... then this role could be recyclable potentially...
            // ... a spawn-condition should at least check for the existence of site by targetID...
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 200, false)) { return; } // ! terminate role code immediately if remitting
                let targetRoom = creep.memory.targetRoom;
                let collect = setTaskForEnergyCollection(creep);
                if (collect) {
                    if (creep.memory.useBaseStorage) {
                        if (creep.room.name != baseName) {
                            travelToTargetRoom(creep, 1);
                        } else {
                            withdrawFromLocalStorage(creep, RESOURCE_ENERGY);
                        }
                    } else {
                        if (creep.room.name != targetRoom) {
                            travelToTargetRoom(creep);
                        } else {
                            withdrawFromLocalStorage(creep, RESOURCE_ENERGY);
                        }
                    }
                } else {
                    if (creep.room.name != targetRoom) {
                        travelToTargetRoom(creep);
                    } else {
                        let site = Game.getObjectById(creep.memory.targetID);
                        if (!site) {
                            let base = this.bases[targetRoom];
                            if (base) { // if the target room is a base
                                site = base.constructionSitesObject[MAIN][SITE];
                            }
                        }
                        if (site) {
                            moveToAndBuildTarget(creep, target);
                        } else {
                            rallyAtWaitLocation(creep, baseName);
                        }
                    }
                }
            }
            
            // !!! would benefit from a spawn condition...
            //role[SPAWN_CONDITION] = (baseName) => {}
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                if (creep.memory.useBaseStorage == null) {
                    creep.memory.useBaseStorage = true;
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, TARGET_ID];
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "claimer";
            
            // the claimer interacts with a controller in targetRoom, based on the task held in its memory...
            // with task set to 1, the role will reserve the controller
            // with task set to 2, the role will claim the controller
            // with task set to 3, the role will attack the controller until it can be claimed, at which point the claimer will claim it
            
            role[RUN_FUNCTION] = (creep) => {
                if (creep.room.name != creep.memory.targetRoom) {
                    travelToTargetRoom(creep);
                } else {
                    let ctlr = creep.room.controller;
                    let task = creep.memory.task;
                    let code;
                    if (task == 0) {
                        code = creep.reserveController(ctlr);
                    } else if (task == 1) {
                        code = creep.attackController(ctlr);
                    } else if (task == 2) {
                        code = creep.claimController(ctlr);
                    } else if (task == 3) {
                        code = creep.claimController(ctlr);
                        if (code == ERR_INVALID_TARGET) {
                            creep.attackController(ctlr);
                        }
                    } else {
                        console.log("WARNING: unrecognized task memory-value for "+creep.name+" in room "+creep.room.name+"...");
                    }
                    if (code == ERR_NOT_IN_RANGE) {
                        creep.moveTo(ctlr, {maxRooms: 1, visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, TASK];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "contributor";
            
            // the contributor takes resourceType from the base's storage, and then carries it to targetRoom to transfer it into that room's storage
            // this role will commit suicide rather than collect more resources for delivery if dying; change the remitWhenDying value to adjust when this happens
            // !!! note that this role currently has no start or stop point, and will simply move everything and even continue spawning until manually removed from spawn array
            // !!!!! there is also nothing in the code currently that prevents baseName and targetRoom from being the same
            
            role[RUN_FUNCTION] = (creep) => {
                let resourceType = creep.memory.resourceType;
                let collect = setTaskForEnergyCollection(creep);
                if (collect) {
                    let baseName = creep.memory.base;
                    if (remitWhenDying(creep, baseName, 250)) { return; } // ! terminate role code immediately if remitting
                    if (creep.room.name != baseName) {
                        travelToTargetRoom(creep, 1);
                    } else {
                        withdrawFromLocalStorage(creep, resourceType);
                    }
                } else {
                    if (creep.room.name != creep.memory.targetRoom) {
                        travelToTargetRoom(creep);
                    } else {
                        transferToLocalStorage(creep, resourceType);
                    }
                }
            }
            
            // !!! would benefit from a spawn condition...
            //role[SPAWN_CONDITION] = (baseName) => {}
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, RESOURCE_TYPE];
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "demolisher";
            
            // the demolisher moves to targetRoom and destroys stuctures according to priority
            // this role is mostly for destroying crashed-bases and leftover structures
            // note that this role should only have work and move parts
            
            role[RUN_FUNCTION] = (creep) => {
                if (creep.room.name != creep.memory.targetRoom) {
                    travelToTargetRoom(creep);
                } else {
                    let target = getTargetForAttackFromPriorities(creep, [STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_EXTENSION]); // !!! could be improved...
                    if (!target) {
                        idleInCurrentRoom(creep);
                    } else {
                        if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                setManualMemoryForCreepWhenUndefined(creep, [IDLE_X, IDLE_Y]);
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "demolisherX";
            
            // the demolisherX simply moves to targetRoom and destroys the stucture whose ID is stored in memory, as targetID
            // note that this role should only have work and move parts
            
            role[RUN_FUNCTION] = (creep) => {
                if (creep.room.name != creep.memory.targetRoom) {
                    travelToTargetRoom(creep);
                } else {
                    let target = Game.getObjectById(creep.memory.targetID);
                    if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "distributor";
            
            // the distributor distributes energy from storage to all spawns and extensions within its own base exclusively
            // this role will spawn when an owned storage exists in base, regardless of the amount of energy in the storage
            // rather than die naturally while carrying resources, this role will return resources and then suicide; change the remitWhenDying value to adjust this timing
            // ! note that this role fills consecutive spawns/extensions (s/e) less quickly than otherwise due to the fact that it follows the tick-based availability of ...
            // ... spawnOrExt, which is only updated at the complete filling out of a s/e, thereby ensuring that this role makes no preemptive movements towards the next s/e
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 40)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        withdrawFromLocalStorage(creep, RESOURCE_ENERGY);
                    } else {
                        if (!transferEnergyToSpawnOrExtension(creep, baseName)) { // when there is no valid extension or spawn to fill...
                            rallyAtWaitLocation(creep, baseName);
                        }
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName) => {
                let curRoom = Game.rooms[baseName];
                let base = this.bases[baseName];
                if (curRoom.storage && curRoom.storage.my && curRoom.controller.level >= 4) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "dropMiner";
            
            // the dropMiner moves to an assigned dropMine to harvest energy, placing all resources into the container associated with the dropMine
            // this role handles the construction and maintenance of the dropMine container
            // this role should spawn automatically when appropriate (assuming it is properly placed in spawn arrays) as long as dropMines are set within room memory
            // note that this role is considered less efficient than other miner roles, and will generally be replaced by other miners when room memory includes placement for them
            // this role will recycle (leaving the container untouched) in case of replacement by linkMiner or upgradeMiner
            // also note that the gatherer role is meant to work with this role, as the gatherer is the only unit that collects energy from the dropMine container
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let dmi = creep.memory.dmi;
                    let dropMine = this.bases[baseName].dropMines[dmi];
                    if (dropMine) {
                        if (moveToPosition(creep, dropMine.pos)) {
                            // moving to position, and nothing else to do...
                        } else if (dropMine.containerID) { // if creep is in position and container was built
                            let dropContainer = Game.getObjectById(dropMine.containerID);
                            if (dropContainer) { // if dropContainer exists...
                                // ... then maintain it, or transfer to it, or harvest
                                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 40) {
                                    if (dropContainer.hits < dropContainer.hitsMax) {
                                        creep.repair(dropContainer);
                                    } else {
                                        creep.transfer(dropContainer, RESOURCE_ENERGY);
                                    }
                                } else {
                                    creep.harvest(Game.getObjectById(dropMine.sourceID));
                                }
                            } // ! else the dropContainer was destroyed, and will be dealt with at a later tick
                        } else if (dropMine.siteID) { // if creep is in position and container is under construction
                            let source = Game.getObjectById(dropMine.sourceID);
                            buildMineOrHarvestEnergy(creep, dropMine.siteID, source);
                        }
                    } else {
                        creep.memory.recycle = true; // ! creep is no longer needed due to dropMine being gone...
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                let curRoom = Game.rooms[baseName];
                let base = this.bases[baseName];
                if (curRoom.controller.level >= 4 && curRoom.storage && curRoom.storage.my && curCount < base.getMineArrayCount(base.dropMines)) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let baseName = creep.memory.base;
                let base = this.bases[baseName];
                assignCreepToMine(creep, base.dropMines, DMI);
            }
            
            role[RECOMMIT_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let dmi = creep.memory.dmi;
                if (dmi == undefined) {
                    role.birthFunction(creepName);
                } else {
                    let base = this.bases[creep.memory.base];
                    if (base.dropMines[dmi]) { // if a dropMine of the given index exists...
                        base.dropMines[dmi].creepNames[creepName] = true;
                    } else {
                        creep.memory.dmi = undefined;
                        role.birthFunction(creepName);
                    }
                }
            }
            
            role[DEATH_FUNCTION] = (creepName) => {
                let base = this.bases[Memory.creeps[creepName].base]
                let dmi = Memory.creeps[creepName].dmi;
                if (base) { // if the base still exists...
                    if (dmi != undefined && base.dropMines[dmi]) { // if the index is defined and the dropMine still exists
                        if (base.dropMines[dmi].creepNames[creepName]) { // if the creep was assigned within the object...
                            delete base.dropMines[dmi].creepNames[creepName];
                        }
                    }
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT, DMI];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "extractor";
            
            // the extractor moves to the local base's mineral and harvests it, returning all harvested mineral-resources to storage exclusively
            // this role spawns in controller-level EXTRACTOR_MIN_CONTROLLER_LEVEL and collects a quantity of mineral according to a value set in the spawn-condition; ...
            // ... it then stops spawning unless collected material quantity (as currently held within the base's storage exclusively) is below the same value
            // this role will not spawn while the base's mineral is depleted, but will respawn again upon the mineral's renewal if threshold value not met
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let mineral = Game.getObjectById(this.bases[baseName].mineralID);
                    let collect = setTaskForGeneralCollection(creep);
                    if (collect) {
                        let code = creep.harvest(mineral);
                        if (code == ERR_NOT_IN_RANGE || code == ERR_NOT_ENOUGH_RESOURCES) {
                            creep.moveTo(mineral, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    } else {
                        transferToLocalStorage(creep, mineral.mineralType);
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName) => {
                let base = this.bases[baseName];
                let room = Game.rooms[baseName];
                if (base.extractorID && room.storage.store.getUsedCapacity(base.mineralName) < 100000 && Game.getObjectById(base.extractorID)) {
                    let mineral = Game.getObjectById(base.mineralID);
                    if (mineral.mineralAmount > 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "fighter";
            
            // the fighter chases and attacks the first and nearest enemy creep seen in own base
            // ! this role will only spawn after a sustainedEnemyPresence; see this variable in the Base class and note its presence in the spawn-condition
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let target = getTargetForAttackFromPriorities(creep, ["creeps"]);
                    if (target) {
                        chaseAndAttack(creep, target);
                    } else {
                        rallyAtWaitLocation(creep, baseName);
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName) => {
                return this.bases[baseName].sustainedEnemyPresence;
            }
            
            role[AUTOMATIC_MEMORY] = [TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "forager";
            
            // the forager moves to targetRoom to collect (by automatic detection) from deposits or sources; it then brings all collected resources back to base
            // it will transfer everything to storage, except energy when a linkID is set (!!! this is in flux !!!)...
            // !!!!! this role is currently incomplete and untested...
            // !!! needs a proper spawn-condition; also, the linkID related stuff is very inadequate for now (in that the link must be manually built and link code may be otherwise inadequate)
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 200)) { return; } // ! terminate role code immediately if remitting
                let collect = setTaskForGeneralCollection(creep);
                if (collect) {
                    if (creep.room.name != creep.memory.targetRoom) {
                        travelToTargetRoom(creep);
                    } else {
                        let target = getClosestTargetByPriority(creep, [FIND_DEPOSITS, FIND_SOURCES]);
                        if (target) {
                            moveToAndHarvestFromTarget(creep, target, {reusePath: 30});
                        } else {
                            // !!! a proper spawn-condition is necessary before recycling can be allowed (otherwise may spawn and recycle indefinitely)...
                            // ... for now this unit's spawning must be handled manually
                            //creep.memory.recycle = true; // ! creep is no longer needed due to source or deposit no long existing in room...
                        }
                    }
                } else {
                    if (creep.room.name != baseName) {
                        travelToTargetRoom(creep, 1);
                    } else {
                        let target = Game.getObjectById(creep.memory.linkID);
                        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && target) {
                            transferEnergyToTarget(creep, target);
                        } else {
                            transferAllCarriedToTarget(creep, creep.room.storage, {reusePath: 30})
                        }
                    }
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                setManualMemoryForCreepWhenUndefined(creep, [LINK_ID]);
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM];
            
            role[AUTOMATIC_MEMORY] = [COLLECT, TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "fortifier";
            
            // the fortifier builds only walls and ramparts in its base
            // this role will withdraw exclusively from storage (as long as the storage has at least a specific amount), but will otherwise harvest from sources
            // note that this role will not harvest from sources that are used by dropMiners, linkMiners, or upgradeMiners
            // this role will wait at the room-memory-based wait-location when it cannot collect any resources
            // when all (FORT) construction is done, this role will recycle
            // ! note that the spawn-condition is fairly restrictive in that a storage is actually required
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        if (!withdrawOrHarvestEnergy(creep, FORTIFIER_USE_STORAGE_THRESHOLD)) { // when withdrawing or harvesting cannot be completed
                            rallyAtWaitLocation(creep, baseName);
                        }
                    } else {
                        let target = Game.getObjectById(creep.memory.targetID);
                        if (!target) { // if the construction site no longer exists (meaning it was completed or broken...)
                            let coords = creep.memory.targetCoords;
                            if (coords) {
                                // changing the targetID to the ID of the finished structure if it is a rampart and can be found at same location as old site...
                                for (let structure of Game.rooms[baseName].lookForAt(LOOK_STRUCTURES, coords[0], coords[1])) {
                                    if (structure.structureType == STRUCTURE_RAMPART && structure.hits < FORTIFIER_MINIMUM_RAMPART_HEALTH) {
                                        creep.memory.targetID = structure.id;
                                        creep.memory.targetType = 1;
                                        target = structure;
                                        break;
                                    }
                                }
                            }
                            if (!target) { // if still no valid target because rampart has enough health, or as before the target was completed or broken...
                                target = this.bases[baseName].constructionSitesObject[FORT][SITE];
                                if (target) { // if there are still fortifications to work on...
                                    creep.memory.targetID = target.id;
                                    creep.memory.targetCoords = [target.pos.x, target.pos.y];
                                    creep.memory.targetType = 0;
                                } else { // if all fortifications are completed...
                                    creep.memory.recycle = true; // ! creep is no longer needed due to fortifications being complete...
                                }
                            }
                        } else { // when target still exists...
                            let targetType = creep.memory.targetType;
                            if (targetType == 0) {
                                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                                }
                            } else if (targetType == 1) {
                                if (target.hits < FORTIFIER_MINIMUM_RAMPART_HEALTH) {
                                    if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(target, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                                    }
                                } else {
                                    creep.memory.targetID = null;
                                    creep.memory.targetCoords = null;
                                    creep.memory.targetType = null;
                                }
                            }
                        }
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                let room = Game.rooms[baseName];
                if (room.storage && room.storage.my && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > FORTIFIER_SPAWN_THRESHOLD && this.bases[baseName].constructionSitesObject[FORT][SITE] && curCount < 1) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT, STORAGE_OR_SOURCE_ID, STORAGE_OR_SOURCE, TARGET_ID, TARGET_TYPE, TARGET_COORDS];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "gatherer";
            
            // the gatherer is a dropMine worker who collects all energy that has been placed into the dropMine container, and moves it to storage
            // although this role works primarily with storage and only spawns when a storage is owned, it does place energy in spawns/extensions when a storage is lacking
            // also note the maximum spawnable creeps of this role is equal to the number of active dropMines (particularly for the sake of efficiency)
            // ! note that the gatherer will spawn before the completion of the dropMine-container; this is done to prevent issues with later (potential) energy shortages
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let base = this.bases[baseName];
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        let dmi = creep.memory.dmi;
                        let dropMine = base.dropMines[dmi];
                        if (dropMine) {
                            if (dropMine.containerID) {
                                let dropContainer = Game.getObjectById(dropMine.containerID);
                                if (dropContainer) {
                                    if (creep.withdraw(dropContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(dropContainer, {maxRooms: 1, visualizePathStyle: {stroke: '#ffaa00'}});
                                    }
                                } else { // if container broke at some point...
                                    rallyAtWaitLocation(creep, baseName);
                                }
                            } else { // when container has not yet been built...
                                rallyAtWaitLocation(creep, baseName);
                            }
                        } else {
                            creep.memory.recycle = true; // ! creep is no longer needed due to dropMine being gone...
                        }
                    } else {
                        if (!transferEnergyByPriority(creep, [creep.room.storage, base.spawnOrExt])) { // if none of the structures exist
                            rallyAtWaitLocation(creep, baseName);
                        }
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                let curRoom = Game.rooms[baseName];
                let base = this.bases[baseName];
                if (curRoom.controller.level >= 4 && curRoom.storage && curRoom.storage.my && curCount < base.getMineArrayCount(base.dropMines)) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let baseName = creep.memory.base;
                let base = this.bases[baseName];
                assignCreepToMine(creep, base.dropMines, DMI, "gathererNames");
            }
            
            role[RECOMMIT_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let dmi = creep.memory.dmi;
                if (dmi == undefined) {
                    role.birthFunction(creepName);
                } else {
                    let base = this.bases[creep.memory.base];
                    if (base.dropMines[dmi]) { // if a dropMine of the given index exists...
                        base.dropMines[dmi].gathererNames[creepName] = true;
                    } else {
                        creep.memory.dmi = undefined;
                        role.birthFunction(creepName);
                    }
                }
            }
            
            role[DEATH_FUNCTION] = (creepName) => {
                let base = this.bases[Memory.creeps[creepName].base]
                let dmi = Memory.creeps[creepName].dmi;
                if (base) { // if the base still exists...
                    if (dmi != undefined && base.dropMines[dmi]) { // if the index is defined and the dropMine still exists
                        if (base.dropMines[dmi].gathererNames[creepName]) { // if the creep was assigned within the position object...
                            delete base.dropMines[dmi].gathererNames[creepName];
                        }
                    }
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT, DMI];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "guard";
            
            // the guard moves to target room to wait at room position [x,y] (as set in memory), attacking any enemy creep that moves within its guarded range
            // this role will attack units as soon as they enter the guarded range and will chase the same target until it has moved outside of a slightly larger range or died
            // this role will also heal any injured allies within its guarded range when no enemies are within range (but, when enemies are present it will only heal self)
            // this role should have ATTACK, RANGED_ATTACK, and HEAL parts
            
            role[RUN_FUNCTION] = (creep) => {
                let GUARD_TARGETING_RANGE = 8;
                let GUARD_CHASING_RANGE = GUARD_TARGETING_RANGE + 4;
                let targetRoomName = creep.memory.targetRoom;
                if (creep.room.name != targetRoomName) {
                    travelToTargetRoom(creep);
                } else {
                    let guardPos = new RoomPosition(creep.memory.x, creep.memory.y, targetRoomName);
                    let enemy = Game.getObjectById(creep.memory.enemyID);
                    if (!enemy || enemy.room.name != creep.room.name || guardPos.getRangeTo(enemy) > GUARD_CHASING_RANGE) {
                        enemy = guardPos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        if (enemy && guardPos.getRangeTo(enemy) <= GUARD_TARGETING_RANGE) {
                            creep.memory.enemyID = enemy.id;
                        } else {
                            enemy = null;
                            creep.memory.enemyID = undefined;
                        }
                    }
                    if (enemy) {
                        creep.heal(creep);
                        chaseAndAttack(creep, enemy);
                        creep.rangedAttack(enemy);
                    } else {
                        let ally = Game.getObjectById(creep.memory.allyID);
                        if (!ally || ally.hits == ally.hitsMax || ally.room.name != creep.room.name || guardPos.getRangeTo(ally) > GUARD_TARGETING_RANGE) {
                            ally = null;
                            for (let target of Game.rooms[targetRoomName].find(FIND_MY_CREEPS)) {
                                if (target.hits < target.hitsMax && guardPos.getRangeTo(target) <= GUARD_TARGETING_RANGE) {
                                    creep.memory.allyID = target.id;
                                    ally = target;
                                    break;
                                }
                            }
                        }
                        if (ally) {
                            if (creep.heal(ally) == ERR_NOT_IN_RANGE) {
                                creep.rangedHeal(ally);
                                creep.moveTo(ally, {maxRooms: 1, visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        } else {
                            creep.moveTo(guardPos, {maxRooms: 1, range: 3, visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [X, Y];
            
            role[AUTOMATIC_MEMORY] = [ENEMY_ID, ALLY_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "harvester";
            
            // the harvester collects energy from its own base, and uses this energy for a large variety of tasks, such as storage-filling, tower-charging, spawn/ext-filling, etc.
            // this role collects energy from a specific source at a specific position around that source; each unit will have attributes automatically set in memory for this
            // this role is meant to be used primarily at early controller levels (and should be replaced by more efficient roles, such as linkMiners, etc. when possible)
            // harvesters are likely the most inefficient role, due to usually being so numerous in actual application, thereby causing the scheduling of too many simultaneous ...
            // ... actions across all bases using them (particularly moveTo actions); thus, care should be taken not to use harvesters in too many bases at once
            // linkMiners, dropMiners, and upgradeMiners will automatically replace this role, according to controller level, when mines are set in room-memory
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 75)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let base = this.bases[baseName];
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        let harvestingMine = base.harvestingMines[creep.memory.hmi];
                        if (harvestingMine) {
                            let harvestingObj = harvestingMine.positionData[creep.memory.hpi];
                            if (harvestingObj) {
                                if (!moveToPosition(creep, harvestingObj.pos)) {
                                    creep.harvest(Game.getObjectById(harvestingMine.sourceID));
                                }
                            } else {
                                console.log(creep.name+" has no harvesting position...");
                            }
                        } else {
                            creep.memory.recycle = true; // ! creep is no longer needed due to harvestingMine being gone...
                        }
                    } else {
                        transferEnergyByPriority(creep, [
                            base.spawnOrExt,
                            [base.mostUnderchargedTower, HARVESTER_TOWER_CHARGE_THRESHOLD],
                            [creep.room.storage, HARVESTER_MIN_STORAGE_THRESHOLD],
                            base.constructionSitesObject[MAIN][SITE],
                            [creep.room.storage, HARVESTER_MAX_STORAGE_THRESHOLD],
                            creep.room.controller
                        ]);
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                let base = this.bases[baseName];
                if (curCount < base.getHarvestingPositionCountForBase() * 2) { // ! notice the multiplication! // !!!!! make this multiple flexible and base-dependent...
                    return true;
                } else {
                    return false;
                }
            }
            
            // ! note that this birth-function is similar to the dropMiner/linkMiner/etc. birth-function, but is still significantly different due to the checks on "position"
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let baseName = creep.memory.base;
                let base = this.bases[baseName];
                let lowest = {
                    count: -1,
                    mineIndex: -1,
                    posIndex: -1
                };
                let minesFound = 0;
                let hmi = -1;
                for (let mine of base.harvestingMines) {
                    hmi++;
                    if (mine) {
                        minesFound++;
                        for (let hpi = 0; hpi < mine.positionData.length; hpi++) {
                            let obj = mine.positionData[hpi];
                            let assigneeCount = 0;
                            for (let x in obj.creepNames) {
                                assigneeCount++;
                            }
                            if (lowest.count == -1 || assigneeCount < lowest.count) {
                                lowest.count = assigneeCount;
                                lowest.mineIndex = hmi;
                                lowest.posIndex = hpi;
                            }
                        }
                    }
                }
                if (minesFound >= 1) { // if at least one harvesting mine exists...
                    base.harvestingMines[lowest.mineIndex].positionData[lowest.posIndex].creepNames[creepName] = 1; // the 1 has no use; creepNames is simply used as a set
                    creep.memory.hmi = lowest.mineIndex;
                    creep.memory.hpi = lowest.posIndex;
                }
            }
            
            role[RECOMMIT_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let hmi = creep.memory.hmi;
                let hpi = creep.memory.hpi;
                if (hmi == undefined || hpi == undefined) {
                    role[BIRTH_FUNCTION](creepName);
                } else {
                    let base = this.bases[creep.memory.base];
                    if (base.harvestingMines[hmi]) {
                        base.harvestingMines[hmi].positionData[hpi].creepNames[creepName] = 1;
                    } else { // harvestingMine is no longer in use...
                        creep.memory.hmi = undefined;
                        creep.memory.hpi = undefined;
                        role.birthFunction(creepName);
                    }
                }
            }
            
            role[DEATH_FUNCTION] = (creepName) => {
                let base = this.bases[Memory.creeps[creepName].base];
                let hmi = Memory.creeps[creepName].hmi;
                let hpi = Memory.creeps[creepName].hpi;
                if (base) { // if the base still exists...
                    if (hmi != undefined && base.harvestingMines[hmi]) { // if the index is defined and the harvesting mine still exists...
                        if (hpi != undefined && base.harvestingMines[hmi].positionData[hpi].creepNames[creepName]) { // if the creep was assigned within the object...
                            delete base.harvestingMines[hmi].positionData[hpi].creepNames[creepName];
                        }
                    }
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT, HMI, HPI];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "healer";
            
            // the healer moves to targetRoom, and then heals any allied creep whose health is not full
            // short-range heals are prioritized, but long-range heals are done when range is too great
            // note that the healer will prioritize healing self when injured
            // !!! note that the process used to find an injured creep is role-dependent (meaning multiple healers in the same base would perform the same search ...
            // ... independantly) and fairly poor, besides; the healer simply targets the first injured unit found
            
            role[RUN_FUNCTION] = (creep) => {
                let healed = healSelfWhenInjured(creep);
                let targetRoomName = creep.memory.targetRoom;
                if (creep.room.name != targetRoomName) {
                    travelToTargetRoom(creep);
                } else {
                    let target = Game.getObjectById(creep.memory.targetID);
                    if (!target || target.hits == target.hitsMax || target.room.name != targetRoomName) {
                        target = null;
                        for (let unit of creep.room.find(FIND_MY_CREEPS)) {
                            if (unit.hits < unit.hitsMax) {
                                creep.memory.targetID = unit.id;
                                target = unit;
                                break;
                            }
                        }
                    }
                    if (target) {
                        chaseAndHeal(creep, target, healed);
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM];
            
            role[AUTOMATIC_MEMORY] = [TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "healerX";
            
            // the healerX moves to and stays with target-creep (whose ID is stored in memory as targetID) healing the target while the target still lives
            // if target dies, the healer does NOT (!!!) automatically find a new target (and simply stays put), but can be manually set to another target through console
            // note that the healer will prioritize healing self when injured, but will still stay with target
            
            role[RUN_FUNCTION] = (creep) => {
                let healed = healSelfWhenInjured(creep);
                let followedCreep = Game.getObjectById(creep.memory.targetID);
                if (followedCreep) {
                    if (creep.room.name != followedCreep.room.name) {
                        travelToTargetRoom(creep, 2, followedCreep.room.name) // !!! will the healer still keep up with target?
                    } else {
                        if (followedCreep) {
                            chaseAndHeal(creep, target, healed);
                        }
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "killer";
            
            // the killer moves to targetRoom and attacks the nearest creep
            // this role is fairly simple and is really only meant to target rooms where creeps are unprotected
            // !!! currently the usable body parts may be somewhat limited... (only ATTACK)
            // !!! could allow self-healing...
            
            role[RUN_FUNCTION] = (creep) => {
                if (creep.room.name != creep.memory.targetRoom) {
                    travelToTargetRoom(creep);
                } else {
                    let target = getTargetForAttackFromPriorities(creep, ["creeps"]);
                    if (target) {
                        chaseAndAttack(creep, target);
                    } else {
                        idleInCurrentRoom(creep);
                    }
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                setManualMemoryForCreepWhenUndefined(creep, [IDLE_X, IDLE_Y]);
            }
            
            role[AUTOMATIC_MEMORY] = [TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "linkMiner";
            
            // the linkMiner moves to an (automatically) assigned linkMine to harvest energy, placing all collected resources into the link associated with the linkMine
            // this role also handles the construction of the link
            // this role should spawn automatically when appropriate (assuming it is properly placed in spawn arrays) as long as linkMines are set within room memory
            // note that this role takes precedence over dropMiners, and will replace them (again, as long as linkMines are set within room memory)
            // this role will recycle in case of replacement by upgradeMiner or if linkMine object is deleted for some other reason
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 10, false)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let linkMine = this.bases[baseName].linkMines[creep.memory.lmi];
                    if (linkMine) {
                        if (moveToPosition(creep, linkMine.pos)) {
                            // moving to position, and nothing else to do...
                        } else {
                            let source = Game.getObjectById(linkMine.sourceID);
                            if (linkMine.linkID) {
                                if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < LINKMINER_STOP_HARVESTING_THRESHOLD) {
                                    creep.harvest(source);
                                    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 50) {
                                        creep.transfer(Game.getObjectById(linkMine.linkID), RESOURCE_ENERGY);
                                    }
                                }
                            } else if (linkMine.siteID) {
                                buildMineOrHarvestEnergy(creep, linkMine.siteID, source);
                            }
                        }
                    } else {
                        creep.memory.recycle = true; // ! creep is no longer needed due to linkMine being gone...
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                let base = this.bases[baseName];
                if (curCount < base.getMineArrayCount(base.linkMines)) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let baseName = creep.memory.base;
                let base = this.bases[baseName];
                assignCreepToMine(creep, base.linkMines, LMI);
            }
            
            role[RECOMMIT_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let lmi = creep.memory.lmi;
                if (lmi == undefined) {
                    role.birthFunction(creepName);
                } else {
                    let base = this.bases[creep.memory.base];
                    if (base.linkMines[lmi]) { // if a linkMine if the given index exists...
                        base.linkMines[lmi].creepNames[creepName] = 1;
                    } else {
                        creep.memory.lmi = null;
                        role.birthFunction(creepName);
                    }
                }
            }
            
            role[DEATH_FUNCTION] = (creepName) => {
                let base = this.bases[Memory.creeps[creepName].base];
                let lmi = Memory.creeps[creepName].lmi;
                if (base) { // if the base still exists...
                    if (lmi != undefined && base.linkMines[lmi]) { // if the index is defined and the linkMine still exists
                        if (base.linkMines[lmi].creepNames[creepName]) { // if the creep was assigned within the object...
                            delete base.linkMines[lmi].creepNames[creepName];
                        }
                    }
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT, LMI];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "linkUpgrader";
            
            // the linkUpgrader moves to the controllerLink in base, and then withdraws energy from it in order to upgrade the controller
            // note that because of the placement of the controllerLink, this role never moves again after first reaching the controllerLink
            // this role will only spawn when the controllerLink exists, and will recycle if it is destroyed (!!! or no longer usable due to reduced controller level [will it though?])
            // ! note that this role is usable at earliest at controller level 6 (when there is one source), and otherwise at 7 (when there are two sources); ...
            // ... these values are based on the constants CONTROLLER_LINK_EARLY_CLVL and CONTROLLER_LINK_LATE_CLVL as used in checkBaseStructuresAgainstRoomMemory; ...
            // ... these restrictions are in place because of the limited availability of links for building; and linkMiners are given priority for link access
            // !!! this role NEEDS to be tested again...
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 30, false)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                        let cLink = Game.getObjectById(this.bases[baseName].controllerLinkID);
                        if (cLink) {
                            moveToAndWithdrawResourceFromTarget(creep, cLink, RESOURCE_ENERGY);
                        } else {
                            creep.memory.recycle = true; // ! creep is no longer needed due to controllerLink being gone...
                        }
                    } else {
                        creep.upgradeController(creep.room.controller);
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName) => {
                if (this.bases[baseName].controllerLinkID && Game.getObjectById(this.bases[baseName].controllerLinkID)) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "looterE";
            
            // the looterE moves to targetRoom and collects energy from any structures or other objects within the room that are capable of holding energy, ...
            // ... afterwards returning all looted energy to its own base's storage
            // this role is meant to be sent to destroyed or abandoned bases where there is still alot of energy lying about (in ruins, structures, etc.)
            // ! note that this role has no spawn condition and thus must be spawned manually per base as needed
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 250)) { return; } // ! terminate role code immediately if remitting
                let collect = setTaskForGeneralCollection(creep);
                if (collect) {
                    if (creep.room.name != creep.memory.targetRoom) {
                        travelToTargetRoom(creep);
                    } else {
                        let target = getTargetForLootingFromPriorities(creep, true, [
                            FIND_DROPPED_RESOURCES,
                            FIND_TOMBSTONES,
                            FIND_RUINS,
                            STRUCTURE_STORAGE,
                            FIND_HOSTILE_STRUCTURES
                        ]);
                        pickupOrWithdrawFromTarget(creep, target, RESOURCE_ENERGY, {reusePath: 30});
                    }
                } else {
                    if (creep.room.name != baseName) {
                        travelToTargetRoom(creep, 1);
                    } else {
                        transferToLocalStorage(creep, RESOURCE_ENERGY, {reusePath: 30});
                    }
                }   
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM];
            
            role[AUTOMATIC_MEMORY] = [COLLECT, TARGET_ID, TARGET_TYPE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "looterM";
            
            // the looterM moves to targetRoom and collects (any and all) minerals from any structures or other objects within the room that are capable of ...
            // ... holding minerals, afterwards returning all such looted minerals to own base's storage
            // this role is meant to be sent to destroyed or abandoned bases where there are still alot of minerals lying about (in ruins, structures, etc.)
            // ! note that this role has no spawn condition and thus must be spawned manually per base as needed
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 250)) { return; } // ! terminate role code immediately if remitting
                let collect = setTaskForGeneralCollection(creep);
                if (collect) {
                    if (creep.room.name != creep.memory.targetRoom) {
                        travelToTargetRoom(creep);
                    } else {
                        let target = getTargetForLootingFromPriorities(creep, false, [
                            FIND_DROPPED_RESOURCES,
                            FIND_TOMBSTONES,
                            FIND_RUINS,
                            STRUCTURE_STORAGE,
                            FIND_HOSTILE_STRUCTURES
                        ]);
                        pickupOrWithdrawFromTarget(creep, target, "mineralsOnly", {reusePath: 30});
                    }
                } else {
                    if (creep.room.name != baseName) {
                        travelToTargetRoom(creep, 1);
                    } else {
                        transferAllCarriedToTarget(creep, creep.room.storage, {reusePath: 30});
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM];
            
            role[AUTOMATIC_MEMORY] = [COLLECT, TARGET_ID, TARGET_TYPE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "looterX";
            
            // the looterX moves to targetRoom, collecting the single resource associated with its memory (targetID and resourceType), afterwards returning the ...
            // ... collected resource to its own base's storage
            // use this role to loot a single resource from a single structure/object (note that you can alter the creep's memory through the console to select new targets)
            // ! note that this role has no spawn condition and thus must be spawned manually per base as needed
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 250)) { return; } // ! terminate role code immediately if remitting
                let collect = setTaskForGeneralCollection(creep);
                if (collect) {
                    if (creep.room.name != creep.memory.targetRoom) {
                        travelToTargetRoom(creep);
                    } else {
                        let target = Game.getObjectById(creep.memory.targetID);
                        let resourceType = creep.memory.resourceType;
                        if (target.store) {
                            moveToAndWithdrawResourceFromTarget(creep, target, resourceType, {reusePath: 30});
                        } else { // target should be a dropped resource... (unless memory was filled out incorrectly)
                            moveToAndPickUpDroppedResource(creep, target, {reusePath: 30});
                        }
                    }
                } else {
                    if (creep.room.name != baseName) {
                        travelToTargetRoom(creep, 1);
                    } else {
                        transferAllCarriedToTarget(creep, creep.room.storage, {reusePath: 30});
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, TARGET_ID, RESOURCE_TYPE];
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "lootingWorker";
            
            // the lootingWorker collects energy from lingering enemy structures and ruins in a room, and then uses this energy for a large variety of tasks in the base ...
            // ... such as storage-filling, tower-charging, spawn/ext-filling, building, etc. according to an order of priority
            // if targetRoom is manually set, then this role will loot in that targetRoom; otherwise, targetRoom defaults to base and all looting is performed in base
            // ! note that this role will NOT withdraw from owned storage, and will NOT transfer to enemy storage
            // ! note that this role has a special memory option called remittingTick, which can be manually set (but is otherwise flexibly set by birth function) ...
            // ... to help to better control timing for the remitWhenDying functionality
            // ! note that this role has no spawn condition and thus must be spawned manually per base as needed
            // !!!!! a base may sometimes need some interior and exterior lootingWorkers; I need to create specialized spawn-array arguments to conveniently allow for this
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, creep.memory.remittingTick)) { return; } // ! terminate role code immediately if remitting
                let collect = setTaskForEnergyCollection(creep);
                if (collect) {
                    if (creep.room.name != creep.memory.targetRoom) {
                        travelToTargetRoom(creep);
                    } else {
                        let target = getTargetForLootingFromPriorities(creep, true, [
                            FIND_DROPPED_RESOURCES,
                            FIND_TOMBSTONES,
                            FIND_RUINS,
                            STRUCTURE_STORAGE,
                            FIND_HOSTILE_STRUCTURES
                        ]);
                        pickupOrWithdrawFromTarget(creep, target, RESOURCE_ENERGY);
                    }
                } else {
                    if (creep.room.name != baseName) {
                        travelToTargetRoom(creep, 1);
                    } else {
                        let base = this.bases[baseName];
                        transferEnergyByPriority(creep, [
                            base.spawnOrExt,
                            [base.mostUnderchargedTower, HARVESTER_TOWER_CHARGE_THRESHOLD],
                            [creep.room.storage, HARVESTER_MIN_STORAGE_THRESHOLD],
                            base.constructionSitesObject[MAIN][SITE],
                            [creep.room.storage, HARVESTER_MAX_STORAGE_THRESHOLD],
                            creep.room.controller
                        ]);
                    }
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                if (creep.memory.targetRoom == null) {
                    creep.memory.targetRoom = creep.memory.base;
                }
                if (creep.memory.remittingTick == null) {
                    creep.memory.remittingTick = (creep.memory.base == creep.memory.targetRoom) ? 50 : 200;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT, TARGET_ID, TARGET_TYPE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "mover";
            
            // the mover collects resourceType from fromStructure in fromRoom, and then moves it to toStructure in toRoom (all based on the creep's memory)
            // this role is to be used to move excessive or needed resources from one base to another base, or else to move resources from one structure ...
            // ... to another structure within the same room (such as from storage to terminal or vise versa)
            // ! note that this role has a special memory option called remittingTick, which can be manually set (but is otherwise flexibly set by birth function) ...
            // ... to help to better control timing for the remitWhenDying functionality
            // !!! note that this role only moves ALL of a single resource, and may not immediately complete its last transfer due to not filling own personal store, ...
            // ... although it would eventually remit; make this role work until there is at least "targetAmount" in the toStructure
            // !!! this role should have a spawn condition set up after the above issues have been resolved; (a spawn condition should perhaps look to see if there ...
            // ... is at least some of resourceType in fromStructure, while confirming that targetAmount (in toStructure) was not yet met...
            
            role[RUN_FUNCTION] = (creep) => {
                if (remitWhenDying(creep, baseName, creep.memory.remittingTick)) { return; } // ! terminate role code immediately if remitting
                let collect = setTaskForGeneralCollection(creep);
                if (collect) {
                    let fromRoom = creep.memory.fromRoom;
                    if (creep.room.name != fromRoom) {
                        travelToTargetRoom(creep, 2, fromRoom);
                    } else {
                        let target = Game.getObjectById(creep.memory.fromStructure);
                        if (target) {
                            moveToAndWithdrawResourceFromTarget(creep, target, creep.memory.resourceType);
                        }
                    }
                } else {
                    let toRoom = creep.memory.toRoom;
                    if (creep.room.name != toRoom) {
                        travelToTargetRoom(creep, 2, toRoom);
                    } else {
                        let target = Game.getObjectById(creep.memory.toStructure);
                        if (target) {
                            moveToAndTransferResourceToTarget(creep, target, creep.memory.resourceType);
                        }
                    }
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                if (creep.memory.remittingTick == null) {
                    creep.memory.remittingTick = (creep.memory.fromRoom == creep.memory.toRoom) ? 50 : 250;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            role[REQUIRED_MEMORY] = [RESOURCE_TYPE, TO_ROOM, FROM_ROOM, TO_STRUCTURE, FROM_STRUCTURE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "overseer";
            
            // the overseer moves to overseer-position (as set in base) and then "oversees" all central structures, moving resources between them as needed
            // this role will begin to spawn as soon as there is an owned storage and the central link exists in the base
            // this role is only meant to have MOVE and CARRY parts
            // ! this role will only work so long as one of my standard templates is used, where all central structures are reachable from a single position ...
            // ... for clarity, central structures include: spawn, powerSpawn, storage, nuker, terminal, factory, and a single "central" link
            // ! note that this role's birth-function determines the availability of certain tasks during the creep's lifetime
            // !!!!! this role can still be greatly expanded to include factory and other terminal functionality... among other things
            
            role[RUN_FUNCTION] = (creep) => {
                let base = this.bases[creep.memory.base];
                if (remitWhenDying(creep, base.baseName, 5)) { return; } // ! terminate role code immediately if remitting
                let centralSpawn = Game.getObjectById(base.centralSpawnID);
                if (creep.room.name != base.baseName) {
                    travelToTargetRoom(creep, 1);
                } else if (moveToPositionXY(creep, base.overseerPosition.x, base.overseerPosition.y)) { // if trying to move into position
                    if (creep.ticksToLive < 1475) {
                        let pos = new RoomPosition(base.overseerPosition.x, base.overseerPosition.y, base.baseName);
                        let blockingCreep = pos.lookFor(LOOK_CREEPS)[0];
                        if (blockingCreep && centralSpawn) { // if there is another creep in overseer position...
                            centralSpawn.recycleCreep(blockingCreep); // force the blocking-creep to recycle
                            // !!! trigger task related to collecting resources from ground...
                        }
                        // !!! maybe add something for the entryway as well...
                    }
                } else { // when in position...
                    if (creep.memory.collect) {
                        // TASK: returning any carried resources to storage...
                        let heldResource = getFirstResourceFromStore(creep.store);
                        if (heldResource) {
                            creep.transfer(creep.room.storage, heldResource);
                            return;
                        }
                        // TASK: moving energy from central link to storage...
                        let link = Game.getObjectById(base.centralLinkID);
                        if (link && link.store.getUsedCapacity(RESOURCE_ENERGY) != 0) { // if there is energy in central link...
                            creep.withdraw(link, RESOURCE_ENERGY);
                            setMemoryForNextTransfer(creep, creep.room.storage.id, RESOURCE_ENERGY);
                            return;
                        }
                        // TASK: filling central spawn with energy when it is not full
                        if (centralSpawn && centralSpawn.store.getFreeCapacity(RESOURCE_ENERGY) != 0) { // if the central spawn is not full...
                            // withdraw the smaller of two values so that overseer will have empty store after transfer
                            creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(),
                                                                                         centralSpawn.store.getFreeCapacity(RESOURCE_ENERGY)));
                            setMemoryForNextTransfer(creep, base.centralSpawnID, RESOURCE_ENERGY);
                            return;
                        }
                        // TASK: moving specified resource from one structure to another
                        if (creep.memory.fromID) { // if resources should be moved around...
                            // transferring resources from fromID-structure to toID-structure, such that all are moved (when num is -1), or such that ...
                            // ... a total of num are, by end of transfer process, in the toID-structure
                            let fromSt = Game.getObjectById(creep.memory.fromID);
                            let toID = creep.memory.toID;
                            let toSt = Game.getObjectById(toID);
                            let rt = creep.memory.rt;
                            let num = creep.memory.num;
                            if (fromSt && fromSt.store && toSt && toSt.store && rt && (num == -1 || num > 0)) { // when all necessary memory was set...
                                if (fromSt.store.getUsedCapacity(rt) > 0 && (num == -1 || toSt.store.getUsedCapacity(rt) < num)) {
                                    if (num == -1) {
                                        creep.withdraw(fromSt, rt);
                                    } else if (num > 0) {
                                        creep.withdraw(fromSt, rt, Math.min(creep.store.getFreeCapacity(),
                                                                            num - toSt.store.getUsedCapacity(rt)));
                                    }
                                    setMemoryForNextTransfer(creep, toID, rt);
                                    return;
                                }
                            }
                        }
                        // TASK: transferring energy to central-link when controller-link exists in base and it needs more energy
                        let controllerLink;
                        if (base.controllerLinkID) {
                            controllerLink = Game.getObjectById(base.controllerLinkID);
                        }
                        if (controllerLink && link.cooldown == 0 && link.store.getUsedCapacity(RESOURCE_ENERGY) == 0
                                           && controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) <= CONTROLLER_LINK_MIN_ENERGY
                                           && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) >= OVERSEER_USE_STORAGE_FOR_CONTROLLER_LINK_THRESHOLD) {
                            let collectAmount = creep.store.getCapacity();
                            if (collectAmount > MAXIMUM_AMOUNT_TO_TRANSFER_TO_CONTROLLER_LINK) {
                                collectAmount = MAXIMUM_AMOUNT_TO_TRANSFER_TO_CONTROLLER_LINK;
                            }
                            creep.withdraw(creep.room.storage, RESOURCE_ENERGY, collectAmount);
                            setMemoryForNextTransfer(creep, base.centralLinkID, RESOURCE_ENERGY);
                            return;
                        }
                        // TASK: generating power, and transfering EITHER power (from EITHER storage OR terminal) OR energy (from storage only) to powerspawn
                        if (creep.memory.generatePower) {
                            let powerSpawn = Game.getObjectById(base.powerSpawnID);
                            let powerFromTerminal = creep.room.terminal.store.getUsedCapacity(RESOURCE_POWER) >= 100;
                            let powerFromStorage = creep.room.storage.store.getUsedCapacity(RESOURCE_POWER) >= 100;
                            if (powerSpawn && powerSpawn.store.getUsedCapacity(RESOURCE_POWER) == 0 && (powerFromTerminal || powerFromStorage)) {
                                if (powerFromTerminal) {
                                    creep.withdraw(creep.room.terminal, RESOURCE_POWER, 100);
                                    setMemoryForNextTransfer(creep, base.powerSpawnID, RESOURCE_POWER);
                                    return;
                                }
                                if (powerFromStorage) {
                                    creep.withdraw(creep.room.storage, RESOURCE_POWER, 100);
                                    setMemoryForNextTransfer(creep, base.powerSpawnID, RESOURCE_POWER);
                                    return;
                                }
                            } else if (powerSpawn && powerSpawn.store.getUsedCapacity(RESOURCE_ENERGY) < 4000) {
                                creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                                setMemoryForNextTransfer(creep, base.powerSpawnID, RESOURCE_ENERGY);
                                return;
                            }
                        }
                        // TASK: distributing energy to terminal when terminal is below a threshold
                        if (creep.memory.distributeEnergy) {
                            if (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < OVERSEER_TERMINAL_MIN_ENERGY) {
                                creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                                setMemoryForNextTransfer(creep, creep.room.terminal.id, RESOURCE_ENERGY);
                                return;
                            }
                        }
                        // TASK: filling nuker with EITHER energy OR ghodium when nuker is below a threshold
                        if (creep.memory.fillNuker) {
                            let nuker = Game.getObjectById(base.nukerID);
                            if (nuker && creep.room.storage.store[RESOURCE_GHODIUM]
                                      && nuker.store.getUsedCapacity(RESOURCE_GHODIUM) < nuker.store.getCapacity(RESOURCE_GHODIUM)) {
                                creep.withdraw(creep.room.storage, RESOURCE_GHODIUM, Math.min(creep.store.getFreeCapacity(),
                                                                                              nuker.store.getFreeCapacity(RESOURCE_GHODIUM)));
                                setMemoryForNextTransfer(creep, base.nukerID, RESOURCE_GHODIUM);
                                return;
                            } else if (nuker && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > OVERSEER_STOP_CHARGING_NUKER_THRESHOLD
                                             && nuker.store.getUsedCapacity(RESOURCE_ENERGY) < nuker.store.getCapacity(RESOURCE_ENERGY)) {
                                creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(),
                                                                                             nuker.store.getFreeCapacity(RESOURCE_ENERGY)));
                                setMemoryForNextTransfer(creep, base.nukerID, RESOURCE_ENERGY);
                                return;
                            } else {
                                creep.memory.fillNuker = false; // stop trying to fill nuker for this creep's lifetime if nuker gone, no ghodium, or not enough energy
                            }
                        }
                        // !!! add some factory stuff...
                        //let factory = Game.getObjectById(base.factoryID);
                    } else {
                        creep.transfer(Game.getObjectById(creep.memory.targetID), creep.memory.resourceType);
                        setMemoryForNextTransfer(creep, null, null, false);
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName) => {
                let room = Game.rooms[baseName];
                if (room.storage && room.storage.my && this.bases[baseName].centralLinkID != null) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                if (creep.memory.fromID == undefined) {
                    creep.memory.fromID = null;
                }
                if (creep.memory.toID == undefined) {
                    creep.memory.toID = null;
                }
                if (creep.memory.rt == undefined) {
                    creep.memory.rt = null; // the resourceType moved
                }
                if (creep.memory.num == undefined) {
                    creep.memory.num = -1; // -1 to move all; otherwise, the specific amount that should be in the toID-structure after all transfering is done
                }
                creep.memory.generatePower = false;
                creep.memory.distributeEnergy = false;
                creep.memory.fillNuker = false;
                let base = this.bases[creep.memory.base];
                let room = Game.rooms[base.baseName];
                if (room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > OVERSEER_EXTRA_TASKS_THRESHOLD) {
                    if (room.storage.store.getUsedCapacity(RESOURCE_POWER) > 0 || (room.terminal && room.terminal.my && room.terminal.store.getUsedCapacity(RESOURCE_POWER) > 0)) {
                        creep.memory.generatePower = true;
                    }
                    if (room.terminal && room.terminal.my && room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < OVERSEER_TERMINAL_MIN_ENERGY) {
                        creep.memory.distributeEnergy = true;
                    }
                    if (base.nukerID) {
                        let nuker = Game.getObjectById(base.nukerID);
                        if (nuker && (nuker.store.getUsedCapacity(RESOURCE_ENERGY) < nuker.store.getCapacity(RESOURCE_ENERGY)
                                     || (room.storage.store.getUsedCapacity(RESOURCE_GHODIUM) > 0 
                                        && nuker.store.getUsedCapacity(RESOURCE_GHODIUM) < nuker.store.getCapacity(RESOURCE_GHODIUM)))) {
                            creep.memory.fillNuker = true;
                        }
                    }
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT, TARGET_ID, RESOURCE_TYPE, GENERATE_POWER, DISTRIBUTE_ENERGY, FILL_NUKER];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "paver";
            
            // the paver builds roads (and nothing else) in its own base
            // this role will withdraw exclusively from storage (as long as the storage has at least a specific amount), but will otherwise harvest from sources
            // note that this role will not harvest from sources that are used by dropMiners, linkMiners, or upgradeMiners
            // this role will wait at the room-memory-based wait-location when it cannot collect any resources
            // when all (ROAD) construction is done, this role will recycle
            // !!!!! the paver does not currently maintain (meaning repair) roads
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        if (!withdrawOrHarvestEnergy(creep, PAVER_USE_STORAGE_THRESHOLD)) { // when withdrawing or harvesting cannot be completed
                            rallyAtWaitLocation(creep, baseName);
                        }
                    } else {
                        // !!!!! this section could be added to
                        // ..... perhaps the paver should be able to repair low health roads....
                        if (!workOnConstructionForSiteType(creep, baseName, ROAD)) { 
                            creep.memory.recycle = true; // ! creep is no longer needed since all road-construction is complete...
                        }
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                let room = Game.rooms[baseName];
                if (room.controller.level >= 4 && curCount < 1 && room.storage && room.storage.my && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > PAVER_SPAWN_THRESHOLD && this.bases[baseName].constructionSitesObject[ROAD][SITE]) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT, STORAGE_OR_SOURCE_ID, STORAGE_OR_SOURCE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "peeker";
            
            // the peeker moves to the room targetRoom (which must be adjacent to peekedRoom) and then moves to peekedRoom, only to return to targetRoom once health is ...
            // ... below a specific threshold, according to minHits; all these properties are to be set in creep memory
            // note that this role is constantly healing itself
            // use this role to draw turret fire from enemy bases in order to waste their energy
            // this role should have plenty of TOUGHs, and some HEALs, and MOVEs, but can also have RANGED_ATTACK
            // if the creep has RANGED_ATTACK parts it will attack the target related to targetID (if set)
            
            role[RUN_FUNCTION] = (creep) => {
                creep.heal(creep);
                if (creep.room.name != creep.memory.targetRoom && creep.room.name != creep.memory.peekedRoom) {
                    travelToTargetRoom(creep);
                } else { // when in either the peeked room or the adjacent room...
                    let target = creep.memory.targetID;
                    if (target) {
                        creep.rangedAttack(Game.getObjectById(target));
                    }
                    if (creep.room.name != creep.memory.peekedRoom) { // when in adjacent room
                        if (creep.hits >= creep.hitsMax) {
                            moveToPositionXY(creep, creep.memory.enterX, creep.memory.enterY)
                        } else {
                            moveToPositionXY(creep, creep.memory.waitX, creep.memory.waitY)
                        }
                    } else { // when in the peeked room
                        if (creep.hits > creep.memory.minHits) {
                            moveToPositionXY(creep, creep.memory.peekX, creep.memory.peekY)
                        } else {
                            moveToPositionXY(creep, creep.memory.exitX, creep.memory.exitY)
                        }
                    }
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                setManualMemoryForCreepWhenUndefined(creep, [TARGET_ID]);
                if (!creep.memory.minHits) {
                    creep.memory.minHits = Math.floor(creep.hitsMax * (3/4));
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, PEEKED_ROOM, WAIT_X, WAIT_Y, ENTER_X, ENTER_Y, PEEK_X, PEEK_Y, EXIT_X, EXIT_Y];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "raider";
            
            // the raider moves to a specific room's [x,y] coordinate (as set in the related RaidingParty instance) to rally with its fellow raiders; ...
            // ... after rallying, the lead raider will lead the group (in a line) to targetRoom's [x,y] coordinate (according to the leader's manually set memory); ...
            // ... once the raiders have arrived and gotten into formation, they may be moved about by manually changing values in the leader's memory ...
            // ... and can be made to attack targetID (again, according to leader's manually set memory)
            // ! note that this role is tied to the class RaidingParty and the ScreepsScript array raidingParties
            // manual memory options can be set as below, and will be done according the same priority as listed here; ...
            // ... set targetRoom, X, and Y to make party move in line and then regroup (note that targetRoom may be null if you want the creeps to stay in same room); ...
            // ... set moveAsUnit (to a "direction" integer) and xMovesAsUnit (to an integer) to make the group move as a solid unit in direction x times; ...
            // ... set rotationDirection (to -1 or 1) and rotationCount (to integer) to cause the grouped party to rotate its orientation left or right x times
            // ! note that if memory properties are set incorrectly, the intended action may be skipped
            // ! do not manually change the leader's memory property "partyFinalized"! If you want a new raiding party, you'll need to create and rally a new one
            // this role should generally have MOVE, RANGED_ATTACK, and HEAL parts; however it can also have ATTACK or WORK parts, although creeps with those are "specialized"
            // ... if the raider has ATTACK parts it should only have ATTACK and MOVE parts and no HEALS (in memory, raiderType will be set to 1 for attacking raider)
            // ... if the raider has WORK parts it should only have WORK and MOVE parts and no HEALS (in memory, raiderType will be set to 2 for dismantling raider)
            // ... there should be no more than 1 or 2 of these specialized raiders in a party due to range issues (use rotation to get specialized raider in range)
            // use this role to attack nearby enemy bases (!!! currently it probably isn't good enough to successfully attack any base above controller level 6)
            // ! note that raiders will not renew themselves (!!!), and as members of a party die off they are not replaced; instead a new party must be made after all die
            
            role[RUN_FUNCTION] = (creep) => {
                let partyIndex = creep.memory.partyIndex;
                let raidingParty = this.raidingParties[partyIndex];
                if (!raidingParty) { creep.suicide(); return; } // ! kill creep and terminate role code immediately if raiding party no longer exists...
                let raiderIndex = creep.memory.raiderIndex;
                let raider = raidingParty.raiders[raiderIndex];
                let leader = raidingParty.raiders[0];
                if (!creep.memory.finalized) { // if the raiding-party is not yet finalized... meaning the party is still gathering at starting-position...
                    if (creep.room.name != raidingParty.startingPosition.roomName) {
                        travelToTargetRoom(creep, 2, raidingParty.startingPosition.roomName);
                    } else {
                        if (!raidingParty.gatheringPositions) { // if the gathering positions are not set...
                            raidingParty.setGatheringPositions();
                        }
                        let gp = raidingParty.gatheringPositions[raiderIndex];
                        if (!moveToPosition(creep, gp)) { // if already in position
                            if (creep.name == leader.name) { // if this creep is the leader of the group...
                                // checking that all other raiders exist and are rallied...
                                if (raidingParty.raiders.length == raidingParty.partySize) { // if all raiders have been spawned...
                                    let allRallied = true;
                                    for (let i = 1; i < raidingParty.raiders.length; i++) { // checking all raiders except leader...
                                        if (!raidingParty.raiders[i].creep.pos.isEqualTo(raidingParty.gatheringPositions[i])) { // if any creep is NOT in position...
                                            allRallied = false;
                                            break;
                                        }
                                    }
                                    if (allRallied) {
                                        creep.memory.partyFinalized = true;
                                        for (let i = 0; i < raidingParty.raiders.length; i++) { // setting memory for all raidings in this party
                                            raidingParty.raiders[i].creep.memory.finalized = true;
                                        }
                                        raidingParty.gatheringPositions = null; // resetting gathering positions since all have gathered...
                                    }
                                }
                            }
                        }
                    }
                } else if (leader.creep.memory.partyFinalized) { // when all creeps have done initial rallying
                    if (creep.name == leader.name) { // if this creep is the leader of the group...
                        // ! the leading creep will direct the movement of other creeps according to its own movement according to manually set memory options...
                        let leaderHasNotYetDirectedMovement = true;
                        if (creep.memory.forceReGathering) {
                            leaderHasNotYetDirectedMovement = false;
                            if (!raidingParty.gatheringPositions) { // if the gathering positions are not set...
                                raidingParty.setGatheringPositions(creep.pos);
                            }
                            let allInPosition = true;
                            // ... make all other raiders move into their respective positions...
                            for (let i = 1; i < raidingParty.raiders.length; i++) {
                                let gp = raidingParty.gatheringPositions[i];
                                if (moveToPosition(raidingParty.raiders[i].creep, gp, {reusePath: 3})) { // if actively moving into position...
                                    allInPosition = false;
                                }
                            }
                            if (allInPosition) {
                                creep.memory.forceReGathering = false;
                                raidingParty.gatheringPositions = null; // resetting gathering positions since all have gathered...
                            }
                        }
                        if (leaderHasNotYetDirectedMovement) {
                            let targetRoom = creep.memory.targetRoom;
                            let x = creep.memory.x;
                            let y = creep.memory.y;
                            if (x != null && y != null) { // ! note that target room need not be set
                                leaderHasNotYetDirectedMovement = false;
                                if (raidingParty.isReadyToMove()) {
                                    let moved = true;
                                    if (targetRoom && creep.room.name != targetRoom) {
                                        travelToTargetRoom(creep);
                                    } else if (moveToPositionXY(creep, x, y)) {
                                        // moving into position
                                    } else { // when in position
                                        moved = false;
                                    }
                                    if (moved) { // when the leader moved...
                                        // ... make all other raiders move too
                                        for (let i = 1; i < raidingParty.raiders.length; i++) {
                                            let direction = raidingParty.raiders[i].creep.pos.getDirectionTo(raidingParty.raiders[i-1].creep.pos);
                                            raidingParty.raiders[i].creep.move(direction);
                                        }
                                    } else { // when leader in position...
                                        if (!raidingParty.gatheringPositions) { // if the gathering positions are not set...
                                            raidingParty.setGatheringPositions(creep.pos);
                                        }
                                        let allInPosition = true;
                                        // ... make all other raiders move into their respective positions...
                                        for (let i = 1; i < raidingParty.raiders.length; i++) {
                                            let gp = raidingParty.gatheringPositions[i];
                                            if (moveToPosition(raidingParty.raiders[i].creep, gp, {reusePath: 3})) { // if actively moving into position...
                                                allInPosition = false;
                                            }
                                        }
                                        if (allInPosition) {
                                            creep.memory.targetRoom = null;
                                            creep.memory.x = null;
                                            creep.memory.y = null;
                                            raidingParty.gatheringPositions = null; // resetting gathering positions since all have gathered...
                                        }
                                    }
                                }
                            }
                        }
                        if (leaderHasNotYetDirectedMovement) {
                            let direction = creep.memory.moveAsUnit;
                            let moveCount = creep.memory.xMovesAsUnit;
                            if (Number.isInteger(direction) && direction >= 1 && direction <= 8 && Number.isInteger(moveCount) && moveCount > 0) {
                                leaderHasNotYetDirectedMovement = false;
                                if (raidingParty.isReadyToMove()) {
                                    for (let i = 0; i < raidingParty.raiders.length; i++) {
                                        raidingParty.raiders[i].creep.move(direction);
                                    }
                                }
                                if (moveCount - 1 == 0) {
                                    creep.memory.moveAsUnit = null;
                                    creep.memory.xMovesAsUnit = null;
                                } else {
                                    creep.memory.xMovesAsUnit = moveCount - 1;
                                }
                            }
                        }
                        if (leaderHasNotYetDirectedMovement) {
                            let rotationDirection = creep.memory.rotationDirection;
                            let rotationCount = creep.memory.rotationCount;
                            if (rotationDirection && (rotationDirection == 1 || rotationDirection == -1) && Number.isInteger(rotationCount) && rotationCount > 0) {
                                leaderHasNotYetDirectedMovement = false;
                                if (raidingParty.isReadyToMove()) {
                                    if (rotationDirection == 1) {
                                        for (let i = 0; i < raidingParty.raiders.length; i++) {
                                            let nextIndex = (i + 1) % raidingParty.raiders.length;
                                            let direction = raidingParty.raiders[i].creep.pos.getDirectionTo(raidingParty.raiders[nextIndex].creep.pos);
                                            raidingParty.raiders[i].creep.move(direction);
                                        }
                                    } else {
                                        for (let i = raidingParty.raiders.length - 1; i >= 0; i--) {
                                            let nextIndex = i - 1;
                                            if (nextIndex < 0) {
                                                nextIndex = raidingParty.raiders.length - 1;
                                            }
                                            let direction = raidingParty.raiders[i].creep.pos.getDirectionTo(raidingParty.raiders[nextIndex].creep.pos);
                                            raidingParty.raiders[i].creep.move(direction);
                                        }
                                    }
                                    if (rotationCount - 1 <= 0) {
                                        creep.memory.rotationDirection = null;
                                        creep.memory.rotationCount = null;
                                    } else {
                                        creep.memory.rotationCount = rotationCount - 1;
                                    }
                                }
                            }
                        }
                    }
                    // when party is finalized (according to leader), then for every raider (leader or not), do the following...
                    let raiderType = creep.memory.raiderType;
                    let target = Game.getObjectById(leader.creep.memory.targetID);
                    if (!raiderType) {
                        if (target) {
                            if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                                creep.rangedMassAttack();
                            }
                        } else {
                            creep.rangedMassAttack();
                        }
                        let healingTarget = raidingParty.mostHurtUnit;
                        if (healingTarget) {
                            if (creep.heal(healingTarget) == ERR_NOT_IN_RANGE) {
                                if (creep.rangedHeal(healingTarget) == ERR_NOT_IN_RANGE) {
                                    creep.heal(creep);
                                }
                            }
                        } else {
                            creep.heal(creep);
                        }
                    } else if (raiderType == 1) {
                        if (target) {
                            creep.attack(target);
                        }
                    } else if (raiderType == 2) {
                        if (target) {
                            creep.dismantle(target);
                        }
                    }
                }
            }
            
            role[SPAWN_CONDITION] = () => {
                if (!this.raidingParties) { // ! if raidingParties is null, undefined, or is an empty array
                    return false;
                }
                return this.thereIsRoomInAnyRaidingParty();
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                if (this.thereIsRoomInAnyRaidingParty(creep)) {
                    // ! note that a creep with neither ATTACK nor WORK is considered raiderType 0; having no raiderType set also means raiderType 0
                    if (creep.getActiveBodyparts(ATTACK) > 0) {
                        creep.memory.raiderType = 1;
                    } else if (creep.getActiveBodyparts(WORK) > 0) {
                        creep.memory.raiderType = 2;
                    }
                }
            }
            
            role[RECOMMIT_FUNCTION] = (creepName) => {
                let creep = Game.creeps[creepName];
                let raidingParty = this.raidingParties[creep.memory.partyIndex];
                if (raidingParty) {
                    let raiderIndex = creep.memory.raiderIndex
                    if (raiderIndex != null) {
                        raidingParty.raiders[raiderIndex] = raidingParty.createRaiderObject(creep.name); // ! note that Javascript allows filling out arbitrary indexes in an array, leaving undefined gaps in-between...
                    }
                }
            }
            
            role[DEATH_FUNCTION] = (creepName) => {
                let partyIndex = Memory.creeps[creepName].partyIndex
                let raiderIndex = Memory.creeps[creepName].raiderIndex;
                if (Number.isInteger(partyIndex) && Number.isInteger(raiderIndex)) {
                    let raidingParty = this.raidingParties[partyIndex];
                    if (raidingParty) {
                        if (raiderIndex == 0) { // if this unit was party-leader...
                            if (raidingParty.raiders.length >= 2) { // when the array has at least one other unit in it besides leader
                                let deadLeaderMemory = Memory.creeps[raidingParty.raiders[0].name];
                                let newLeaderMemory = Memory.creeps[raidingParty.raiders[1].name];
                                // giving new leader all standard raider-memory that dead leader had...
                                for (let arr of raidingParty.leaderMemoryOptions) {
                                    newLeaderMemory[arr[0]] = deadLeaderMemory[arr[0]];
                                }
                            } else {
                                // ! all raiders have died
                            }
                        } // ! note that if any raider dies besides first (leader) or last, then there will be a gap if the party is moving in a line; however this is no great issue
                        // removing dead creep from raiders array...
                        raidingParty.raiders = raidingParty.raiders.slice(0, raiderIndex).concat(raidingParty.raiders.slice(raiderIndex+1));
                        // resetting the raiderIndex value for every raider after the dead raider...
                        for (let i = raiderIndex; i < raidingParty.raiders.length; i++) { // ! starting with raiderIndex because the raiders array has already been adjusted for the dead raider
                            Memory.creeps[raidingParty.raiders[i].name].raiderIndex = i;
                        }
                    }
                }
            }
            
            role[AUTOMATIC_MEMORY] = [PARTY_INDEX, RAIDER_INDEX, FINALIZED, PARTY_FINALIZED, TARGET_ROOM, X, Y, MOVE_AS_UNIT, X_MOVES_AS_UNIT, ROTATION_DIRECTION, ROTATION_COUNT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "repairer";
            
            // the repairer selects a single target for repairs when done collecting energy (or having maxed out last repair) and then repairs that target ...
            // ... until all carried energy is expended or that target has reached full health
            // ! note that each new target of the repairer is the structure in the base that has the lowest health (using base.lowestHealthStructure)
            // this role will withdraw exclusively from storage (as long as the storage has at least a specific amount), but will otherwise harvest from sources
            // note that this role will not harvest from sources that are used by dropMiners, linkMiners, or upgradeMiners
            // this role will wait at the room-memory-based wait-location when it cannot collect any resources
            // ! note that the repairer will not spawn for low health containers, as container-repair is always handled by dropMiners (as this script does not use containers otherwise)
            // ! note that repairers will spawn much later for bases that have an upgradeMine, because of the faster rate of energy depletion in such bases
            // !!! currently the repairer will not stop spawning when walls and ramparts are maxed; update the spawn-condition when time allows (see notes at spawn-condition)
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                let base = this.bases[baseName];
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep, TARGET_ID);
                    if (collect) {
                        if (!withdrawOrHarvestEnergy(creep, REPAIRER_USE_STORAGE_THRESHOLD)) { // when withdrawing or harvesting cannot be completed
                            rallyAtWaitLocation(creep, baseName);
                        }
                    } else {
                        let target = setTargetInMemory(creep, base.lowestHealthStructure, (x)=>(!x || x.hits == x.hitsMax));
                        if (target) {
                            moveToAndRepairTarget(creep, target, {reusePath: 30});
                        }
                    }
                }
            }
            
            // !!! update spawn-condition so that spawning stops once walls and ramparts have been maxed (at which point towers would handle all maintenance)
            // ... there will also need to be a base variable to indicate that walls and ramparts have initially been repaired enough ...
            // ... and then a way to reverse the value of that variable if walls or ramparts later go below a specific threshold of hitpoints
            role[SPAWN_CONDITION] = (baseName) => {
                let room = Game.rooms[baseName];
                let base = this.bases[baseName];
                if (room.storage && base.lowestHealthStructure && base.lowestHealthStructure.structureType != STRUCTURE_CONTAINER) {
                    if (room.controller.level == 8 && !base.upgradeMine && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > REPAIRER_LATE_SPAWN_THRESHOLD) {
                        return true;
                    } else if (room.controller.level == 8 && base.upgradeMine && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > REPAIRER_LATE_WITH_UM_SPAWN_THRESHOLD) {
                        return true;
                    } else if (room.controller.level < 8 && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > REPAIRER_EARLY_SPAWN_THRESHOLD) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [RECYCLE, COLLECT, STORAGE_OR_SOURCE_ID, STORAGE_OR_SOURCE, TARGET_ID];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "scavenger";
            
            // the scavenger moves to and collects any and all resources from ruins, gravestones, or drops (using the Base variable, scavengerItem)
            // all collected resources are returned to local storage
            // note that the scavenger will only spawn when base.spawnScavenger is true; this is set to true when large-scale recycling occurs, such as with harvesters ...
            // ... and also during smaller-scale recycling with units like the fortifier, paver, builder, etc. since they typically drop sizable amounts of energy
            // if you want to spawn a scavenger otherwise, use forceCondition in a base spawn-array
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                        travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForGeneralCollection(creep);
                    if (collect) {
                        let base = this.bases[baseName];
                        let target = Game.getObjectById(creep.memory.targetID);
                        if (!target || (target.store && target.store.getUsedCapacity() == 0)) { // !!! factor this out if it makes sense to do so...
                            if (base.scavengerItem) {
                                creep.memory.targetID = base.scavengerItem.id;
                                creep.memory.targetType = base.scavengerItemType;
                                target = Game.getObjectById(creep.memory.targetID);
                            } else {
                                creep.memory.targetID = null;
                                creep.memory.targetType = null;
                            }
                        }
                        if (target) {
                            pickupOrWithdrawFromTarget(creep, target, null, {reusePath: 30});
                        } else {
                            rallyAtWaitLocation(creep, baseName, true);
                        }
                    } else {
                        transferAllCarriedToTarget(creep, creep.room.storage, {reusePath: 30});
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                if (this.bases[baseName].spawnScavenger && curCount < 1) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[BIRTH_FUNCTION] = (creepName) => {
                let baseName = Game.creeps[creepName].memory.base;
                this.bases[baseName].spawnScavenger = false; // whenever a scavenger spawns, disable spawning of scavengers...
            }
            
            role[DEATH_FUNCTION] = (creepName) => {
                // ! note that if this.spawnScavenger was set to true while scavenger was already alive, then, at death, another would immediately respawn; ...
                // ... the below code prevents this from happening (although, with very unlucky timing, this section could prevent a useful follow-up spawn)
                let baseName = Memory.creeps[creepName].base;
                let base = this.bases[baseName];
                if (base) {
                    base.spawnScavenger = false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT, TARGET_ID, TARGET_TYPE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "scavengingHelper";
            
            // the scavengingHelper collects dropped energy and energy from gravestones, and then transfers it to spawns/extensions, towers, or storage
            // this role is primarily to be used in early-level emergencies when only a very cheap creep can be afforded and when there are energy drops and graves in room
            // ! note that this role should not have WORK parts as it only does transfers
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        let target = getTargetForLootingFromPriorities(creep, true, [
                            FIND_DROPPED_RESOURCES,
                            FIND_TOMBSTONES
                        ]);
                        if (target) {
                            pickupOrWithdrawFromTarget(creep, target, RESOURCE_ENERGY);
                        } else {
                            rallyAtWaitLocation(creep, baseName, true);
                        }
                    } else {
                        let base = this.bases[baseName];
                        transferEnergyByPriority(creep, [
                            base.spawnOrExt,
                            base.mostUnderchargedTower,
                            creep.room.storage
                        ]);
                    }
                }   
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT, TARGET_ID, TARGET_TYPE];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "sentinel";
            
            // the sentinel moves to position (from [x,y] in memory), and then attacks adjacent enemy creeps within range (if any) with ranged-attacks
            // this role is meant to attack from within a rampart-location
            // this role should have RANGED_ATTACK, MOVE, and ideally only one HEAL (assuming it is protected by rampart)
            // !!! this role could be made more efficient by using memory for targeting...
            // !!! also this role feels too simplistic anyway... consider how to improve... and whether to add spawn-condition
            
            role[RUN_FUNCTION] = (creep) => {
                healSelfWhenInjured(creep);
                if (creep.room.name != creep.memory.targetRoom) {
                    travelToTargetRoom(creep);
                } else {
                    if (!moveToPositionXY(creep, creep.memory.x, creep.memory.y)) { // if already in position...
                        let closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        if (closestHostile) {
                            if (creep.rangedAttack(closestHostile) == ERR_NOT_IN_RANGE) {
                                // do nothing...
                            }
                        }
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM, X, Y];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "towerCharger";
            
            // the towerCharger collects energy exclusively from storage; it then moves into position (via room-memory data), and then fills the lowest-energy tower
            // ! note that this role uses the base property base.mostUnderchargedTower to determine which tower to transfer energy to
            // this role is specifically designed around my templates where all towers are always reachable from a single position, which is the "towerChargerPosition"
            // because this role is storage dependant, it will only spawn when a storage exists, and only when the storage's stored energy is above a certain threshold
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        withdrawFromLocalStorage(creep, RESOURCE_ENERGY);
                    } else {
                        let base = this.bases[baseName];
                        if (!moveToPosition(creep, base.towerChargerPosition)) {
                            // when in position...
                            transferEnergyToTarget(creep, base.mostUnderchargedTower)
                        }
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                if (curCount >= 1) { // ! only one is allowed at maximum in any base
                    return false;
                }
                let room = Game.rooms[baseName];
                if (this.bases[baseName].mostUnderchargedTower && (room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > TOWERCHARGER_SPAWN_THRESHOLD)) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "upgradeMiner";
            
            // the upgradeMiner moves to its position at the upgradeMine, and then alternatingly harvests energy (until full store) and upgrades controller (until empty store)
            // this role should spawn automatically when appropriate (assuming it is properly placed in spawn arrays) as long as upgradeMines are set within room memory
            // note that this role takes precedence over dropMiners, linkMiners, and harvesters, and will replace them (assuming upgradeMines are set within room memory)
            // this role will recycle if the related upgradeMine is for whatever reason deleted; although no roles are set to replace this one
            // ! note that there can only ever be one upgradeMine (and hence upgradeMiner) for any given base; and bases with only once source cannot have any upgradeMine
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (recycleWhenRedundant(creep, baseName, true)) { return; } // ! terminate role code immediately if recycling
                if (remitWhenDying(creep, baseName, 7, false)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let mine = this.bases[baseName].upgradeMine;
                    if (mine) {
                        if (!moveToPosition(creep, mine.pos)) { // if already in position...
                            let collect = setTaskForEnergyCollection(creep);
                            if (collect) {
                                creep.harvest(Game.getObjectById(mine.sourceID));
                            } else {
                                creep.upgradeController(creep.room.controller);
                            }
                        }
                    } else {
                        creep.memory.recycle = true; // ! creep is no longer needed due to upgradeMine being gone...
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName, curCount) => {
                if (this.bases[baseName].upgradeMine && curCount < 1) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "upgrader";
            
            // the upgrader uses energy to upgrade the base's controller
            // this role will withdraw exclusively from storage (as long as the storage has at least a specific amount), but will otherwise harvest from sources
            // note that this role will not harvest from sources that are used by dropMiners, linkMiners, or upgradeMiners
            // this role will wait at the room-memory-based wait-location when it cannot collect any resources
            // ! note that this role will not spawn at all for any base that has an upgradeMine, or for any base that uses a linkUpgrader
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        if (!withdrawOrHarvestEnergy(creep, UPGRADER_USE_STORAGE_THRESHOLD)) { // when withdrawing or harvesting cannot be completed
                            rallyAtWaitLocation(creep, baseName);
                        }
                    } else {
                        moveToAndUpgradeTarget(creep, creep.room.controller);
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName) => {
                let base = this.bases[baseName];
                let curRoom = Game.rooms[baseName];
                if (base.upgradeMine || base.controllerLinkID) {
                    return false;
                } else if (curRoom.controller.level >= 4 && curRoom.storage && curRoom.storage.my && curRoom.storage.store.getUsedCapacity(RESOURCE_ENERGY) > UPGRADER_EARLY_SPAWN_THRESHOLD) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "upgraderS";
            
            // the upgraderS withdraws energy (exclusively) from storage and then uses that energy to upgrade the controller
            // this role is meant to be the "Super" version of the normal upgrader, in that it is more specialized and efficient, and is meant to have a much more "heavy" body
            // this role has a specialized spawn-condition that makes it come out to join the normal upgrader when there is an "excess" of energy in the storage
            // use this role when, for whatever reason, there is too much energy in storage
            // ! note that this role will not spawn at all for any base that uses a linkUpgrader, because it would probably be VERY inefficient with its movement...
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 50)) { return; } // ! terminate role code immediately if remitting
                if (creep.room.name != baseName) {
                    travelToTargetRoom(creep, 1);
                } else {
                    let collect = setTaskForEnergyCollection(creep);
                    if (collect) {
                        withdrawFromLocalStorage(creep, RESOURCE_ENERGY);
                    } else {
                        moveToAndUpgradeTarget(creep, creep.room.controller);
                    }
                }
            }
            
            role[SPAWN_CONDITION] = (baseName) => {
                let rm = Game.rooms[baseName];
                if (this.bases[baseName].controllerLinkID) {
                    return false;
                }
                if (rm.storage && rm.storage.my && (rm.controller.level == 4 && rm.storage.store.getUsedCapacity(RESOURCE_ENERGY) > UPGRADER_S_EARLY_SPAWN_THRESHOLD ||
                                                    rm.controller.level >= 5 && rm.storage.store.getUsedCapacity(RESOURCE_ENERGY) > UPGRADER_S_LATE_SPAWN_THRESHOLD)) {
                    return true;
                } else {
                    return false;
                }
            }
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        {
            let role = makeCreepRole();
            
            role[ROLE_NAME] = "upgraderX";
            
            // the upgraderX moves to targetRoom to upgrade the controller of that room, using energy taken from own base's storage exclusively
            // this role is meant to be used to help advance a base that has difficulty due to poor source locations, or other disadvantages
            // ! note that this role has no spawn condition and thus must be spawned manually per base as needed
            
            role[RUN_FUNCTION] = (creep) => {
                let baseName = creep.memory.base;
                if (remitWhenDying(creep, baseName, 200, false)) { return; } // ! terminate role code immediately if remitting
                let targetRoom = creep.memory.targetRoom;
                let collect = setTaskForEnergyCollection(creep);
                if (collect) {
                    if (creep.room.name != baseName) {
                        travelToTargetRoom(creep, 1);
                    } else {
                        withdrawFromLocalStorage(creep, RESOURCE_ENERGY);
                    }
                } else {
                    if (creep.room.name != targetRoom) {
                        travelToTargetRoom(creep);
                    } else {
                        moveToAndUpgradeTarget(creep, creep.room.controller);
                    }
                }
            }
            
            role[REQUIRED_MEMORY] = [TARGET_ROOM];
            
            role[AUTOMATIC_MEMORY] = [COLLECT];
            
            rolesArr.push(role);
        }
        //###############################################################################################
        // finally, collecting all role data into appropriate class variables...
        this.uniqueRoles = rolesArr.length;
        for (let i = 0; i < rolesArr.length; i++) {
            this.roles[rolesArr[i].name] = rolesArr[i];
        }
        
        // BEGINNING POWERCREEP SECTION...
        // all distinct powerCreep roles are created within this section
        // !!!!! note that this section is very much unfinished !!!!!
        //###############################################################################################
        {
            let pcRole = makePowerCreepRole();
            
            pcRole[ROLE_NAME] = "op1"; // !!! consider possible naming schemes...
            
            pcRole[RUN_FUNCTION] = (pc) => {
                let pcname = "op"; // !!!!!!!!!!!! for now this must be set manually!
                if (pc.room.name != pc.memory.base) {
                    travelToTargetRoom(pc, 1);
                } else {
                    if (!pc.room.controller.isPowerEnabled) {
                        if (pc.enableRoom(pc.room.controller) == ERR_NOT_IN_RANGE) {
                            pc.moveTo(pc.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    if (pc.ticksToLive < 500) { // !!! this "if" will need to be better
                        let base = this.bases[pc.room.name];
                        if (base && base.powerSpawnID) {
                            let ps = Game.getObjectById(base.powerSpawnID);
                            if (pc.renew(ps) == ERR_NOT_IN_RANGE) {
                                pc.moveTo(ps, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                    } else {
                        let waitAtPosition = false;
                        let collect = setTaskForGeneralCollection(pc);
                        if (collect) {
                            waitAtPosition = true;
                            pc.usePower(PWR_GENERATE_OPS);
                        } else {
                            let target = null;
                            if (pc.room.storage && pc.room.storage.store.getUsedCapacity(RESOURCE_OPS) < 50000 && pc.room.storage.store.getFreeCapacity() >= 50000) { // !!!
                                target = pc.room.storage;
                            } else if (pc.room.terminal && pc.room.terminal.store.getUsedCapacity(RESOURCE_OPS) < 25000) { // !!!
                                target = pc.room.terminal;
                            }
                            if (target) {
                                if (pc.transfer(target, RESOURCE_OPS) == ERR_NOT_IN_RANGE) {
                                    pc.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                                }
                            } else {
                                waitAtPosition = true;
                            }
                        }
                        if (waitAtPosition) {
                            let position = pc.room.memory[pcname];
                            if (position) {
                                moveToPositionXY(pc, position.x, position.y);
                            } else {
                                moveCreepToLocalTarget(pc, pc.room.controller);
                            }
                        }
                    }
                }
            }
            
            pcRole[AUTOMATIC_MEMORY] = [COLLECT];
            
            powerCreepRolesArr.push(pcRole);
        }
        //###############################################################################################
        // collecting all powerCreepRole data into appropriate class variable...
        for (let i = 0; i < powerCreepRolesArr.length; i++) {
            this.powerCreepRoles[powerCreepRolesArr[i].name] = powerCreepRolesArr[i];
        }
    }
    
    // this method handles the creation of the spawn arrays at initialization
    // see each section of this method for more information about what is being done
    // ! note that the spawn arrays are essentially static and are never changed during runtime after their initial creation during script initialization
    createSpawnObjectsAtInit() {
        // this object has all the characters as used in the "body string" (see below for more information)
        // ! notice that 'i' relates to CLAIM because there would otherwise have been an overlap on 'c'
        const charToBody = {
            m: MOVE,
            w: WORK,
            c: CARRY,
            a: ATTACK,
            r: RANGED_ATTACK,
            h: HEAL,
            i: CLAIM,
            t: TOUGH
        };
        // this arrow-function iterates through the finished body array, returning the final cost for any creep of this body
        // ! note that the body-array is created separately, and thus this function makes a second pass over the created array reducing overall efficiency, ...
        // ... but this is acceptable as this code is only run at re-commit, and, also, this allows for greater flexibility and simplicity of the body-array creation code
        let getBodyCost = (bodyArr) => {
            let totalCost = 0;
            for (let part of bodyArr) {
                totalCost += BODYPART_COST[part];
            }
            return totalCost;
        }
        // this arrow-function receives a bodyString and, from it, creates a body-part array
        // the bodyString is the string that follows a format like this: "2w2c", meaning 2 WORKs and 2 CARRYs, yields [WORK,CARRY,WORK,CARRY]
        // body-part ordering has a few rules of priority...
        // ... TOUGHs are always first
        // ... HEALs are always last (with the single exception following)
        // ... the last part is always a MOVE (if any move is included)
        // ... all other parts follow a repeating pattern of intermixing to help prevent the destruction of all of a single part-type (except TOUGHs)
        // ! note that the ordering of the parts of the string matters, for example, "2c2w", yields [CARRY,WORK,CARRY,WORK]
        // ! note also that all characters can be added multiple times, such as in "2c2w2w" giving different orderings (except with HEAL or TOUGH) due to intermixing process
        // ! finally, note that a malformed bodyString will cause an error, which will give information about how to correct the passed bodyString
        let createCreepBodyFromString = (bodyString) => {
            let errorMessage = "INVALID BODYSTRING -> \""+bodyString+"\"\n"; // this message precedes each of the specific error messages
            let creepBody = []; // holds the final creep body as an array
            let maxNum = -1; // holds the largest of all numbers included in the bodyString (ignoring any related to HEALs or TOUGHs)
            let bodyArr = []; // aligns with numARR; keeps a sequential order of body types
            let numArr = []; // aligns with bodyARR; keeps a sequential order of numbers
            let healParts = 0; // keeps track of the total number of HEAL parts in the bodyString (in order to add them to end)
            let numericString = ""; // temporarily holds each of the numeric sequences from the bodyString, until the number is parsed out
            // checking each character of bodyString in order to fill out bodyArr and numArr, keep track of HEALs, and begin filling out creepBody
            for (let ch of bodyString) {
                if (charToBody[ch] == undefined) { // if current character is NOT a valid body-part character (meaning it SHOULD be a numeric character)
                    numericString += ch;
                } else { // the character is a valid body-part character
                    if (numericString == "") { // if no numeric characters have yet to be found...
                        throw new Error(errorMessage+"Body part characters must be preceded by numbers!");
                    } else {
                        let parsedNumber = Number(numericString);
                        numericString = ""; // resetting numericString since it was already parsed...
                        if (Number.isNaN(parsedNumber) || parsedNumber < 1) { // if parsed number is invalid
                            throw new Error(errorMessage+"String is invalid, due to having invalid characters or a value less than 1.");
                        } else { // parsed number SHOULD be OK, although it could be a float...
                            if (ch == "t") { // if a TOUGH
                                for (let i = 0; i < parsedNumber; i++) {
                                    creepBody.push(TOUGH); // TOUGHs are immediately added to creepBody array
                                }
                            } else if (ch == "h") { // if a HEAL
                                healParts += parsedNumber; // HEALs are held onto for now, and then added at end...
                            } else { // if any other part...
                                if (parsedNumber > maxNum) {
                                    maxNum = parsedNumber; // saving largest parsedNumber
                                }
                                bodyArr.push(charToBody[ch]);
                                numArr.push(parsedNumber);
                            }
                        }
                    }
                }
            }
            // final error checks...
            if (numArr.length != bodyArr.length) { // !!! this shouldn't ever be true, but is here just in case incorrect edits are made, or the like
                throw new Error(errorMessage+"bodyArr and numArr are of different lengths!");
            }
            if (numericString != "") {
                throw new Error(errorMessage+"String is invalid due to trailing irrelevent characters.");
            }
            let addMove = false;
            // looks through bodyArr for a MOVE part and, if one is found, decrements the appropriate element of numArr while indicating that a MOVE should be added later
            for (let i = 0; i < bodyArr.length; i++) {
                if (bodyArr[i] == MOVE) {
                    numArr[i]--; // ! this is safe (as long as it is done only once) because the bodyString can only receive values >= 1
                    addMove = true;
                    break; // terminate loop since a MOVE was already found and removed...
                }
            }
            // repreatedly iterates over the equal-length arrays numArr and bodyArr, decrementing any value in numArr by 1 and pushing the related part from bodyArr onto creepBody
            // this pattern ensures that the most numerous of parts appear closest to the front (meaning they will take damage first) ...
            // ... and eventually (generally) a repeating pattern will begin to form as more body parts are pushed, helping to ensure the creep retains a balance of functionality
            // ! note that this loop is not very efficient, but at least it is only run during intialization, and so will not affect main-loop CPU costs
            for (let x = maxNum; x > 0; x--) {
                for (let i = 0; i < numArr.length; i++) {
                    if (numArr[i] == x) {
                        creepBody.push(bodyArr[i]);
                        numArr[i]--;
                    }
                }
            }
            // adding all HEAL parts at end
            for (let i = 0; i < healParts; i++) {
                creepBody.push(HEAL);
            }
            // adding previously removed MOVE (if any) to the very end
            if (addMove) {
                creepBody.push(MOVE);
            }
            // creating and returning an object that has the finalized body-array and its total cost...
            return {
                body: creepBody,
                cost: getBodyCost(creepBody)
            };
        }
        
        // this arrow-function is used exclusively in the spawn-arrays to simplify, organize, and standardize each element of the spawn-arrays
        // mso means "Make Spawn Object"
        // see the below spawn-arrays for examples of how this function is used...
        let mso = (passedMaxCount, passedRoleType, passedBodyStr, options = null) => {
            let spawnObj = {
                maxCount: passedMaxCount, // the number of creeps of this roleType to spawn per base; can be -1 if role has specialized SPAWN_CONDITION (like harvesters)
                roleType: passedRoleType, // the role's name as string
                bodyObj: createCreepBodyFromString(passedBodyStr), // the body-array; however, "mso" expects to receive a "body string", and from this generates the body-array
                options: options // an object with various properties; see the approvedOptions object below for a list
            };
            return spawnObj;
        }
        
        // this object lists out all spawning units for each base of the denoted controller level in this format { <controller_lvl>: [ mso(args...), ... ], ... }
        // use this object to spawn units consistently across all bases
        // this object has been filled out in a way that works optimally for this script; it is not meant to be changed except through small appropriate adjustments
        // ! the ordering of the spawn-objects is very significant, as the spawning process simply tries to spawn each successive element of the array in order
        // ! note that the "mso" function should be used to generate each distinct array value
        // ! note that some roles have very specific spawn conditions that prevent extra spawning even when the maxCount is raised
        // ! please see the method attemptToSpawn and the "spawn section" in main loop for more details about how spawning works
        this.spawnArraysByControllerLevel = {
            1: [mso(2, "fighter", "1t2m1a"),
                mso(-1, "harvester", "2m1w1c"),
                ],
            2: [mso(2, "fighter", "2a2m"),
                mso(-1, "harvester", "4m2w2c"),
                mso(-1, "harvester", "2m1w1c"),
                ],
            3: [mso(2, "fighter", "2a2m"),
                mso(-1, "harvester", "6m3w3c"),
                mso(-1, "harvester", "4m2w2c"),
                mso(-1, "harvester", "2m1w1c"),
                ],
            4: [mso(2, "fighter", "1t4m3a"),
                mso(-1, "scavenger", "3c3m"),
                mso(-1, "harvester", "6m3w3c"),
                mso(-1, "harvester", "4m2c2w"),
                mso(-1, "harvester", "2m1w1c"),
                mso(1, "distributor", "3c3m"),
                mso(-1, "dropMiner", "6w7m1c", {required: true}),
                mso(-1, "gatherer", "13m13c"), // "8m8c"),
                mso(1, "towerCharger", "2m2c"),
                mso(1, "paver", "6m3w3c"),
                mso(1, "upgrader", "4w2c6m"),
                mso(1, "upgraderS", "6w3c9m"),
                ],
            5: [mso(2, "fighter", "5t10m5a"),
                mso(-1, "scavenger", "3c3m"),
                mso(-1, "harvester", "6m3w3c", {required: true}),
                mso(1, "distributor", "3c3m", {required: true}),
                mso(1, "linkMiner", "6m5w1c", {required: true}),
                mso(-1, "dropMiner", "6w7m1c", {required: true}),
                mso(-1, "gatherer", "8m8c"),
                mso(1, "overseer", "2m2c"),
                mso(1, "towerCharger", "2m2c"),
                mso(1, "builder", "10m4w6c"),
                mso(1, "paver", "10m5w5c"),
                mso(1, "fortifier", "10m5w5c"),
                mso(1, "repairer", "10m5w5c"),
                mso(1, "upgrader", "6m3w3c"),
                mso(1, "upgraderS", "10m8w2c"),
                ],
            6: [mso(2, "fighter", "7t14m7a"),
                mso(-1, "scavenger", "3c3m"),
                //mso(-1, "harvester", "6m3w3c", {required: true}),
                mso(1, "distributor", "3c3m", {required: true}),
                mso(2, "linkMiner", "6m5w1c", {required: true}),
                mso(1, "overseer", "3m3c"),
                mso(1, "upgradeMiner", "15w9m3c"),
                mso(1, "towerCharger", "2m2c"),
                mso(1, "builder", "14m7c7w"),
                mso(1, "paver", "10m5w5c"),
                mso(1, "fortifier", "10m5w5c"),
                mso(1, "repairer", "10m5w5c"),
                mso(1, "linkUpgrader", "5m5w1c"),
                mso(1, "upgrader", "6m3w3c"),
                mso(1, "upgraderS", "15m10w5c"),
                ],
            7: [mso(2, "fighter", "10t20m10a"),
                mso(-1, "scavenger", "3c3m"),
                mso(1, "distributor", "6c6m", {required: true}),
                mso(2, "linkMiner", "6m5w1c", {required: true}),
                mso(1, "overseer", "3m3c"),
                mso(1, "upgradeMiner", "15w9m3c"), // !!! 18 moves for best movement...
                mso(1, "towerCharger", "2m2c"),
                mso(1, "builder", "16m8w8c"),
                mso(1, "paver", "10m5w5c"),
                mso(1, "repairer", "10m5w5c"),
                mso(1, "linkUpgrader", "5m5w1c"),
                mso(1, "upgrader", "6m3w3c"),
                mso(1, "upgraderS", "13m20w5c"),
                mso(1, "extractor", "5w3c8m"),
                ],
            8: [mso(2, "fighter", "12t25m13a"),
                mso(1, "distributor", "9c9m", {required: true}),
                mso(2, "linkMiner", "6m5w1c", {required: true}),
                mso(1, "overseer", "5m5c"),
                mso(1, "upgradeMiner", "15w9m3c"),
                mso(1, "towerCharger", "2m2c"),
                mso(1, "builder", "20m10w10c"),
                mso(1, "paver", "10m5w5c"),
                mso(1, "repairer", "10m5w5c"),
                mso(1, "linkUpgrader", "5m5w1c"),
                mso(1, "upgrader", "10m8w2c"),
                mso(1, "extractor", "15w6c21m"),
                //mso(1, "upgrader", "21m15w6c"),
                //mso(1, "upgraderS", "13m30w7c"),
                //mso(4, "raider", "18t25m2r5h"),
                //mso(4, "attacker", "3t20a23m"),
                //mso(4, "raider", "5t25m5r15h"),
                ]
        };
        
        // this object lists out all spawning units for each base in this format { <base_name>: [ mso(args...), ... ], ... }
        // ! the units in this object get attempts at spawning after the full spawnArraysByControllerLevel attempts; thus be wary of overlaps
        // use this object to spawn units for a specific base only
        // ! note that this object is meant to be very fluid and changing, and exists so that the user can adaptively spawn units as needed per base
        // ! please see the "exclamation" notes for spawnArraysByControllerLevel for some more information
        this.spawnArraysByBase = {
            W16S22: [
                mso(1, "repairer", "11m4w7c", {forceCondition: true}),
                mso(2, "upgraderS", "10m5w5c"),
            ],
            W18S22: [
                //
            ],
            W19S22: [
                mso(1, "upgraderX", "15m5w10c", {extraMemory: {targetRoom: "W18S22"}}),
            ],
            //W19S29: [ // EXAMPLES...
                //mso(5, "lootingWorker", "12m4w8c"),
                //mso(1, "upgraderX", "15m5w10c", {extraMemory: {targetRoom: "W18S22"}}),
                //mso(1, "fortifier", "12m4w8c", {forceCondition: true}),
                //mso(1, "paver", "8m4w4c", {spawnFor: "E8N18", forceCondition: true}),
                //mso(4, "upgraderS", "13m8w5c"),
                //mso(1, "scavenger", "2m2c"),
                //mso(8, "harvester", "10m5w5c", {spawnFor: "E7N18"}),
                //mso(-1, "dropMiner", "6w7m1c"),
                //mso(1, "peeker", "13h13m", {extraMemory: {peekedRoom: "E9N19", targetRoom: "E8N19", waitX: 48, waitY: 42, enterX: 49, enterY: 41, peekX: 1, peekY: 42, exitX: 0, exitY: 41}}),
                //mso(5, "looterE", "17m17c", {extraMemory: {targetRoom: "E8N19"}}),
                //mso(1, "looterM", "13c13m", {spawnFor: "W17S29", extraMemory: {targetRoom: "W19S33", targetID: "61476518d8dc4851ee3262e2", resourceType: "metal"}}),
                //mso(2, "looterM", "25c25m", {extraMemory: {targetRoom: "W18S20"}}),
                //mso(4, "attackerX", "20a20m", {extraMemory: {targetRoom: "W20S26", targetID: "607d964bcf415432f6b5c366"}}),
                //mso(3, "attacker", "5t10a15m", {extraMemory: {targetRoom: "W23S23", targetID: "607d964bcf415432f6b5c366", wait: true}}),
                //mso(2, "healerX", "2t6h8m", {extraMemory: {targetID: "61e4b93db2985ecac57e3877"}}),
                //mso(4, "healer", "25h25m", {extraMemory: {targetRoom: "W20S26"}}),
                //mso(1, "harvesterT", "24m15w9c", {extraMemory: {targetRoom: "W20S24", sourceID: "60a09421741d8a681bbae7d3"}}),
                //mso(1, "guard", "25m5t3h12a5r", {extraMemory: {targetRoom: "W20S24", x: 39, y: 40}}),
                //mso(1, "specificBuilder", "14m7c7w", {extraMemory: {targetRoom: "W21S24", targetID: "61e0f2cc9d5b4777bad8114a"}}),
                //mso(1, "antagonizer", "6t6h12m", {extraMemory: {targetRoom: "W23S23", x: 3, y: 48}}),
                //mso(8, "contributor", "25m25c", {extraMemory: {targetRoom: "W25S17"}}),
                //mso(2, "raider", "5t12m3r4h"),
                //mso(6, "harvester", "15m10w5c", {spawnFor: "W29S32"}),
                //mso(1, "demolisher", "15m15w", {extraMemory: {targetRoom: "W29S32", targetID: "61cb30ce7d8132f3e806aac2"}}),
                //mso(1, "claimer", "1i1m", {extraMemory: {targetRoom: "W29S32", task: 3}}),
                //mso(1, "peeker", "6t6h12m", {extraMemory: {targetRoom: "W22S23"}}),
            //],
        };
        
        ///////////////////////////////////////////////TEST-SECTION_FOR_SPAWN-ARRAYS//////////////////////////////////////////////////
        //// This section of code helps to verify that all spawn-arrays are filled out and used correctly, and will cause the     ////
        //// signaling of errors at re-commit when the spawn arrays are malformed. (Note that this section, however, is not       ////
        //// perfectly thorough; furthermore, this section must be continuously updated to check any newly added functionality.)  ////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        // this object is used (as a set) to check for the existence of required properties in the "spawn arrays"
        // ! note that this object must be consistent with the "mso" function
        let msoRequiredProperties = {
            maxCount: true, // must be an integer of value 1 or greater, or else -1 for specialized roles whose max count is determined automatically (such as harvesters)
            roleType: true, // must be a string that is one of the valid role names; specifies the role for the spawning creep
            bodyObj: true, // must be a string in the format as expected by the function createCreepBodyFromString
        };
        
        // this object is used (as a set) to check for the existence of optional properties in the "spawn arrays"
        // ! note that this object must be consistent with the "mso" function
        let msoOptionalProperties = {
            options: true // if provided, must be an object containing only approved options (as below)
        }
        
        // this object is used (as a set) to check the validity of parameters in the options object
        // the following parameters are usuable...
        let approvedOptions = {
            required: true, // when true, causes the spawn-attempt process to stop if the current unit could not spawn (due to lack of energy) when its SPAWN_CONDITION yields true
            spawnFor: true, // when set (to roomName), causes the unit's base (in memory) to be the roomName provided to spawnFor, instead of the base that it was spawned by
            forceCondition: true, // when true, causes the role's SPAWN_CONDITION to be ignored and treated as true
            extraMemory: true, // when an object, causes the spawning creep to have in its memory all options held within the object that was provided as value to extraMemory
            //...
        };
        
        // this object is used (as a set) to ensure that certain parameters may not be used within the extraMemory object, due to how they would conflict with basic functioning
        // ! note that specific roles disallow the use of other extraMemory options, based on whether they are automatically handled by the role
        // the following parameters are NOT usable ever within extraMemory...
        let disallowedExtraMemory = {
            role: true,
            base: true
        };
        
        ////////// COMMENCING SPAWN ARRAY CHECKS //////////
        // the below "for" loops check for typos and other mismatches in the spawn-arrays, and throw an error or issue a warning, as appropriate, upon finding any
        // these checks are done here (and only run at re-commit) to help ensure that any calibration issues are found immediately, in order to prevent later problems
        for (let property in this.spawnArraysByControllerLevel) {
            let num = Number(property);
            if (!Number.isInteger(num) || num < 1 || num > 8) {
                throw new Error("Invalid integer property: "+property+"\n       Integer properties are used by spawnArraysByControllerLevel, and must be valid controller levels (1-8 inclusive).");
            }
        }
        for (let property in this.spawnArraysByBase) {
            if (!Game.rooms[property]) {
                // ! note that a warning (and not an error) is signalled here to allow for the convenience of preparing spawn arrays before a base has been claimed ...
                // ... but also to ensure that code does not simply crash (and stay crashed) if a base were lost and a re-commit occurred
                console.log("WARNING: The string, "+property+", does not represent a room that is visible or usable by the player!\n         Every string property in spawnArraysByBase should represent a room that is one of the player's own bases!");
            }
        }
        for (let obj of [this.spawnArraysByControllerLevel, this.spawnArraysByBase]) {
            for (let property in obj) {
                for (let spawnObj of obj[property]) {
                    let errorMessage = "INVALID SPAWN OBJ: "+JSON.stringify(spawnObj)+"\n       ";
                    for (let p0 in spawnObj) {
                        // checking that each used property is recognized...
                        if (msoOptionalProperties[p0] != true && msoRequiredProperties[p0] != true) {
                            throw new Error(errorMessage+"Spawn object has an unrecognized property: "+p0);
                        }
                    }
                    for (let p0 in msoRequiredProperties) {
                        // checking that each required property is used...
                        if (spawnObj[p0] === undefined) {
                            throw new Error(errorMessage+"Spawn object does not use a required property: "+p0);
                        }
                    }
                    // further checking validity of spawnObj...
                    if (!Number.isInteger(spawnObj.maxCount) || (spawnObj.maxCount == 0) || (spawnObj.maxCount < -1)) {
                        throw new Error(errorMessage+"The property maxCount must be a number, and cannot be 0 or less than -1! (Note that -1 only works for a few specific roles...)");
                    }
                    if (this.roles[spawnObj.roleType] == undefined) {
                        throw new Error(errorMessage+"The role, "+spawnObj.roleType+", is not defined!");
                    }
                    let reqMemArr = this.roles[spawnObj.roleType]["requiredMemory"];
                    let options = spawnObj["options"];
                    if (options) {
                        if (!(options instanceof Object)) {
                            throw new Error(errorMessage+"The passed options value must be a Javascript-style object.")
                        }
                        for (let p0 in options) {
                            // checking that only approved options are used...
                            if (approvedOptions[p0] != true) {
                               throw new Error(errorMessage+"Spawn object has an unrecognized property in options object: "+p0);
                            }
                        }
                        let extraMemory = options["extraMemory"];
                        if (extraMemory) {
                            if (!(extraMemory instanceof Object)) {
                                throw new Error(errorMessage+"The passed extraMemory value must be a Javascript-style object.")
                            }
                            for (let p0 in extraMemory) {
                                if (disallowedExtraMemory[p0] == true) {
                                   throw new Error(errorMessage+"Spawn object has an illegal property in extraMemory object of options object: "+p0);
                                }
                            }
                            if (reqMemArr) {
                                for (let p0 of reqMemArr) {
                                    // checking that every required property is used...
                                    if (extraMemory[p0] == undefined || extraMemory[p0] == null) {
                                        throw new Error(errorMessage+"Spawn object does not use a role-based required property in extraMemory: "+p0);
                                    }
                                }
                            }
                            let autoMemArr = this.roles[spawnObj.roleType]["automaticMemory"];
                            if (autoMemArr) {
                                for (let p0 of autoMemArr) {
                                    // checking that no automatic property is used...
                                    if (extraMemory[p0]) {
                                        throw new Error(errorMessage+"Spawn object must not attempt to set automatic-memory properties! "+p0+" cannot be set in extraMemory for this role!");
                                    }
                                }
                            }
                        } else {
                            if (reqMemArr && reqMemArr.length > 0) {
                                throw new Error(errorMessage+"Spawn object does not use any of the following role-based required properties in extraMemory: "+JSON.stringify(reqMemArr));
                            }
                        }
                    } else {
                        if (reqMemArr && reqMemArr.length > 0) {
                            throw new Error(errorMessage+"Spawn object does not set extraMemory when required! You must set all of the following role-based required properties in extraMemory: "+JSON.stringify(reqMemArr));
                        }
                    }
                }
            }
        }
    }
    
    // this method simply prepares two class variables, baseTemplates and baseBuildDetails; each is described below where initialized
    prepareBaseDataAtInit() {
        // this is an array of hard-coded base templates
        // all static (aka rigid) templates are to be collected here in a single array
        // the template name is simply its index in the array this.baseTemplates
        // ! note that each template is an array of objects where each object indicates through its contents which structures are to be built for the controller level ...
        // ... that relates to the object's index (via index+1); thus, the array at index 2 yields all buildable structures for controller level 3 (2+1), while indicating ...
        // ... that 5 extensions are to be built and then a tower, at the provided indexes as adjusted by an anchor point (which is set per base in baseBuildDetails)
        this.baseTemplates = [
            [ // ##### TEMPLATE 0 ##### 13 Height, 12 Width
                { // cLvl 1
                    spawn: [[5, 7]]
                },
                { // cLvl 2
                    extension: [[5, 3], [4, 2], [3, 3], [2, 4], [1, 5]]
                },
                { // cLvl 3
                    extension: [[2, 6], [2, 7], [3, 8], [4, 9], [5, 10]],
                    tower: [[10, 4]]
                },
                { // cLvl 4
                    extension: [[6, 11], [5, 12], [6, 12], [4, 11], [3, 12], [3, 10], [2, 11], [2, 9], [1, 10], [1, 11]],
                    storage: [[5, 6]]
                },
                { // cLvl 5
                    extension: [[0, 9], [1, 8], [0, 7], [0, 6], [0, 4], [1, 3], [0, 3], [2, 2], [0, 2], [1, 1]],
                    tower: [[10, 3]],
                    link: [[7, 8]]
                },
                { // cLvl 6
                    extension: [[3, 1], [2, 0], [1, 0], [4, 0], [5, 1], [5, 0], [6, 2], [7, 1], [6, 0], [7, 0]],
                    terminal: [[7, 6]]
                },
                { // cLvl 7
                    extension: [[8, 2], [7, 3], [8, 0], [9, 1], [10, 2], [8, 7], [10, 7], [11, 6], [11, 8], [10, 9]],
                    tower: [[10, 5]],
                    spawn: [[3, 5]],
                    factory: [[7, 7]]
                },
                { // cLvl 8
                    extension: [[9, 8], [8, 9], [9, 10], [7, 10], [8, 11], [7, 12], [9, 12], [10, 11], [10, 12], [11, 10]],
                    tower: [[9, 3], [9, 5], [8, 4]],
                    spawn: [[4, 4]],
                    nuker: [[6, 6]],
                    powerSpawn: [[6, 8]]
                }
            ],
            [ // ##### TEMPLATE 1 ##### 11 Height, 12 Width
                { // cLvl 1
                    spawn: [[5, 6]]
                },
                { // cLvl 2
                    extension: [[7, 3], [6, 2], [5, 2], [4, 1], [3, 2]]
                },
                { // cLvl 3
                    extension: [[2, 3], [1, 4], [2, 5], [2, 6], [3, 7]],
                    tower: [[10, 4]]
                },
                { // cLvl 4
                    extension: [[4, 8], [5, 9], [4, 10], [5, 10], [3, 10], [3, 9], [2, 8], [2, 10], [1, 9], [0, 10]],
                    storage: [[5, 5]]
                },
                { // cLvl 5
                    extension: [[0, 9], [1, 7], [0, 8], [0, 6], [0, 5], [0, 3], [1, 2], [0, 2], [2, 1], [1, 0]],
                    tower: [[10, 3]],
                    link: [[7, 7]]
                },
                { // cLvl 6
                    extension: [[0, 1], [2, 0], [3, 0], [5, 0], [6, 0], [7, 1], [8, 2], [9, 1], [8, 0], [9, 0]],
                    terminal: [[7, 5]]
                },
                { // cLvl 7
                    extension: [[10, 2], [10, 0], [11, 1], [11, 0], [11, 3], [8, 6], [10, 6], [9, 7], [11, 7], [11, 5]],
                    tower: [[10, 5]],
                    spawn: [[4, 3]],
                    factory: [[7, 6]]
                },
                { // cLvl 8
                    extension: [[10, 8], [11, 8], [8, 8], [9, 9], [11, 9], [10, 10], [9, 10], [7, 9], [8, 10], [6, 10]],
                    tower: [[9, 3], [9, 5], [8, 4]],
                    spawn: [[3, 4]],
                    nuker: [[6, 5]],
                    powerSpawn: [[6, 7]]
                }
            ],
            [ // ##### TEMPLATE 2 ##### 6 Height, 21 Width
                { // cLvl 1
                   spawn: [[8, 4]]
                },
                { // cLvl 2
                    extension: [[6, 5], [5, 5], [5, 4], [4, 3], [4, 5]]
                },
                { // cLvl 3
                    tower: [[13, 2]],
                    extension: [[3, 4], [3, 3], [2, 5], [1, 5], [1, 4]]
                },
                { // cLvl 4
                    extension: [[2, 3], [0, 4], [0, 3], [1, 2], [0, 1], [2, 1], [0, 0], [1, 0], [2, 0], [3, 2]],
                    storage: [[8, 3]]
                },
                { // cLvl 5
                    tower: [[13, 3]],
                    link: [[10, 5]],
                    extension: [[4, 1], [3, 0], [5, 0], [5, 2], [6, 0], [8, 0], [9, 0], [9, 1], [10, 0], [14, 0]]
                },
                { // cLvl 6
                    extension: [[15, 0], [15, 1], [14, 2], [15, 3], [16, 3], [16, 2], [16, 0], [17, 1], [18, 0], [18, 1]],
                    terminal: [[10, 3]]
                },
                { // cLvl 7
                    tower: [[13, 1]],
                    extension: [[18, 2], [17, 3], [19, 3], [18, 4], [19, 1], [20, 0], [19, 0], [20, 2], [20, 4], [19, 5]],
                    spawn: [[6, 2]],
                    factory: [[10, 4]]
                },
                { // cLvl 8
                    extension: [[20, 5], [18, 5], [17, 5], [16, 4], [15, 5], [14, 4], [14, 5], [13, 5], [12, 5], [11, 4]],
                    tower: [[12, 3], [12, 1], [11, 2]],
                    spawn: [[7, 1]],
                    nuker: [[9, 3]],
                    powerSpawn: [[9, 5]]
                }
            ]
        ];
        
        // this object specifies the base details, such as baseType and the anchor point (if any), and is meant to be manually set for every controlled base
        // baseType 0: manual (!!!!! not yet implemented)
        // baseType 1: rigid template (chosen from above hardcoded options)
        // baseType 2: dynamic template (with the template being generated by code and then saved to room memory) (!!!!! not yet implemented)
        // if baseType is 1, then template and anchor must be provided... (again, note that baseType 1 is currently the only implemented option !!!!!)
        // ... template (when provided) must be an integer that relates to a template by index in this.baseTemplates
        // ... anchor (when provided) is the [x,y] coordinate-location in the room where the template's [0,0]-coordinate will be placed
        // rotateNinetyDegrees should be set to true if the template is to be rotated 90 degrees clockwise such that the anchor is still at top-left; otherwise, false or undefined
        // autoRoads should be set to true if roads are to be automatically built over swamps adjacent to main-structures; can otherwise be unset or set to false
        // ! note that autoRoad locations will be set to room-memory regardless of the value of autoRoads; autoRoads only determines whether the roads will actually be built
        // !!!!! could add many more... such as, for example, harvester max counts per source: {... harvesterSource1MaxCount: <int>, harvesterSource2MaxCount: <int>, ...}
        this.baseBuildDetails = {
            W16S22: {
                baseType: 1,
                template: 1,
                anchor: [16,7],
                autoRoads: true,
            },
            W18S22: {
                baseType: 1,
                template: 2,
                anchor: [14,13],
                autoRoads: true,
                rotateNinetyDegrees: true,
            },
            W19S22: {
                baseType: 1,
                template: 1,
                anchor: [31,20],
                autoRoads: true,
            },
            sim: { // ! note that the base "sim" refers to the training/simulation room
                baseType: 1,
                template: 1,
                anchor: [11,17] // with spawn at 16,23
            }
        };
    }
    
    // this method prepares important Base data at script initialization, primarily setting the very important property this.bases
    // ! this method uses the Base constructor to create all Base data, storing all such data in the object this.bases
    // ! also, it is through this method that all room memory is set by the call to prepareRoomMemory
    setBasesAtInit() {
        // this arrow-function creates a role-count object, which is structured like this { <each_roleType_string>: <integer_count>, ... }
        // ! role-count objects are distinct for each base, and are used to keep track of all creep-counts according to roleType
        let makeRoleCountObject = () => {
            let roleCountObject = {};
            for (let roleType in this.roles) {
                roleCountObject[roleType] = 0;
            }
            roleCountObject["all"] = 0; // ! note that the "all" value will be a cumulative count of all types of creeps assigned to a single base
            return roleCountObject;
        }
        this.baseCount = 0;
        // creating each Base and storing each as the "value" in the this.bases object where the "key" is roomName
        // ! note that bases are given their index according to the ordering of Game.rooms; thus, a base's index may change at code re-commit ...
        // ... due to the claiming or losing of a base before re-commit; a base's baseNumber should be used cautiously with this in mind
        for (let roomName in Game.rooms) {
            if (Game.rooms[roomName].controller && Game.rooms[roomName].controller.my) {
                this.prepareRoomMemory(roomName);
                this.bases[roomName] = new Base(roomName, makeRoleCountObject(), this.baseCount);
                this.baseCount++;
            }
        }
    }
    
    // prepares and sets room memory for every room controlled, according to the baseType as set in baseBuildDetails
    // ! this method is only called by the above method setBasesAtInit, and thus this method is only used at initialization
    // all structures, sources, and other points of interest in a room, and their corresponding locations and data, are saved in room memory once so that ...
    // ... one need only to reference room memory to get certain data, instead of having to compute or calculate something again later ...
    // ... but, if anything needs to be recalculated, the appropriate parts of this method can be run again the next re-commit by changing the appropriate flags in memory
    // !!! note that this method only fully works with baseType 1 (templates) currently
    // source-link, dropmine, controller-link, "wait" position, etc., are set by this method by re-committing after placing flags of the appropriate name
    // ! note that room-memory constantly holds data relevant to roles like dropMiners, and etc., but it is the Base class variables that determine whether ...
    // ... such roles may actually spawn or be otherwise active
    prepareRoomMemory(roomName) {
        let room = Game.rooms[roomName];
        let baseBuildDetails = this.baseBuildDetails[roomName];
        let fullTerrain = room.getTerrain();
        if (room.memory.errors == undefined) {
            room.memory.errors = {};
        }
        // setting main-structure room-memory...
        if (baseBuildDetails.baseType == 1 && !room.memory[ROOM_MEMORY_SET]) { // if it is a templated base and main-structure room-memory is not set...
            let template = this.baseTemplates[baseBuildDetails.template];
            let anchor = baseBuildDetails.anchor;
            let mainStructuresObject = {};
            for (let i = 0; i < 8; i++) { // !!! constant would be better...
                let controllerLevel = i+1; // ! notice that in room memory the actual controller level is used for the key since it is an object, not an array (like the template)
                mainStructuresObject[controllerLevel] = {};
                for (let structure in template[i]) {
                    let allCoords = [];
                    for (let coord of template[i][structure]) {
                        // if template is to be rotated...
                        if (baseBuildDetails.rotateNinetyDegrees) {
                            // NON-destructively reversing the x and y of coord array...
                            coord = [coord[1], coord[0]];
                        }
                        // combining template-based coords with anchor-coord to get the actual room-based xy coordinates...
                        let x = coord[0] + anchor[0];
                        let y = coord[1] + anchor[1];
                        allCoords.push([x,y]);
                    }
                    mainStructuresObject[controllerLevel][structure] = allCoords;
                }
            }
            room.memory[MAIN_STRUCTURES] = mainStructuresObject;
            room.memory[ROOM_MEMORY_SET] = true;
            // ! resetting "SET" values for room-memory types that depend on "basic" room-memory
            room.memory[OVERSEER_POSITION_SET] = false;
            room.memory[INNER_FORTIFICATIONS_SET] = false;
            room.memory[AUTO_ROADS_SET] = false;
        }
        // creating a main-structure object for use throughout this section...
        let mainStructuresObj;
        if (room.memory[ROOM_MEMORY_SET]) {
            mainStructuresObj = room.memory[MAIN_STRUCTURES];
        }
        // setting room-memory for overseer position...
        if (room.memory[ROOM_MEMORY_SET] && !room.memory[OVERSEER_POSITION_SET]) { // if "basic" room-memory is set and overseer position is not set...
            // !!! this depends on template being set up a certain way...
            let c1 = mainStructuresObj[4][STRUCTURE_STORAGE][0];
            let c2 = mainStructuresObj[5][STRUCTURE_LINK][0];
            let biggerX = c1[0] > c2[0] ? c1[0] : c2[0];
            let biggerY = c1[1] > c2[1] ? c1[1] : c2[1];
            room.memory[OVERSEER_POSITION] = [biggerX - 1, biggerY - 1];
            room.memory[OVERSEER_POSITION_SET] = true;
        }
        // setting room-memory for towerCharger position...
        if (room.memory[ROOM_MEMORY_SET] && !room.memory[TOWERCHARGER_POSITION_SET]) { // if "basic" room-memory is set and towerCharger position is not set...
            // !!!!! the following usage of c1 and c2 depends on the template being set up an exacting way (and is a poor way of handling this arguably)
            let c1 = mainStructuresObj[3][STRUCTURE_TOWER][0];
            let c2 = mainStructuresObj[8][STRUCTURE_TOWER][2];
            // !!!!! since these two towers should be found on the same axis... proceeding to find out which axis values are distinct and then adding one to the smallest...
            let coord = [null, null];
            if (c1[0] == c2[0]) {
                coord[0] = c1[0];
                coord[1] = Math.min(c1[1], c2[1]) + 1;
            } else if (c1[1] == c2[1]) {
                coord[1] = c1[1];
                coord[0] = Math.min(c1[0], c2[0]) + 1;
            }
            // !!! could do more checks.... but ideally find a better way to handle this section
            room.memory[TOWERCHARGER_POSITION] = coord;
            room.memory[TOWERCHARGER_POSITION_SET] = true;
        }
        // setting room-memory for sources...
        if (!room.memory[SOURCES_SET]) {
            let allSourceIDs = [];
            let distances = [];
            // finding sources and calculating walking distance from the controller; ! note that source-distances may be affected by later placement of structures
            for (let source of room.find(FIND_SOURCES)) {
                allSourceIDs.push(source.id);
                distances.push(room.findPath(room.controller, source, {ignoreCreeps: true, ignoreRoads: true, maxRooms: 1}).length);
            }
            // sorting sources based on the walking distance from the controller...
            if (allSourceIDs.length > 1) {
                allSourceIDs.sort((a, b) => {return distances[allSourceIDs.indexOf(a)] - distances[allSourceIDs.indexOf(b)];});
            }
            room.memory[SOURCES] = allSourceIDs;
            room.memory[SOURCES_SET] = true;
        }
        // setting room-memory for harvestingMines...
        if (!room.memory[HARVESTING_MINE_SET]) {
            let sourceIDs = room.memory[SOURCES];
            let harvestingMineArr = new Array(sourceIDs.length);
            for (let sourceIndex = 0; sourceIndex < sourceIDs.length; sourceIndex++) {
                let sourceID = sourceIDs[sourceIndex];
                let mineData = { sourceIndex: sourceIndex, sourceID: sourceID, locations: [] };
                let source = Game.getObjectById(sourceID);
                // collecting coords of usable positions around source // ! note that this section focuses only on usable positions, and does not consider structure blockages
                for (let c of getCoordsByRange(source.pos.x, source.pos.y, 1)) {
                    let terrain = fullTerrain.get(c[0], c[1]);
                    if (terrain == 0 || terrain == TERRAIN_MASK_SWAMP) { // if the harvesting position is a plain or swamp...
                        mineData.locations.push([c[0], c[1]]);
                    }
                }
                harvestingMineArr[sourceIndex] = mineData;
            }
            room.memory[HARVESTING_MINE] = harvestingMineArr;
            room.memory[HARVESTING_MINE_SET] = true;
        }
        // setting room-memory for upgradeMines
        if (!room.memory[UPGRADE_MINE_SET]) {
            const UPGRADE_MINE_FULL_DIST = 4;
            const UPGRADE_MINE_DIST = 3;
            let upgradeMineObj = null;
            let sourceIDs = room.memory[SOURCES];
            if (sourceIDs.length >= 2) { // if there are at least 2 sources... // ! there must be at least 2 sources in a base for there to be an upgradeMine
                let upgradeMineFound = false;
                for (let sourceIndex = 0; sourceIndex < sourceIDs.length; sourceIndex++) {
                    let sourceID = sourceIDs[sourceIndex];
                    if (upgradeMineFound) {
                        break; // ! there can only be one upgradeMine...
                    }
                    let source = Game.getObjectById(sourceID);
                    let ctl = room.controller;
                    if (Math.abs(source.pos.x - ctl.pos.x) <= UPGRADE_MINE_FULL_DIST && Math.abs(source.pos.y - ctl.pos.y) <= UPGRADE_MINE_FULL_DIST) { // if the source is within 4 spaces of controller...
                        // for each potential miner position (which must be within 1 space of source...)
                        for (let c of getCoordsByRange(source.pos.x, source.pos.y, 1)) {
                            // !!!!! need to also look for structures that will be placed at this coordinate (according to main structures as stored in room memory...)
                            let terrain = fullTerrain.get(c[0], c[1]);
                            if (terrain == 0 || terrain == TERRAIN_MASK_SWAMP) { // if the harvesting position is a plain or swamp...
                                if (Math.abs(c[0] - ctl.pos.x) <= UPGRADE_MINE_DIST && Math.abs(c[1] - ctl.pos.y) <= UPGRADE_MINE_DIST) { // and it is within 3 spaces of controller
                                    upgradeMineObj = { sourceIndex: sourceIndex, sourceID: source.id, x: c[0], y: c[1] };
                                    upgradeMineFound = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            room.memory[UPGRADE_MINE] = upgradeMineObj;
            room.memory[UPGRADE_MINE_SET] = true;
        }
        // *** FLAG SECTION ***
        // flags are to be placed manually by the user to indicate locations of dropMines, linkMines, controllerLinks, wait-locations, etc.; ...
        // ... there are basically two flag-types: splittable (for things with multiple locations in a base) and singular (for things of a single location in base)
        // ! note that "splittable" flags for this section will have a name with two parts like the following: <flag_constant>_<string_content> ...
        // ... thus, for example, a linkMine flag could be named "lm_0" or "lm_a" or "lm_whatever" (note that for the sake of predictable sorting, names should be similar) ...
        // ... whereas the remaining flags are all singular and are to be named exacly the same as the related constant
        // ! when multiple "splittable" flags are placed whose order matters, flag-names will be ordered according to the string_content following the underscore
        // ! note that flag-names need to be unique across all rooms; and for this reason, among others, it is recommended to handle flag placement for one room at a time
        const SPLIT_CHAR = '_';
        const DROP_MINE_FLAG = "dm";
        const LINK_MINE_FLAG = "lm";
        const ROADBLOCK_FLAG = "roadblock";
        const CONTROLLER_LINK_FLAG = "cl";
        const WAIT_FLAG = "wait";
        let dropMineFlags = [];
        let linkMineFlags = [];
        let roadblockFlags = [];
        let controllerLinkFlag;
        let waitFlag;
        // collecting all flags into their associated arrays...
        for (let flagName in Game.flags) {
            let flag = Game.flags[flagName];
            if (flag && flag.room.name == roomName) { // if flag exists and can be found in the current room...
                if (flagName.indexOf(SPLIT_CHAR) != -1) { // if a "splittable" flagName...
                    let firstString = flagName.split(SPLIT_CHAR)[0];
                    if (firstString == DROP_MINE_FLAG) {
                        dropMineFlags.push(flag);
                        console.log("Found a dropMine flag: \""+flag.name+"\".");
                    } else if (firstString == LINK_MINE_FLAG) {
                        linkMineFlags.push(flag);
                        console.log("Found a linkMine flag: \""+flag.name+"\".");
                    } else if (firstString == ROADBLOCK_FLAG) {
                        roadblockFlags.push(flag);
                        console.log("Found a roadblock flag: \""+flag.name+"\".");
                    }// ! else it is an unmatched flag...
                } else if (flagName == CONTROLLER_LINK_FLAG) {
                    controllerLinkFlag = flag;
                    console.log("Found a controllerLink flag.");
                } else if (flagName == WAIT_FLAG) {
                    waitFlag = flag;
                    console.log("Found a wait flag.");
                } // ! else it is an unmatched flag...
            }
        }
        // ! the ordering of flagNames in Game.flags is not guaranteed to be ordered, thus the arrays are sorted according to flag-type below
        // ! notice that roadblocks are not sorted, as the order of roadblocks is irrelevent
        if (dropMineFlags.length > 1) {
            dropMineFlags.sort((a,b) => { if (a.name < b.name) { return -1; } else if (a.name > b.name) { return 1; } else { return 0; } });
        }
        if (linkMineFlags.length > 1) {
            linkMineFlags.sort((a,b) => { if (a.name < b.name) { return -1; } else if (a.name > b.name) { return 1; } else { return 0; } });
        }
        // setting room-memory for dropMines according to flags...
        if (dropMineFlags.length > 0) { // if a dropMine flag was found...
            if (room.memory[DROP_MINES_SET]) { // if room-memory is already set for dropMines...
                console.log("WARNING: room-memory is already set for dropMines, but a dropMine flag was found...");
            } else {
                let dropMinesArr = [];
                const CONTAINER_DIST = 1; // container must be within 1 space of source
                let usedSourceIDs = {};
                let sourceIDs = room.memory[SOURCES];
                for (let flag of dropMineFlags) {
                    // determines whether flag is correctly positioned relative to any source
                    for (let sourceIndex = 0; sourceIndex < sourceIDs.length; sourceIndex++) {
                        let sourceID = sourceIDs[sourceIndex];
                        if (usedSourceIDs[sourceID]) {
                            continue; // ! a single source cannot be a dropMine "twice"
                        }
                        let source = Game.getObjectById(sourceID);
                        if (Math.abs(flag.pos.x - source.pos.x) <= CONTAINER_DIST && Math.abs(flag.pos.y - source.pos.y) <= CONTAINER_DIST) { // if container is within 1 space of source
                            dropMinesArr.push({ sourceIndex: sourceIndex, sourceID: sourceID, x: flag.pos.x, y: flag.pos.y });
                            usedSourceIDs[sourceID] = true;
                            flag.remove();
                            break; // the flag was already related to a source, so stop considering other sources...
                        }
                    }
                }
                if (dropMinesArr.length > 0) {
                    room.memory[DROP_MINES] = dropMinesArr;
                    room.memory[DROP_MINES_SET] = true;
                } else {
                    console.log("WARNING: a dropMine flag was incorrectly placed!")
                }
            }
        }
        // setting room-memory for linkMines according to flags...
        if (linkMineFlags.length > 0) { // if a linkMine flag was found...
            if (room.memory[LINK_MINES_SET]) { // if room-memory is already set for linkMines...
                console.log("WARNING: room-memory is already set for linkMines, but a linkMine flag was found...");
            } else {
                const LINK_TO_SOURCE_DIST = 2; // a linkMine link must be within 2 spaces of the source...
                const LINK_MINER_TO_LINK_DIST = 1; // a linkMiner must be exactly 1 space from link
                // !!! perhaps this arrow-function should be given larger scope...
                // this function returns true when all structureTypes found at the location indicated by localStructs are also in the provided array acceptedArr; ...
                // ... but returns false when any structure at same location does not have its structureType in said array
                // localStructs is an array that must be created from the function room.lookForAt(LOOK_STRUCTURES,...)
                // acceptedArr is an array of accepted/allowable structureTypes (like the following example: [STRUCTURE_RAMPART, STRUCTURE_CONTAINER])
                let localStructuresAreInAccepted = (localStructs, acceptedArr) => {
                    let accepted = {}
                    for (let structureType of acceptedArr) {
                        accepted[structureType] = true;
                    }
                    for (let struct of localStructs) {
                        if (!accepted[struct.structureType]) { // if structureType not accepted
                            return false;
                        }
                    }
                    return true;
                };
                let linkMinesArr = [];
                let usedSources = {};
                let sourceIDs = room.memory[SOURCES];
                for (let flag of linkMineFlags) {
                    let flagMatched = false;
                    for (let sourceIndex = 0; sourceIndex < sourceIDs.length; sourceIndex++) {
                        let sourceID = sourceIDs[sourceIndex];
                        if (flagMatched) {
                            break; // stop considering this flag if it was already matched...
                        }
                        if (usedSources[sourceID]) {
                            continue; // stop considering this source if it was previously matched to a flag...
                        }
                        let source = Game.getObjectById(sourceID);
                        if (Math.abs(flag.pos.x - source.pos.x) <= LINK_TO_SOURCE_DIST && Math.abs(flag.pos.y - source.pos.y) <= LINK_TO_SOURCE_DIST) { // link must be within 2 spaces of source
                            // for each potential linkMiner position (which must be within 1 space of source...)
                            for (let c of getCoordsByRange(source.pos.x, source.pos.y, 1)) {
                                let localStructures = room.lookForAt(LOOK_STRUCTURES, c[0], c[1]);
                                // if no structures at location OR ((1 OR 2 structrures at location) AND they are acceptable structures)
                                if (localStructures.length == 0 || ((localStructures.length == 1 || localStructures.length == 2) && localStructuresAreInAccepted(localStructures, [STRUCTURE_RAMPART, STRUCTURE_CONTAINER]))) {
                                    let terrain = fullTerrain.get(c[0], c[1]);
                                    if (terrain == 0 || terrain == TERRAIN_MASK_SWAMP) { // if the harvesting position is a plain or swamp...
                                        if (Math.abs(flag.pos.x - c[0]) <= LINK_MINER_TO_LINK_DIST && Math.abs(flag.pos.y - c[1]) <= LINK_MINER_TO_LINK_DIST) { // if linkMiner standing position within exactly one space of link as well
                                            linkMinesArr.push({ sourceIndex: sourceIndex, sourceID: sourceID, minerX: c[0], minerY: c[1], linkX: flag.pos.x, linkY: flag.pos.y });
                                            flagMatched = true;
                                            usedSources[sourceID] = true;
                                            flag.remove();
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (linkMinesArr.length > 0) {
                    room.memory[LINK_MINES] = linkMinesArr;
                    room.memory[LINK_MINES_SET] = true;
                    // resetting inner fortifications if a linkMine was added to memory
                    room.memory[INNER_FORTIFICATIONS_SET] = false;
                } else {
                    console.log("WARNING: a linkMine flag was incorrectly placed!")
                }
            }
        }
        // resetting roadblock locations (if indicator set)...
        if (room.memory[RESET_ROADBLOCK_LOCATIONS]) {
            delete room.memory[ROADBLOCK_LOCATIONS];
            room.memory[ROADBLOCK_LOCATIONS_SET] = false;
        }
        // setting room-memory for roadblock locations according to flags...
        // ! note that this section does not cause a reset by default like the others; instead, the current memory object is collected and then expanded upon
        // ! note that this section deletes wall construction-sites (and ONLY sites) that are found at the exact same location as any newly discovered roadblock-flag
        // !!! could make sure that roadblock flags are not redundant... (such as at a main structure location...)
        // !!! could cause relevant flags to destroy related roads...
        if (roadblockFlags.length > 0) {
            if (!baseBuildDetails.autoRoads) {
                console.log("WARNING: "+roomName+" is not set to build autoRoads! Collecting roadblocks anyway....")
            }
            let roadblocks = [];
            let roadblockSet = {};
            // collecting old roadblocks...
            if (room.memory[ROADBLOCK_LOCATIONS_SET]) {
                for (let coord of room.memory[ROADBLOCK_LOCATIONS]) {
                    roadblocks.push(coord);
                    roadblockSet[coordToString(coord)] = true;
                }
            }
            let newRoadblock = false;
            // adding in new roadblocks...
            for (let flag of roadblockFlags) {
                if (!roadblockSet[posObjToCoordString(flag.pos)]) { // if roadblock location is new
                    newRoadblock = true;
                    roadblocks.push([flag.pos.x, flag.pos.y]);
                    roadblockSet[posObjToCoordString(flag.pos)] = true;
                    // remove road construction-site (if it exists) at flag location
                    for (let site of room.lookForAt(LOOK_CONSTRUCTION_SITES, flag.pos.x, flag.pos.y)) {
                        if (site.structureType == STRUCTURE_ROAD) {
                            site.remove();
                        }
                    }
                } else {
                    console.log("WARNING: Flag \""+flag.name+"\" does not give a new position! Removing the flag.");
                }
                flag.remove();
            }
            if (newRoadblock) {
                room.memory[ROADBLOCK_LOCATIONS] = roadblocks;
                room.memory[ROADBLOCK_LOCATIONS_SET] = true;
                // resetting automatic road locations since a new roadblock was created...
                // ! note that this also (indirectly) resets manual road locations...
                room.memory[AUTO_ROADS_SET] = false;
            } else {
                console.log("WARNING: No new roadblocks added even though roadblock flag was found.");
            }
        }
        // setting room-memory for controllerLink according to flags...
        if (controllerLinkFlag) { // if a controllerLink flag was found...
            if (room.memory[CONTROLLER_LINK_SET]) { // if room-memory is already set for controllerLink...
                console.log("WARNING: room-memory is already set for controllerLink, but a controllerLink flag was found...");
            } else {
                let flag = controllerLinkFlag;
                let controllerLink = null;
                const CONTROLLER_LINK_DIST = 2; // a controllerLink must be within 2 spaces of the controller...
                let ctl = room.controller;
                if (Math.abs(flag.pos.x - ctl.pos.x) <= CONTROLLER_LINK_DIST && Math.abs(flag.pos.y - ctl.pos.y) <= CONTROLLER_LINK_DIST) {
                    controllerLink = [flag.pos.x, flag.pos.y];
                    flag.remove();
                }
                if (controllerLink) {
                    room.memory[CONTROLLER_LINK] = controllerLink;
                    room.memory[CONTROLLER_LINK_SET] = true;
                    // resetting inner fortifications if a controllerLink was added to memory
                    room.memory[INNER_FORTIFICATIONS_SET] = false;
                } else {
                    console.log("WARNING: a controllerLink flag was incorrectly placed!")
                }
            }
        }
        // setting room-memory for the in-base wait location according to flags...
        if (waitFlag) { // if a waitFlag was found...
            if (room.memory[WAIT_LOCATION_SET]) { // if room-memory is already set for wait location...
                console.log("WARNING: room-memory is already set for in-base wait location, but a wait flag was found...");
            } else {
                let flag = waitFlag;
                // !!!!! should probably restrict location of wait flag somewhat...
                let waitLocation = [flag.pos.x, flag.pos.y];
                flag.remove();
                room.memory[WAIT_LOCATION] = waitLocation;
                room.memory[WAIT_LOCATION_SET] = true;
            }
        }
        // setting room-memory for extractor...
        if (!room.memory[EXTRACTOR_LOCATION_SET]) {
            let mineral = room.find(FIND_MINERALS)[0]; // ! using 0 this way is fine because there can only be one mineral per room
            if (mineral) { // ! this "if" shouldn't really be necessary, as every claimable room has a mineral
                room.memory[EXTRACTOR_LOCATION] = [mineral.pos.x, mineral.pos.y];
                room.memory[EXTRACTOR_LOCATION_SET] = true;
            }
        }
        // setting room-memory for inner_fortifications (which refers to those structures that will be shielded with ramparts automatically)
        // ! note that only rooms with 2 (or more) sources will have inner fortifications
        if (!room.memory[INNER_FORTIFICATIONS_SET] && room.memory[ROOM_MEMORY_SET] && room.memory[SOURCES].length >= 2) { // !!! notice that single-source rooms are excluded
            let innerF = [];
            let obj = room.memory[MAIN_STRUCTURES];
            // collecting coordinates for every main_structure besides extensions...
            for (let cLvl in obj) {
                for (let structureType in obj[cLvl]) {
                    if (structureType != STRUCTURE_EXTENSION) { // ! note that extensions are not shielded by default
                        for (let coord of obj[cLvl][structureType]) {
                            innerF.push(coord);
                        }
                    }
                }
            }
            // collecting coordinates of linkMines (if set)...
            if (room.memory[LINK_MINES_SET]) {
                for (let lmObj of room.memory[LINK_MINES]) {
                    innerF.push([lmObj.linkX, lmObj.linkY]);
                }
            }
            // collecting coordinates of controllerLink (if set)...
            if (room.memory[CONTROLLER_LINK_SET]) {
                let coord = room.memory[CONTROLLER_LINK];
                if (coord) {
                    innerF.push(coord);
                }
            }
            room.memory[INNER_FORTIFICATIONS] = innerF;
            room.memory[INNER_FORTIFICATIONS_SET] = true;
            // resetting outer-fortifications since inner-fortifications have been updated...
            room.memory[OUTER_FORTIFICATIONS_SET] = false;
        }
        // setting room-memory for outer_fortifications (which refers to manually placed walls and ramparts)
        // ! note that all walls and ramparts must be completed to get set in room memory; construction sites are NOT considered
        if (!room.memory[OUTER_FORTIFICATIONS_SET] && room.memory[INNER_FORTIFICATIONS_SET]) {
            let innerFSet = {}; // is used to make sure that inner_fortifications are NOT collected within this section
            for (let coord of room.memory[INNER_FORTIFICATIONS]) {
                innerFSet[coordToString(coord)] = true;
            }
            let outerF = {};
            outerF[STRUCTURE_RAMPART] = [];
            outerF[STRUCTURE_WALL] = [];
            // get coords for all walls and non-automatic ramparts...
            for (let structure of room.find(FIND_STRUCTURES)) {
                let coord = posObjToCoordArray(structure.pos);
                if (structure.structureType == STRUCTURE_RAMPART) {
                    if (!innerFSet[posObjToCoordString(structure.pos)]) { // if this rampart is not an INNER fortification
                        outerF[STRUCTURE_RAMPART].push(coord);
                    }
                } else if (structure.structureType == STRUCTURE_WALL) {
                    outerF[STRUCTURE_WALL].push(coord);
                }
            }
            room.memory[OUTER_FORTIFICATIONS] = outerF;
            room.memory[OUTER_FORTIFICATIONS_SET] = true;
        }
        // setting room-memory for roads of automatic placement...
        // ! note that autoRoads are set up in room-memory regardless of whether the base is set to build autoRoads
        // !!! if roads already exist over a linkmine or upgradeLink location when setting a link flag there will be trouble...
        if (!room.memory[AUTO_ROADS_SET] && room.memory[ROOM_MEMORY_SET]) {
            let blockedLocSet = {} // holds all coordinates where a road is NOT allowed
            // collecting coordinates for every main structure into the blocked set
            for (let cLvl in mainStructuresObj) {
                for (let structureType in mainStructuresObj[cLvl]) {
                    for (let coord of mainStructuresObj[cLvl][structureType]) {
                        blockedLocSet[coordToString(coord)] = true;
                    }
                }
            }
            // collecting all roadblock positions...
            if (room.memory[ROADBLOCK_LOCATIONS_SET]) {
                for (let coord of room.memory[ROADBLOCK_LOCATIONS]) {
                    blockedLocSet[coordToString(coord)] = true;
                }
            }
            // collecting overseer position (if set) into the blocked set...
            if (room.memory[OVERSEER_POSITION_SET]) {
                blockedLocSet[coordToString(room.memory[OVERSEER_POSITION])] = true;
            }
            // collecting linkMine link locations (if set) into the blocked set...
            if (room.memory[LINK_MINES_SET]) {
                let lmArr = room.memory[LINK_MINES];
                for (let obj of lmArr) {
                    let coord = [obj.linkX, obj.linkY];
                    blockedLocSet[coordToString(coord)] = true;
                }
            }
            // collecting controllerLink link location (if set) into the blocked set...
            if (room.memory[CONTROLLER_LINK_SET]) {
                blockedLocSet[coordToString(room.memory[CONTROLLER_LINK])] = true;
            }
            // collecting outer-fortifications locations into the blocked set...
            if (room.memory[OUTER_FORTIFICATIONS_SET]) {
                let outerFObj = room.memory[OUTER_FORTIFICATIONS];
                for (let structureType in outerFObj) {
                    for (let coord of outerFObj[structureType]) {
                        blockedLocSet[coordToString(coord)] = true;
                    }
                }
            }
            let autoRoads = [];
            let autoRoadsSet = {}; // ensures that autoRoads has no duplicates and tries to help with loop optimization
            // get all automatic road positions by looking 1 space around each main structure, saving any coordinate that is a swamp...
            for (let cLvl in mainStructuresObj) {
                for (let structureType in mainStructuresObj[cLvl]) {
                    for (let c of mainStructuresObj[cLvl][structureType]) {
                        for (let coord of getCoordsByRange(c[0], c[1], 1)) {
                            if (!autoRoadsSet[coordToString(coord)]) { // if coord not already collected into autoRoads...
                                if (!blockedLocSet[coordToString(coord)]) { // if coord is an allowed location...
                                    let terrain = fullTerrain.get(coord[0], coord[1]);
                                    if (terrain == TERRAIN_MASK_SWAMP) { // if the position is a swamp
                                        autoRoads.push(coord);
                                        autoRoadsSet[coordToString(coord)] = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            room.memory[AUTO_ROADS] = autoRoads;
            room.memory[AUTO_ROADS_SET] = true;
            // ! resetting manual roads since autoRoads were set...
            room.memory[MANUAL_ROADS_SET] = false;
        }
        // setting room-memory for roads of manual placement...
        // ! note that roadblocks DO affect manual road placement, such that roadblocks prevent the saving (and rebuilding) of road structures and construction-sites
        if (!room.memory[MANUAL_ROADS_SET]) {
            let ignoredCoords = {}; // contains the coordinates of auto-roads and all roadblocks (if any)
            // collecting all auto-road positions into ignoredCoords...
            if (room.memory[AUTO_ROADS_SET]) {
                for (let coord of room.memory[AUTO_ROADS]) {
                    ignoredCoords[coordToString(coord)] = true;
                }
            }
            // collecting all roadblock positions into ignoredCoords...
            if (room.memory[ROADBLOCK_LOCATIONS_SET]) {
                for (let coord of room.memory[ROADBLOCK_LOCATIONS]) {
                    ignoredCoords[coordToString(coord)] = true;
                }
            }
            let manualRoads = [];
            // finding completed roads...
            for (let structure of room.find(FIND_STRUCTURES)) {
                if (structure.structureType == STRUCTURE_ROAD) {
                    if (!ignoredCoords[posObjToCoordString(structure.pos)]) { // if coordinate is not to be ignored...
                        manualRoads.push([structure.pos.x, structure.pos.y]);
                    }
                }
            }
            // finding road construction-sites...
            for (let site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
                if (site.structureType == STRUCTURE_ROAD) {
                    if (!ignoredCoords[posObjToCoordString(site.pos)]) { // if coordinate is not to be ignored...
                        manualRoads.push([site.pos.x, site.pos.y]);
                    }
                }
            }
            room.memory[MANUAL_ROADS] = manualRoads;
            room.memory[MANUAL_ROADS_SET] = true;
        }
    }
    
    // this method tries to create a construction-site for every structure that can be built given certain conditions and the current controller level of the room (baseName)
    // in every case, this method checks room-memory to determine whether any structures are missing or needed
    // by end of method, if any construction-site is started, a class variable (Base's constructionStarted) will be set to true ...
    // ... to indicate that tick-based-checks should be done for the sake of finding new construction sites
    // ! this method is called at re-commit (through main loop [by checking for tick 0]) and is otherwise called whenever the controller (in baseName) levels up
    // ! note that this method handles all the stricter constraints to building structures (especially linkMines, dropMines, etc.), handling their timing and ordering
    // !!!!! add more controls to this, to prevent attempts at building things too early, or again, etc... (particularly where ramparts are involved...)
    checkBaseStructuresAgainstRoomMemory(baseName) {
        let curRoom = Game.rooms[baseName];
        if (curRoom.controller.my) { // if the controller is still owned...
            let sitesBuilt = false;
            let cLvl = curRoom.controller.level;
            let structureObj = curRoom.memory[MAIN_STRUCTURES];
            // try to build every main structure up to current controller level...
            for (let i = 1; i <= cLvl; i++) {
                for (let structureType in structureObj[i]) {
                    for (let coords of structureObj[i][structureType]) {
                        if (this.checkForAndBuildStructureAtCoords(structureType, curRoom, coords)) {
                            sitesBuilt = true;
                        }
                    }
                }
            }
            // try to build dropMines when dropMine data is set in room-memory...
            if (cLvl >= DROPMINER_MIN_CONTROLLER_LEVEL && cLvl <= DROPMINER_MAX_CONTROLLER_LEVEL && curRoom.storage && curRoom.storage.my && curRoom.memory[DROP_MINES_SET]) {
                for (let obj of curRoom.memory[DROP_MINES]) {
                    let coords = [obj.x, obj.y];
                    if (this.checkForAndBuildStructureAtCoords(STRUCTURE_CONTAINER, curRoom, coords)) {
                        sitesBuilt = true;
                    }
                }
            }
            // try to build linkMines when linkMine data is set in room-memory...
            // ! note that in a base starting from controller lvl 1, linkMines -- if both were set early on -- will necessarily be built within different controller levels
            if (cLvl >= LINKMINER_MIN_CONTROLLER_LEVEL && curRoom.memory[LINK_MINES_SET]) {
                let index = 0;
                for (let obj of curRoom.memory[LINK_MINES]) {
                    if (cLvl >= LINKMINER_MIN_CONTROLLER_LEVEL + index) { // ! enforces this requirement: max of 1 linkMine at cLvl 5; max of 2 linkMines at cLvl 6
                        if (this.checkForAndBuildStructureAtCoords(STRUCTURE_LINK, curRoom, [obj.linkX, obj.linkY])) {
                            sitesBuilt = true;
                        }
                    }
                    index++;
                }
            }
            // try to build controllerLink when controllerLink is set in room-memory...
            if ((cLvl >= CONTROLLER_LINK_LATE_CLVL || (cLvl == CONTROLLER_LINK_EARLY_CLVL && curRoom.memory[SOURCES].length == 1)) && curRoom.memory[CONTROLLER_LINK_SET]) {
                let coords = curRoom.memory[CONTROLLER_LINK];
                if (this.checkForAndBuildStructureAtCoords(STRUCTURE_LINK, curRoom, coords)) {
                    sitesBuilt = true;
                }
            }
            // try to build extractor when extractor-location is set in room-memory...
            if (cLvl >= EXTRACTOR_MIN_CONTROLLER_LEVEL && curRoom.memory[EXTRACTOR_LOCATION_SET]) {
                let coords = curRoom.memory[EXTRACTOR_LOCATION];
                if (this.checkForAndBuildStructureAtCoords(STRUCTURE_EXTRACTOR, curRoom, coords)) {
                    sitesBuilt = true;
                }
            }
            // try to build inner-fortifications when they are set in room-memory...
            if (cLvl >= FORTIFICATIONS_MIN_CONTROLLER_LEVEL && curRoom.memory[INNER_FORTIFICATIONS_SET]) {
                // !!!!! need more conditions for the above if (should somehow confirm that all lvl 5 structures are complete), ...
                // ... otherwise the rampart and the structure it protects may try to be built at the same time (two construction sites can't exist at same location!)
                for (let coords of curRoom.memory[INNER_FORTIFICATIONS]) {
                    if (this.checkForAndBuildStructureAtCoords(STRUCTURE_RAMPART, curRoom, coords)) {
                        sitesBuilt = true;
                    }
                }
            }
            // try to build outer-fortifications when they are set in room-memory...
            if (cLvl >= FORTIFICATIONS_MIN_CONTROLLER_LEVEL && curRoom.memory[OUTER_FORTIFICATIONS_SET]) {
                let obj = curRoom.memory[OUTER_FORTIFICATIONS];
                for (let structureType in obj) {
                    for (let coords of obj[structureType]) {
                        if (this.checkForAndBuildStructureAtCoords(structureType, curRoom, coords)) {
                            sitesBuilt = true;
                        }
                    }
                }
            }
            // try to build auto-roads when they are set in room-memory and the base is set to have autoRoads...
            if (this.baseBuildDetails[baseName].autoRoads && curRoom.memory[AUTO_ROADS_SET]) {
                for (let coords of curRoom.memory[AUTO_ROADS]) {
                    if (this.checkForAndBuildStructureAtCoords(STRUCTURE_ROAD, curRoom, coords)) {
                        sitesBuilt = true;
                    }
                }
            }
            // try to build manual-roads when they are set in room-memory...
            if (curRoom.memory[MANUAL_ROADS_SET]) {
                for (let coords of curRoom.memory[MANUAL_ROADS]) {
                    if (this.checkForAndBuildStructureAtCoords(STRUCTURE_ROAD, curRoom, coords)) {
                        sitesBuilt = true;
                    }
                }
            }
            if (sitesBuilt) { // if any construction-site was started within this method...
                this.bases[baseName].constructionStarted = true;
            }
        }
    }
    
    // looks for the passed structureType in the passed room at the passed coordinates; if the structure does not exist there, starts a contruction-site (if no site there)
    // returns true when a new construction-site has been created by this method; otherwise returns false
    checkForAndBuildStructureAtCoords(structureType, curRoom, coords) {
        let constructionSiteCreated = false;
        let exists = false;
        // checking whether structure of structureType exists at given coords...
        for (let obj of curRoom.lookForAt(LOOK_STRUCTURES, coords[0], coords[1])) {
            if (obj.structureType == structureType) {
                exists = true;
                break;
            }
        }
        if (!exists) { // if the structure does NOT exist at coords yet...
            let alreadyBuilding = false;
            // checking whether construction-site of structureType exists at given coords...
            for (let obj of curRoom.lookForAt(LOOK_CONSTRUCTION_SITES, coords[0], coords[1])) {
                if (obj.structureType == structureType) {
                    alreadyBuilding = true;
                    break;
                }
            }
            if (!alreadyBuilding) { // if NEITHER the structure NOR a construction-site of structureType exists at coords...
                // try to create a construction-site...
                let constructionAttemptCode = curRoom.createConstructionSite(coords[0], coords[1], structureType);
                if (constructionAttemptCode == OK) {
                    constructionSiteCreated = true;
                } else {
                    console.log("WARNING: construction-site for \""+structureType+"\" could not be created in "+curRoom+" at ["+coords+"]! Error code: "+constructionAttemptCode+".");
                }
            }
        }
        return constructionSiteCreated;
    }
    
    // this method frees memory that was used by creeps that are now dead, and also decrements appropriate creep counts when adjustCounts is true
    // adjustCounts should be a boolean; when true, it indicates that the related counts should be changed; when false, counts will not be changed
    // ! note that this method triggers the deathFunction for any creep that has one (according to its role)
    // ! this method should be called with adjustCounts set to false only at initialization due to the fact that there could be (for various reasons) ...
    // ... lingering creep memory that had yet to be cleared (this could happen, for example, if the script were to error out repeatedly over subsequent ticks with ...
    // ... one or more creeps dying during that period, thereby preventing (usually -- depending on the error) the completion of any related deathFunctions)
    freeDeadCreepMemory(adjustCounts) {
        for (let creepName in Memory.creeps) {
            if (!Game.creeps[creepName]) { // if the creep no longer exists
                let roleType = Memory.creeps[creepName].role;
                let baseName = Memory.creeps[creepName].base;
                if (roleType && baseName) { // if role and base were set in creep's memory // ! note that role and base should ALWAYS be set in every creep's memory
                    if (this.roles[roleType].deathFunction) { // if dead creep had a role set in memory and the role has a deathFunction
                        this.roles[roleType].deathFunction(creepName);
                    }
                    if (adjustCounts) {
                        this.changeCreepCounts(false, roleType, baseName); // ! changing counts by decrementing, hence the false
                    }
                    console.log("Freeing dead creep's memory-usage:", creepName);
                    delete Memory.creeps[creepName]; // ! according to the MDN documentation, it is safe to delete the current property in a for...in loop
                } else { // when necessary memory properties were NOT set...
                    console.log("WARNING: dead creep, \""+creepName+"\", lacks necessary memory properties! Both role and base must be set in memory.");
                }
            }
        }
    }

    // this method counts all living creeps at first initialization of script
    // ! note that it also frees the memory of any creeps that died previously, freeing such memory immediately before beginning the counting process
    // ! also, any creeps that are found to lack certain memory properties are given defaults by this method (!!!!! this process could still be improved)
    // ! creeps spawning without any memory is a rare issue and is related to server maintainance or service interruptions, and is not (directly) the fault of the code; ...
    // ... if this issue ever occurs, messages will be displayed within the console until the data for such messages are manually removed from the room's "errors" memory
    countAllCreepsAtInit() {
        this.freeDeadCreepMemory(false); // ! free memory of any creeps that previously died (before this initialization) WITHOUT adjusting counts
        for (let creepName in Game.creeps) {
            let curCreep = Game.creeps[creepName];
            let roleType = curCreep.memory.role;
            if (!roleType) {
                curCreep.room.memory.errors[Game.time] = ""+creepName+", has no role assigned in memory. Setting his role according to his name!";
                roleType = creepName.split("_")[0];
                curCreep.memory.role = roleType;
            }
            let baseName = curCreep.memory.base;
            if (!baseName) {
                curCreep.room.memory.errors[Game.time] = ""+creepName+", has no base assigned in memory. Setting his base according to his current room (if it is a base)!";
                if (!this.bases[curCreep.room.name]) { // if the room occupied by creep is NOT one of my bases...
                    for (let roomName in this.bases) {
                        Game.rooms[roomName].memory.errors[Game.time] = "An error log was saved in room "+curCreep.room.name+", which is not one of my bases!";
                        baseName = roomName; // ! setting baseName to the first found base in this.bases
                        curCreep.memory.base = baseName; // ! setting creep's base in memory to the first found base in this.bases
                        break; // ! do no more iterations because the base was just set in creep's memory
                    }
                } else {
                    baseName = curCreep.room.name;
                    curCreep.memory.base = baseName;
                }
            }
            this.changeCreepCounts(true, roleType, baseName);
        }
    }

    // this method runs the recommit-function for every creep of a role that has a recommit-function
    // ! note that this method is called at the very end of the initialization of the ScreepsScript object
    // ! see the makeCreepRole arrow function within the method setRolesObjectAtInit for more information about recommitFunction
    runRoleRecommitFunctionAtInit() {
        for (let creepName in Game.creeps) {
            let roleType = Game.creeps[creepName].memory.role;
            if (this.roles[roleType].recommitFunction) {
                this.roles[roleType].recommitFunction(creepName);
            }
        }
    }

    // this method changes all related counts of a single role by 1, according to the boolean parameter increase
    // ! note that this method is designed around a base's roleCounts object; see the arrow function makeRoleCountObject in the method setBasesAtInit for more info
    // when increase is true (meaning a unit has spawned), then the count will be incremented; otherwise, when false (meaning a unit has died) the count will be decremented
    // ! note that this method ensures that no count goes below zero
    // ! if the user were to manually change a role in creep memory (messing up counts), this method will fix any counts that subsequently go negative (caused by the death ...
    // ... of the unit whose role was manually changed); however, a full re-commit of the code is necessary to truly fix the counts if the user ever manually changes a role
    changeCreepCounts(increase, roleType, baseName) {
        if (roleType && baseName) { // if roleType and baseName are set // ! note that role and base should ALWAYS be set in every creep's memory...
            const value = (increase) ? 1 : -1;
            let base = this.bases[baseName];
            if (base) {
                base.roleCounts[roleType] += value;
                if (base.roleCounts[roleType] < 0) {
                    base.roleCounts[roleType] = 0;
                }
                base.roleCounts.all += value;
                if (base.roleCounts.all < 0) {
                    base.roleCounts.all = 0;
                }
                this.roles[roleType].curCount += value;
                if (this.roles[roleType].curCount < 0) {
                    this.roles[roleType].curCount = 0;
                }
                this.totalCreepCount += value;
                if (this.totalCreepCount < 0) {
                    this.totalCreepCount = 0;
                }
            } else { // when the base does not exist
                console.log("WARNING: changeCreepCounts called for units of a base that no longer exists!");
            }
        } else { // when necessary memory properties were NOT set...
            console.log("WARNING: changeCreepCounts called without necessary arguments!");
        }
    }

    // this method attempts to spawn a unit (represented by spawnObj) in a given base using the spawn of the given index (as spawnIndex)
    // spawnObj is an individual element of either of the spawn arrays (spawnArraysByControllerLevel or spawnArraysByBase); each spawnObj is an object created ...
    // ... with the mso function, an arrow-function found in the method createSpawnObjectsAtInit; see that function and method for more information
    // note that spawnObj may also have "options" set for configuring the spawned unit's memory, or overriding default behavior, or etc.
    // note that this method returns a numerical code to indicate the results of the spawning attempt; the "spawn section" (as mentioned in the next comment) lists the codes
    // ! note that this method is called from the main loop's "spawn section"; see that section for more information about the spawning process
    attemptToSpawn(baseName, spawnIndex, spawnObj) {
        let spawnName = this.bases[baseName].spawnNames[spawnIndex];
        let spawnFor; // indicates the creep's actual base
        let optionsPassed = (spawnObj.options) ? true : false;
        if (optionsPassed && spawnObj.options.spawnFor) { // when unit is to be spawned for another base...
            spawnFor = spawnObj.options.spawnFor;
            let spawnForRoom = Game.rooms[spawnFor];
            // if the base does not exist OR the room is not visible (at all) OR the controller within room is no longer controlled...
            if (!this.bases[spawnFor] || !spawnForRoom || !spawnForRoom.controller.my) {
                return -3; // ...cancel attempt to spawn because base does not exist or room is not controlled
            }
        } else { // when spawning for current base
            spawnFor = baseName;
        }
        if (!Game.spawns[spawnName]) {
            return -4; // spawn no longer exists, so cancel attempt to spawn
        }
        if (Game.spawns[spawnName].spawning) {
            return -2; // spawn is busy...
        }
        // when unit has a special maxCount (denoted by -1) OR its count is less than maxCount
        // ...AND...
        // spawning is forced OR spawn condition is met
        if ((spawnObj.maxCount == -1 || this.bases[spawnFor].roleCounts[spawnObj.roleType] < spawnObj.maxCount) && 
            ((optionsPassed && spawnObj.options.forceCondition) || this.roles[spawnObj.roleType].spawnCondition(spawnFor, this.bases[spawnFor].roleCounts[spawnObj.roleType]))) {
            if (spawnObj.bodyObj.cost > Game.rooms[baseName].energyAvailable) { // if the spawning CANNOT be afforded
                if (spawnObj.options && spawnObj.options.required) { // if the unit is required...
                    return -1; // stop early because a required unit cannot be spawned...
                } else {
                    return 0; // no unit was spawned (because spawning was unaffordable...)
                }
            }
            // ! note that for any creep's name to be certainly unique, it must have the number of the spawned-for base, the number of the spawning base, ...
            // ... and the index of the used spawn, in addition to the actual spawn-time; otherwise there could be naming overlaps
            // ! note also that because baseNumber can change at re-commit with the prior claiming or losing of a base, the names of living creeps can sometimes be, ...
            // ... for a limited time, more relevant to the previous commit, with the next generation of creeps all being named according to the updated value;
            // ... since this script's requirement for creep names is simply that they be unique (with the hope that they be somewhat obscurely informative), this is no issue
            let newName = spawnObj.roleType + "_" + this.bases[spawnFor].baseNumber + "_" + this.bases[baseName].baseNumber + "_" + spawnIndex + "_" + Game.time;
            let memoryObj = {role: spawnObj.roleType, base: spawnFor};
            // adding any "extra memory" (if passed) to the creep's memory
            if (optionsPassed && spawnObj.options.extraMemory) {
                for (let p in spawnObj.options.extraMemory) {
                    memoryObj[p] = spawnObj.options.extraMemory[p];
                }
            }
            if (Game.spawns[spawnName].spawnCreep(spawnObj.bodyObj.body, newName, {memory: memoryObj}) == OK) { // if the creep can be spawned
                let forBaseString = (spawnFor == baseName) ? "" : " (for "+spawnFor+")";
                console.log("Spawning "+spawnObj.roleType+" in room "+baseName+forBaseString+": "+newName);
                this.changeCreepCounts(true, spawnObj.roleType, spawnFor);
                if (this.roles[spawnObj.roleType].birthFunction != null) {
                    this.roles[spawnObj.roleType].birthFunction(newName);
                }
                return 1; // spawning was successful
            } else { // if there was some other reason it could not be spawned...
                // !!!!! note that I have not seen this section triggered in any recent versions of this script, but I leave it here just in case
                console.log("WARNING: spawning failed for "+newName+", at "+spawnName+", in "+baseName+", for "+spawnFor);
                console.log(JSON.stringify(memoryObj));
                console.log(JSON.stringify(spawnObj));
                return -5; // spawning failed for UNKNOWN reason
            }
        }
        return 0; // no unit was spawned (because the unit was not needed)
    }
    
}

// initializing class object before main loop
var screepsObj = new ScreepsScript();

module.exports.loop = function () {
    screepsObj.tickCount++;
    console.log("##### " + screepsObj.tickCount + " #####");
    
    screepsObj.freeDeadCreepMemory(true);
    
    console.log("CPU in bucket: "+Game.cpu.bucket);
    if (Game.cpu.bucket >= 10000) {
        Game.cpu.generatePixel();
    }
    
    let countString = "";
    // for every base owned...
    for (let baseName in screepsObj.bases) {
        let curBase = screepsObj.bases[baseName];
        let curRoom = Game.rooms[baseName];
        if (curBase && curRoom && curRoom.controller.my) {
            let controllerLevel = curRoom.controller.level;
            
            // tick-based checks...
            curBase.performTickBasedChecks(screepsObj.tickCount, screepsObj.baseCount);
            
            // controller level up section...
            if (screepsObj.tickCount == 0 || curBase.controllerLeveledUp) {
                curBase.controllerLeveledUp = false;
                screepsObj.checkBaseStructuresAgainstRoomMemory(baseName);
            }
            
            // tower section...
            for (let towerID of curBase.towerIDs) {
                //if (baseName == "W27S28") {
                //    break; // !!! for when I dont want the towers to spend energy...
                //}
                let tower = Game.getObjectById(towerID);
                if (tower) {
                    if (curBase.enemyPresence) {
                        for (let enemyType of curBase.attackPriorities) {
                            if (curBase.enemies[enemyType].creep) {
                                tower.attack(curBase.enemies[enemyType].creep);
                                //console.log("Attacking *"+enemyType+"*");
                                break;
                            }
                        }
                    } else if (curBase.lowestHealthStructure) {
                        if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 990) {
                            tower.repair(curBase.lowestHealthStructure);
                        }
                    }
                }
            }
            
            // link section...
            for (let linkMine of curBase.linkMines) {
                if (linkMine && linkMine.linkID) {
                    let fromLink = Game.getObjectById(linkMine.linkID);
                    if (fromLink && fromLink.store.getFreeCapacity(RESOURCE_ENERGY) < 400) {
                        fromLink.transferEnergy(Game.getObjectById(curBase.centralLinkID));
                    }
                }
            }
            if (curBase.centralLinkID && curBase.controllerLinkID) {
                let centralLink = Game.getObjectById(curBase.centralLinkID);
                let controllerLink = Game.getObjectById(curBase.controllerLinkID);
                if (centralLink && controllerLink && controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) <= CONTROLLER_LINK_MIN_ENERGY) {
                    let curAmount = centralLink.store.getUsedCapacity(RESOURCE_ENERGY);
                    if (curAmount >= MAXIMUM_AMOUNT_TO_TRANSFER_TO_CONTROLLER_LINK) {
                        centralLink.transferEnergy(controllerLink, MAXIMUM_AMOUNT_TO_TRANSFER_TO_CONTROLLER_LINK);
                    } else if (curAmount > MINIMUM_AMOUNT_TO_TRANSFER_TO_CONTROLLER_LINK) {
                        centralLink.transferEnergy(controllerLink);
                    } // otherwise do nothing, since there is not enough energy in central link yet...
                }
            }
            
            // spawn section...
            // only one base will try to spawn each tick, except for during the first tick
            if (screepsObj.tickCount == 0 || screepsObj.tickCount % screepsObj.baseCount == curBase.baseNumber) { // if first tick, or ONLY one of the different bases...
                //console.log(baseName+", with baseNumber "+curBase.baseNumber+", is attempting to spawn...");
                let unitWasSpawned = false;
                let spawnObjects = screepsObj.spawnArraysByControllerLevel[controllerLevel];
                if (screepsObj.spawnArraysByBase[baseName] != undefined && screepsObj.spawnArraysByBase[baseName].length > 0) {
                    spawnObjects = spawnObjects.concat(screepsObj.spawnArraysByBase[baseName]);
                }
                for (let spawnIndex = 0; spawnIndex < curBase.spawnNames.length; spawnIndex++) {
                    if (spawnIndex > 0 && !unitWasSpawned) {
                        break; // if first spawn didn't spawn any units, do not attempt to spawn units from other spawns
                    }
                    unitWasSpawned = false;
                    for (let spawnObj of spawnObjects) {
                        let spawnCode = screepsObj.attemptToSpawn(baseName, spawnIndex, spawnObj, controllerLevel);
                        if (spawnCode == 1) { // unit was spawned successfully
                            unitWasSpawned = true;
                            break; // move onto next spawn...
                        } else if (spawnCode == 0) { // no unit was spawned
                            continue; // continue with this spawn...
                        } else if (spawnCode == -1) { // required unit could not be spawned when its count was too low
                            break; // move onto next spawn without spawning, thus ending all spawn attempts
                        } else if (spawnCode == -2) { // spawn is busy spawning already...
                            unitWasSpawned = true;
                            break; // move onto next spawn...
                        } else if (spawnCode == -3) { // the base does not exist or room is no longer controlled
                            continue; // continue with this spawn... (most likely the spawnFor option was used for a lost base or uncontrolled room)
                        } else if (spawnCode == -4) { // spawn no longer exists, so cancel attempt to spawn
                            unitWasSpawned = true; // !!!!! pretending that this spawn spawned a unit in order to ensure that another spawn in base may get to spawn
                            break; // move onto next spawn if one exists
                        } else if (spawnCode == -5) { // spawning failed for unknown reason...
                            console.log("Spawning failed for unknown reason..."); // !!! again, I haven't seen this trigger for a long time, but it is here just in case
                        }
                    }
                }
            }
            
            // power spawn section...
            if (curBase.powerSpawnID) {
                let powerSpawn = Game.getObjectById(curBase.powerSpawnID);
                if (powerSpawn && powerSpawn.store.getUsedCapacity(RESOURCE_POWER) > 0) {
                    powerSpawn.processPower();
                }
            }
            
            // factory section...
            if (curBase.factoryID) {
                let factory = Game.getObjectById(curBase.factoryID);
                if (factory) {
                    // !!!!! add more stuff later and consider how to better adapt the following...
                    //if (factory.store.getUsedCapacity(RESOURCE_BATTERY) >= 50 && factory.cooldown == 0) {
                    //    factory.produce(RESOURCE_ENERGY);
                    //}
                }
            }
            
            // error-messages section...
            for (let p in curRoom.memory.errors) {
                console.log("In "+curRoom.name+", at tick "+p+": "+curRoom.memory.errors[p]);
            }
            
            // count-collecting section...
            countString = countString + controllerLevel + " " + baseName.padStart(6) + (" (" + curBase.roleCounts.all + ")").padEnd(6) + " --> ";
            for (let roleType in screepsObj.roles) {
                countString = countString + curBase.roleCounts[roleType] + "/";
            }
            if (curRoom.controller.level < 8) {
                countString += " ... "+curRoom.controller.progress+" of "+curRoom.controller.progressTotal+" ("+(curRoom.controller.progress/curRoom.controller.progressTotal*100).toFixed(4)+" %)";
            }
            countString += "\n";
        }
    }
    
    // count output section...
    let totalString = "     ALL" + (" ("+screepsObj.totalCreepCount+")").padEnd(6) + " --> ";
    for (let roleType in screepsObj.roles) {
        totalString = totalString + screepsObj.roles[roleType].curCount + "/";
    }
    console.log(countString+totalString);
    
    // spawn output section...
    for (let spawnName in Game.spawns) {
        let currentSpawn = Game.spawns[spawnName];
        if (currentSpawn && currentSpawn.spawning) { 
            let spawningCreep = Game.creeps[currentSpawn.spawning.name];
            currentSpawn.room.visual.text(spawningCreep.memory.role,
                                          currentSpawn.pos.x + 1, 
                                          currentSpawn.pos.y,
                                          {align: 'left', opacity: 0.8});
        }
    }
    
    // terminal section...
    { // !!!!! this section is meant to be adjusted manually... and for now must be started and stopped manually (by changing the NULL in if-expression)
        if (null) { //////////////////////////////////// SELL OWNED RESOURCES HERE //////////////////////////////////////////////
            let myRoom = "E8N17"; // !!!
            let soldResource = RESOURCE_OXIDANT; // !!!
            let minSellValue = 250; // !!!
            let maxTransferCost = 3000; // !!!
            let room = Game.rooms[myRoom];
            if (room && soldResource && minSellValue && room.terminal && room.terminal.my && room.terminal.cooldown == 0) {
                let allOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: soldResource});
                allOrders.sort((a,b) => b.price - a.price);
                for (let order of allOrders) {
                    let transferCost = Game.market.calcTransactionCost(order.amount, myRoom, order.roomName);
                    if ((order.amount > 0) && (order.price > minSellValue) && (transferCost < maxTransferCost)) {
                        console.log("Attempting to sell "+order.amount+" "+order.resourceType+" at price "+order.price+" for total of "+(order.price * order.amount)+" credits, with transfer cost of "+transferCost+"...");
                        if (0 == Game.market.deal(order.id, order.amount, myRoom)) {
                            console.log("DEAL SUCCESSFUL!");
                        } else {
                            console.log("DEAL FAILED!");
                        }
                        break;
                    }
                }
            }
        }
        if (null) { //////////////////////////////////////// BUY NEW RESOURCES HERE //////////////////////////////////////////////
            let myRoom = "E8N17"; // !!!
            let boughtResource = RESOURCE_POWER; // !!!
            let maxCostEach = 500; // !!!
            let maxQuantityPurchased = 5000; // !!!
            let maxTransferCost = 2000; // !!!
            let room = Game.rooms[myRoom];
            if (room && boughtResource && maxCostEach && maxQuantityPurchased && room.terminal && room.terminal.my && room.terminal.cooldown == 0) {
                let allOrders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: boughtResource});
                allOrders.sort((a,b) => a.price - b.price);
                for (let order of allOrders) {
                    let purchasedQuantity = (maxQuantityPurchased > order.amount) ? order.amount : maxQuantityPurchased;
                    let transferCost = Game.market.calcTransactionCost(purchasedQuantity, order.roomName, myRoom);
                    if ((purchasedQuantity > 0) && (order.price < maxCostEach) && (transferCost < maxTransferCost)) {
                        console.log("Attempting to buy "+purchasedQuantity+" "+order.resourceType+" at price "+order.price+" for total of "+(order.price * order.amount)+" credits, with transfer cost of "+transferCost+"...");
                        if (0 == Game.market.deal(order.id, purchasedQuantity, myRoom)) {
                            console.log("DEAL SUCCESSFUL!");
                        } else {
                            console.log("DEAL FAILED!");
                        }
                        break;
                    }
                }
            }
        }
    }
    
    // raiding party section...
    for (let raidingParty of screepsObj.raidingParties) {
        if (raidingParty) {
            raidingParty.setRaiderCreepObjectsEachTick();
            raidingParty.findMostHurtRaider();
        }
    }
    
    // role section...
    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];
        let roleType = creep.memory.role;
        if (screepsObj.roles[roleType] != undefined) {
            screepsObj.roles[roleType].runFunction(creep);
        } else {
            console.log(roleType + " is undefined! Reassign " + creepName + " to another role!");
        }
    }
    
    // power creep section...
    for (let powerCreepName in Game.powerCreeps) {
        let powerCreep = Game.powerCreeps[powerCreepName];
        if (powerCreep && powerCreep.ticksToLive) {
            let roleType = powerCreep.memory.role;
            if (roleType) {
                if (screepsObj.powerCreepRoles[roleType] != undefined) {
                    screepsObj.powerCreepRoles[roleType].runFunction(powerCreep);
                } else {
                    console.log("The PowerCreep role, "+roleType+", is undefined! Reassign the PowerCreep, "+powerCreepName+", to another role!");
                }
            } else {
                console.log("WARNING: PowerCreep, "+powerCreepName+", does not have a role assigned in memory!");
            }
        }
    }
    
}