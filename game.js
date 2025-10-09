// Constants and Configuration
const GAME_CONFIG = {
    UPDATE_INTERVAL: 100,
    EVOLUTION_AGE_THRESHOLD: 30,
    DUNGEON_LEVEL_BONUS: 0.05,
    INVASION_BASE_TIMER: 60,
    INVASION_RANDOM_RANGE: 60,
    LOG_MESSAGE_LIMIT: 10
};

const MAJOR_UPGRADES = {
    TYPES: ['Symbiosis Mastery', 'Crystal Enhancement', 'Combat Mastery', 'Toxic Evolution'],
    DESCRIPTIONS: [
        'All synergy bonuses +10%',
        'Crystal monsters +50% production',
        'All monsters +25% attack',
        'Poison abilities enhanced +30%'
    ]
};

// Utility Classes
class ResourceManager {
    constructor(initialResources = { biomass: 10, mana: 5, nutrients: 3 }) {
        this.resources = { ...initialResources };
    }

    canAfford(cost) {
        return Object.keys(cost).every(resource => 
            this.resources[resource] >= cost[resource]
        );
    }

    deduct(cost) {
        if (!this.canAfford(cost)) return false;
        Object.keys(cost).forEach(resource => {
            this.resources[resource] -= cost[resource];
        });
        return true;
    }

    add(resources) {
        Object.keys(resources).forEach(resource => {
            this.resources[resource] = (this.resources[resource] || 0) + resources[resource];
        });
    }

    get(resource) {
        return this.resources[resource] || 0;
    }

    set(resource, amount) {
        this.resources[resource] = amount;
    }

    roundAll() {
        Object.keys(this.resources).forEach(key => {
            this.resources[key] = Math.round(this.resources[key] * 10) / 10;
        });
    }

    getAll() {
        return { ...this.resources };
    }
}

class SpecialAbilitiesManager {
    static processAbility(monster, deltaTime, gameInstance) {
        const monsterType = gameInstance.state.monsterTypes[monster.type];
        if (!monsterType.special) return;

        if (!monster.specialTimer) monster.specialTimer = 0;
        monster.specialTimer += deltaTime;

        const abilities = {
            spawn_minions: () => this.handleSpawnMinions(monster, gameInstance),
            resource_conversion: () => this.handleResourceConversion(monster, gameInstance),
            rage: () => this.handleRage(monster),
            toxic_mastery: () => this.handleToxicMastery(monster, gameInstance),
            crystal_mastery: () => this.handleCrystalMastery(monster, gameInstance),
            apex_mastery: () => this.handleApexMastery(monster)
        };

        const handler = abilities[monsterType.special];
        if (handler) handler();
    }

    static handleSpawnMinions(monster, gameInstance) {
        if (monster.specialTimer >= 120) {
            monster.specialTimer = 0;
            gameInstance.spawnMinion('slime');
            gameInstance.logMessage(`${monster.name} spawned a Basic Slime!`);
        }
    }

    static handleResourceConversion(monster, gameInstance) {
        if (monster.specialTimer >= 30 && gameInstance.state.resourceManager.get('biomass') >= 5) {
            monster.specialTimer = 0;
            gameInstance.state.resourceManager.deduct({ biomass: 5 });
            gameInstance.state.resourceManager.add({ mana: 2, nutrients: 1 });
        }
    }

    static handleRage(monster) {
        const healthPercent = monster.health / monster.maxHealth;
        monster.rageBonus = 1 + (1 - healthPercent);
    }

    static handleToxicMastery(monster, gameInstance) {
        if (monster.specialTimer >= 90) {
            monster.specialTimer = 0;
            gameInstance.spawnMinion('poison_slime');
            gameInstance.logMessage(`${monster.name} spawned a Poison Slime minion!`);
        }
    }

    static handleCrystalMastery(monster, gameInstance) {
        if (monster.specialTimer >= 20 && gameInstance.state.resourceManager.get('biomass') >= 10) {
            monster.specialTimer = 0;
            gameInstance.state.resourceManager.deduct({ biomass: 10 });
            gameInstance.state.resourceManager.add({ mana: 5, nutrients: 3 });
        }
    }

    static handleApexMastery(monster) {
        const healthPercent = monster.health / monster.maxHealth;
        monster.rageBonus = 1 + (1 - healthPercent) * 1.5;
    }
}

class EvolutionManager {
    static checkFusionRequirements(evolutionType, monsters, monsterTypes) {
        const evolutionMonsterType = monsterTypes[evolutionType];
        if (!evolutionMonsterType.fusionRequirements) return { possible: false };

        const [req1, req2] = evolutionMonsterType.fusionRequirements;
        const readyMonster1 = monsters.find(m => m.type === req1 && m.evolutionPossible);
        const readyMonster2 = monsters.find(m => m.type === req2 && m.evolutionPossible);

        return {
            possible: readyMonster1 && readyMonster2,
            monster1: readyMonster1,
            monster2: readyMonster2,
            requirementsText: `Need: ${monsterTypes[req1].name} + ${monsterTypes[req2].name}`
        };
    }

    static getSpecialAbilityText(special) {
        const abilities = {
            'poison_aura': ' • Poison Aura: Damages heroes over time',
            'spawn_minions': ' • Spawns free Basic Slimes every 2 minutes',
            'crystal_armor': ' • Crystal Armor: Reduces incoming damage by 30%',
            'resource_conversion': ' • Converts 5 Biomass → 2 Mana + 1 Nutrients every 30s',
            'leadership': ' • Leadership: Boosts nearby monsters',
            'rage': ' • Rage: Attack increases when damaged',
            'toxic_mastery': ' • Toxic Mastery: Ultimate poison abilities + spawning',
            'crystal_mastery': ' • Crystal Mastery: Superior defense + resource conversion',
            'apex_mastery': ' • Apex Mastery: Combat supremacy + leadership'
        };
        return abilities[special] || '';
    }
}

// Data Templates
class DataTemplates {
    static getMonsterTypes() {
        return {
            slime: {
                name: 'Basic Slime',
                health: 20,
                attack: 3,
                biomassRate: 0.5,
                cost: { biomass: 5 },
                evolvesTo: ['poison_slime', 'crystal_slime', 'warrior_slime'],
                habitat: 'caves'
            },
            poison_slime: {
                name: 'Poison Slime',
                health: 35,
                attack: 5,
                biomassRate: 0.3,
                manaRate: 0.2,
                cost: { biomass: 15 },
                evolvesFrom: 'slime',
                evolvesTo: ['toxic_horror', 'venomous_broodmother'],
                habitat: 'swamps',
                synergy: ['crystal_slime']
            },
            crystal_slime: {
                name: 'Crystal Slime',
                health: 50,
                attack: 4,
                nutrientRate: 0.1,
                cost: { biomass: 25 },
                evolvesFrom: 'slime',
                evolvesTo: ['gem_guardian', 'crystal_hive'],
                habitat: 'crystalCaves',
                synergy: ['poison_slime']
            },
            warrior_slime: {
                name: 'Warrior Slime',
                health: 60,
                attack: 8,
                biomassRate: 0.2,
                cost: { biomass: 20, mana: 5 },
                evolvesFrom: 'slime',
                evolvesTo: ['slime_champion', 'berserker_slime'],
                habitat: 'barracks',
                synergy: ['warrior_slime']
            },
            toxic_horror: {
                name: 'Toxic Horror',
                health: 80,
                attack: 12,
                manaRate: 0.4,
                biomassRate: 0.1,
                cost: { biomass: 30, mana: 15 },
                evolvesFrom: 'poison_slime',
                evolvesTo: ['toxic_overlord'],
                habitat: 'swamps',
                special: 'poison_aura'
            },
            venomous_broodmother: {
                name: 'Venomous Broodmother',
                health: 70,
                attack: 8,
                manaRate: 0.3,
                biomassRate: 0.6,
                cost: { biomass: 35, mana: 20 },
                evolvesFrom: 'poison_slime',
                evolvesTo: ['toxic_overlord'],
                habitat: 'nursery',
                special: 'spawn_minions'
            },
            gem_guardian: {
                name: 'Gem Guardian',
                health: 120,
                attack: 10,
                nutrientRate: 0.2,
                cost: { biomass: 40, nutrients: 15 },
                evolvesFrom: 'crystal_slime',
                evolvesTo: ['crystal_sovereign'],
                habitat: 'crystalCaves',
                special: 'crystal_armor'
            },
            crystal_hive: {
                name: 'Crystal Hive',
                health: 90,
                attack: 6,
                nutrientRate: 0.3,
                manaRate: 0.1,
                cost: { biomass: 45, nutrients: 20 },
                evolvesFrom: 'crystal_slime',
                evolvesTo: ['crystal_sovereign'],
                habitat: 'crystalCaves',
                special: 'resource_conversion'
            },
            slime_champion: {
                name: 'Slime Champion',
                health: 100,
                attack: 15,
                biomassRate: 0.3,
                cost: { biomass: 35, mana: 10, nutrients: 5 },
                evolvesFrom: 'warrior_slime',
                evolvesTo: ['apex_warrior'],
                habitat: 'barracks',
                special: 'leadership'
            },
            berserker_slime: {
                name: 'Berserker Slime',
                health: 80,
                attack: 20,
                biomassRate: 0.1,
                cost: { biomass: 30, mana: 15 },
                evolvesFrom: 'warrior_slime',
                evolvesTo: ['apex_warrior'],
                habitat: 'battlegrounds',
                special: 'rage'
            },
            // Fusion Slimes
            toxic_overlord: {
                name: 'Toxic Overlord',
                health: 150,
                attack: 25,
                manaRate: 0.6,
                biomassRate: 0.4,
                cost: { biomass: 80, mana: 50, nutrients: 20 },
                fusionRequirements: ['toxic_horror', 'venomous_broodmother'],
                habitat: 'swamps',
                special: 'toxic_mastery'
            },
            crystal_sovereign: {
                name: 'Crystal Sovereign',
                health: 180,
                attack: 20,
                nutrientRate: 0.5,
                manaRate: 0.3,
                cost: { biomass: 100, mana: 40, nutrients: 30 },
                fusionRequirements: ['gem_guardian', 'crystal_hive'],
                habitat: 'crystalCaves',
                special: 'crystal_mastery'
            },
            apex_warrior: {
                name: 'Apex Warrior',
                health: 200,
                attack: 40,
                biomassRate: 0.5,
                cost: { biomass: 120, mana: 60, nutrients: 25 },
                fusionRequirements: ['slime_champion', 'berserker_slime'],
                habitat: 'battlegrounds',
                special: 'apex_mastery'
            }
        };
    }

    static getHeroTypes() {
        return [
            {
                name: 'Novice Adventurer',
                health: 30,
                attack: 8,
                loot: { biomass: 3, mana: 1 },
                weight: 40
            },
            {
                name: 'Experienced Fighter',
                health: 60,
                attack: 12,
                loot: { biomass: 8, mana: 3, nutrients: 1 },
                weight: 30
            },
            {
                name: 'Mage Hunter',
                health: 45,
                attack: 10,
                loot: { biomass: 5, mana: 8, nutrients: 2 },
                special: 'mana_drain',
                weight: 20
            },
            {
                name: 'Elite Paladin',
                health: 100,
                attack: 15,
                loot: { biomass: 15, mana: 10, nutrients: 5 },
                special: 'holy_aura',
                weight: 8
            },
            {
                name: 'Dungeon Lord',
                health: 150,
                attack: 25,
                loot: { biomass: 25, mana: 20, nutrients: 15 },
                special: 'boss',
                weight: 2
            }
        ];
    }

    static getHabitats() {
        return {
            caves: { name: 'Dark Caves', unlocked: true, capacity: 10, bonus: { biomass: 1.1 } },
            swamps: { name: 'Toxic Swamps', unlocked: false, capacity: 8, bonus: { mana: 1.2 }, cost: { biomass: 50, mana: 20 } },
            crystalCaves: { name: 'Crystal Caverns', unlocked: false, capacity: 6, bonus: { nutrients: 1.3 }, cost: { biomass: 60, nutrients: 15 } },
            barracks: { name: 'War Barracks', unlocked: false, capacity: 12, bonus: { attack: 1.2 }, cost: { biomass: 80, mana: 15, nutrients: 10 } },
            nursery: { name: 'Breeding Pools', unlocked: false, capacity: 5, bonus: { biomass: 1.5 }, cost: { biomass: 40, mana: 25 } },
            battlegrounds: { name: 'Battle Arena', unlocked: false, capacity: 8, bonus: { attack: 1.4 }, cost: { biomass: 70, mana: 30, nutrients: 10 } }
        };
    }
}

// Game State
class GameState {
    constructor() {
        this.resourceManager = new ResourceManager();
        
        this.dungeon = {
            health: 100,
            maxHealth: 100,
            level: 1
        };
        
        this.monsters = [
            {
                id: 1,
                type: 'slime',
                name: 'Basic Slime',
                health: 20,
                maxHealth: 20,
                attack: 3,
                biomassRate: 0.5,
                manaRate: 0,
                nutrientRate: 0,
                age: 0,
                evolutionPossible: false
            }
        ];
        
        this.heroes = [];
        this.invasionTimer = GAME_CONFIG.INVASION_BASE_TIMER;
        this.gameTime = 0;
        
        this.monsterTypes = DataTemplates.getMonsterTypes();
        this.heroTypes = DataTemplates.getHeroTypes();
        this.habitats = DataTemplates.getHabitats();
        
        // Dynamic pricing system
        this.slimesPurchased = 0;
        this.baseSlimeCost = { biomass: 5 }; // Store original cost
        
        // Upgrade bonuses
        this.crystalBonus = 1.0;
        this.combatBonus = 1.0;
        this.toxicBonus = 1.0;
        this.synergyBonus = 0.1;
    }

    getSlimeCost() {
        // Increase cost by 10% for each slime purchased (multiplicative)
        const multiplier = Math.pow(1.1, this.slimesPurchased);
        return {
            biomass: Math.ceil(this.baseSlimeCost.biomass * multiplier)
        };
    }

    incrementSlimePurchases() {
        this.slimesPurchased++;
        // Update the monster type cost for UI display
        this.monsterTypes.slime.cost = this.getSlimeCost();
    }
}
        

// Game Engine
class DungeonSymbiosis {
    constructor() {
        this.state = new GameState();
        this.lastUpdate = Date.now();
        this.updateInterval = GAME_CONFIG.UPDATE_INTERVAL;
        
        this.initializeUI();
        this.startGameLoop();
    }
    
    initializeUI() {
        document.getElementById('spawn-slime').addEventListener('click', () => {
            this.spawnMonster('slime');
        });
        
        document.getElementById('upgrade-dungeon').addEventListener('click', () => {
            this.upgradeDungeon();
        });
        
        this.updateDisplay();
    }
    
    startGameLoop() {
        setInterval(() => {
            this.update();
        }, this.updateInterval);
    }
    
    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;
        
        this.state.gameTime += deltaTime;
        
        this.updateMonsters(deltaTime);
        this.updateInvasions(deltaTime);
        this.updateDisplay();
    }
    
    updateMonsters(deltaTime) {
        // Calculate global slime bonus (all slimes provide +0.5 biomass/s total)
        const slimeCount = this.state.monsters.filter(monster => 
            monster.type === 'slime' || monster.name.includes('Slime')
        ).length;
        const globalSlimeBonus = slimeCount * 0.5;
        
        // Add global slime biomass bonus
        if (globalSlimeBonus > 0) {
            this.state.resourceManager.add({ biomass: globalSlimeBonus * deltaTime });
        }
        
        this.state.monsters.forEach(monster => {
            monster.age += deltaTime;
            
            const monsterType = this.state.monsterTypes[monster.type];
            const synergyBonus = this.calculateSynergyBonus(monster);
            const dungeonBonus = 1 + (this.state.dungeon.level - 1) * GAME_CONFIG.DUNGEON_LEVEL_BONUS;
            
            let specialBonus = 1.0;
            if ((monster.type.includes('crystal') || monster.type.includes('gem')) && this.state.crystalBonus) {
                specialBonus *= this.state.crystalBonus;
            }
            
            // Generate resources
            const resourceRates = {
                biomass: (monster.biomassRate !== undefined ? monster.biomassRate : monsterType.biomassRate) || 0,
                mana: (monster.manaRate !== undefined ? monster.manaRate : monsterType.manaRate) || 0,
                nutrients: (monster.nutrientRate !== undefined ? monster.nutrientRate : monsterType.nutrientRate) || 0
            };
            
            Object.entries(resourceRates).forEach(([resource, rate]) => {
                if (rate > 0) {
                    const finalRate = rate * synergyBonus[resource] * dungeonBonus * specialBonus;
                    this.state.resourceManager.add({ [resource]: finalRate * deltaTime });
                }
            });
            
            SpecialAbilitiesManager.processAbility(monster, deltaTime, this);
            
            if (monster.age > GAME_CONFIG.EVOLUTION_AGE_THRESHOLD && monsterType.evolvesTo && !monster.evolutionPossible) {
                monster.evolutionPossible = true;
            }
        });
        
        this.state.resourceManager.roundAll();
    }
    
    calculateSynergyBonus(monster) {
        const monsterType = this.state.monsterTypes[monster.type];
        let bonus = { biomass: 1.0, mana: 1.0, nutrients: 1.0, attack: 1.0 };
        
        if (monsterType.synergy) {
            const baseMultiplier = this.state.synergyBonus || 0.1;
            
            monsterType.synergy.forEach(synergyType => {
                const nearbyCount = this.state.monsters.filter(m => 
                    m.type === synergyType && m.id !== monster.id
                ).length;
                
                if (nearbyCount > 0) {
                    const synergyMultiplier = 1 + (nearbyCount * baseMultiplier);
                    Object.keys(bonus).forEach(key => {
                        bonus[key] *= synergyMultiplier;
                    });
                }
            });
        }
        
        if (monster.type === 'warrior_slime') {
            const packSize = this.state.monsters.filter(m => m.type === 'warrior_slime').length;
            if (packSize >= 3) {
                bonus.attack *= 1.5;
            }
        }
        
        return bonus;
    }

    spawnMinion(type) {
        const monsterType = this.state.monsterTypes[type];
        const newMonster = {
            id: Date.now() + Math.random(),
            type: type,
            name: monsterType.name + ' (Minion)',
            health: Math.floor(monsterType.health * 0.7),
            maxHealth: Math.floor(monsterType.health * 0.7),
            attack: Math.floor(monsterType.attack * 0.7),
            biomassRate: (monsterType.biomassRate || 0) * 0.5,
            manaRate: (monsterType.manaRate || 0) * 0.5,
            nutrientRate: (monsterType.nutrientRate || 0) * 0.5,
            age: 0,
            evolutionPossible: false,
            isMinion: true
        };
        this.state.monsters.push(newMonster);
    }

    updateInvasions(deltaTime) {
        this.state.invasionTimer -= deltaTime;
        
        if (this.state.invasionTimer <= 0) {
            this.spawnHero();
            this.state.invasionTimer = GAME_CONFIG.INVASION_BASE_TIMER + Math.random() * GAME_CONFIG.INVASION_RANDOM_RANGE;
        }
    }

    spawnMonster(type) {
        const monsterType = this.state.monsterTypes[type];
        if (!monsterType) return false;
        
        // Use dynamic pricing for slimes
        let cost;
        if (type === 'slime') {
            cost = this.state.getSlimeCost();
        } else {
            cost = monsterType.cost;
        }
        
        if (!this.state.resourceManager.canAfford(cost)) return false;
        
        this.state.resourceManager.deduct(cost);
        
        // Increment slime purchases for dynamic pricing
        if (type === 'slime') {
            this.state.incrementSlimePurchases();
        }
        
        const newMonster = {
            id: Date.now(),
            type: type,
            name: monsterType.name,
            health: monsterType.health,
            maxHealth: monsterType.health,
            attack: monsterType.attack,
            biomassRate: monsterType.biomassRate || 0,
            manaRate: monsterType.manaRate || 0,
            nutrientRate: monsterType.nutrientRate || 0,
            age: 0,
            evolutionPossible: false
        };
        
        this.state.monsters.push(newMonster);
        this.logMessage(`Spawned ${newMonster.name}!`);
        return true;
    }
    
    logMessage(message) {
        const log = document.getElementById('invasion-log');
        const p = document.createElement('p');
        p.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        log.appendChild(p);
        
        while (log.children.length > GAME_CONFIG.LOG_MESSAGE_LIMIT) {
            log.removeChild(log.firstChild);
        }
        log.scrollTop = log.scrollHeight;
    }

    spawnHero() {
        const totalWeight = this.state.heroTypes.reduce((sum, hero) => sum + hero.weight, 0);
        let random = Math.random() * totalWeight;
        
        let selectedHero = this.state.heroTypes[0];
        for (const heroType of this.state.heroTypes) {
            random -= heroType.weight;
            if (random <= 0) {
                selectedHero = heroType;
                break;
            }
        }
        
        if (selectedHero.special === 'boss' && this.state.gameTime < 300) {
            selectedHero = this.state.heroTypes[1];
        }
        
        const hero = {
            id: Date.now(),
            name: selectedHero.name,
            health: selectedHero.health,
            maxHealth: selectedHero.health,
            attack: selectedHero.attack,
            loot: { ...selectedHero.loot },
            special: selectedHero.special
        };
        
        this.state.heroes.push(hero);
        this.logMessage(`${hero.name} has invaded your dungeon!`);
        
        setTimeout(() => this.resolveCombat(hero), 1000);
    }
    
    resolveCombat(hero) {
        if (this.state.monsters.length === 0) {
            let damage = hero.attack;
            
            if (hero.special === 'mana_drain') {
                const manaDrained = Math.min(this.state.resourceManager.get('mana'), 10);
                this.state.resourceManager.deduct({ mana: manaDrained });
                this.logMessage(`${hero.name} drains ${manaDrained} mana!`);
            }
            
            this.state.dungeon.health -= damage;
            this.logMessage(`${hero.name} damages the dungeon core for ${damage} damage!`);
            
            if (this.state.dungeon.health <= 0) {
                this.gameOver();
                return;
            }
            
            const stolen = {};
            Object.keys(hero.loot).forEach(resource => {
                stolen[resource] = Math.min(hero.loot[resource], this.state.resourceManager.get(resource));
            });
            this.state.resourceManager.deduct(stolen);
            this.logMessage(`${hero.name} steals resources and leaves...`);
        } else {
            this.handleMonsterCombat(hero);
        }
        
        this.state.heroes = this.state.heroes.filter(h => h.id !== hero.id);
    }

    handleMonsterCombat(hero) {
        let totalMonsterAttack = 0;
        
        this.state.monsters.forEach(monster => {
            const synergyBonus = this.calculateSynergyBonus(monster);
            let attack = monster.attack * synergyBonus.attack;
            
            if (this.state.combatBonus) {
                attack *= this.state.combatBonus;
            }
            
            if (monster.rageBonus) {
                attack *= monster.rageBonus;
            }
            
            totalMonsterAttack += attack;
            
            const monsterType = this.state.monsterTypes[monster.type];
            if (monsterType.special === 'poison_aura') {
                let poisonDamage = 2;
                if (this.state.toxicBonus) {
                    poisonDamage *= this.state.toxicBonus;
                }
                hero.health -= poisonDamage;
            }
        });
        
        if (hero.special === 'holy_aura') {
            const poisonMonsters = this.state.monsters.filter(m => m.type.includes('poison')).length;
            totalMonsterAttack *= Math.max(0.5, 1 - (poisonMonsters * 0.1));
        }
        
        if (totalMonsterAttack >= hero.health) {
            this.logMessage(`Your monsters defeat ${hero.name}! Gained resources.`);
            this.state.resourceManager.add(hero.loot);
            
            if (hero.special === 'boss') {
                this.state.resourceManager.add({ biomass: 10, mana: 10, nutrients: 10 });
                this.logMessage('Bonus resources for defeating a boss!');
            }
        } else {
            this.damageMonsters(hero);
        }
    }

    damageMonsters(hero) {
        let remainingDamage = hero.attack;
        const sortedMonsters = [...this.state.monsters].sort((a, b) => a.health - b.health);
        
        for (const monster of sortedMonsters) {
            if (remainingDamage <= 0) break;
            
            const monsterType = this.state.monsterTypes[monster.type];
            let damage = Math.min(remainingDamage, monster.health);
            
            if (monsterType.special === 'crystal_armor') {
                damage = Math.floor(damage * 0.7);
            }
            
            monster.health -= damage;
            remainingDamage -= damage;
            
            if (monster.health <= 0) {
                this.state.monsters = this.state.monsters.filter(m => m.id !== monster.id);
                this.logMessage(`${hero.name} defeats ${monster.name}!`);
            }
        }
        
        this.logMessage(`${hero.name} damages your monsters and escapes!`);
    }
    
    upgradeDungeon() {
        const cost = this.getDungeonUpgradeCost();
        
        if (!this.state.resourceManager.canAfford(cost)) return;
        
        this.state.resourceManager.deduct(cost);
        this.state.dungeon.level++;
        this.state.dungeon.maxHealth += 50;
        this.state.dungeon.health = this.state.dungeon.maxHealth;
        
        const benefits = this.getDungeonUpgradeBenefits();
        let upgradeMessage = `Dungeon upgraded to level ${this.state.dungeon.level}! Max health: ${this.state.dungeon.maxHealth}. Resource generation: +${benefits.currentResourceBonus}% (total).`;
        
        if (this.state.dungeon.level % 5 === 0) {
            const specialBonus = this.applyMajorUpgrade(this.state.dungeon.level);
            upgradeMessage += ` MAJOR UPGRADE: ${specialBonus}`;
        }
        
        this.logMessage(upgradeMessage);
    }

    applyMajorUpgrade(level) {
        const upgradeType = Math.floor(level / 5) % 4;
        const upgrades = [
            () => {
                this.state.synergyBonus += 0.1;
                return "Symbiosis Mastery! All synergy bonuses increased by +10%!";
            },
            () => {
                this.state.crystalBonus += 0.5;
                this.state.monsters.forEach(monster => {
                    if (monster.type.includes('crystal') || monster.type.includes('gem')) {
                        monster.crystalBoosted = true;
                    }
                });
                return "Crystal Enhancement! All crystal-type monsters gain +50% production permanently!";
            },
            () => {
                this.state.combatBonus += 0.25;
                return "Combat Mastery! All monsters gain +25% attack permanently!";
            },
            () => {
                this.state.toxicBonus += 0.3;
                return "Toxic Evolution! All poison-type monsters gain enhanced abilities!";
            }
        ];
        
        return upgrades[upgradeType]();
    }

    getDungeonUpgradeCost() {
        const baseCost = 50;
        const scaledCost = Math.floor(baseCost * Math.pow(this.state.dungeon.level, 3));
        return { nutrients: scaledCost };
    }

    getDungeonUpgradeBenefits() {
        const currentLevel = this.state.dungeon.level;
        return {
            healthIncrease: 50,
            currentResourceBonus: Math.round((currentLevel - 1) * 5),
            nextResourceBonus: Math.round(currentLevel * 5)
        };
    }

    evolveMonster(monsterId, newType) {
        const monster = this.state.monsters.find(m => m.id === monsterId);
        const newMonsterType = this.state.monsterTypes[newType];
        
        if (!monster || !newMonsterType || !this.state.resourceManager.canAfford(newMonsterType.cost)) return;
        
        this.state.resourceManager.deduct(newMonsterType.cost);
        
        Object.assign(monster, {
            type: newType,
            name: newMonsterType.name,
            health: newMonsterType.health,
            maxHealth: newMonsterType.health,
            attack: newMonsterType.attack,
            biomassRate: newMonsterType.biomassRate || 0,
            manaRate: newMonsterType.manaRate || 0,
            nutrientRate: newMonsterType.nutrientRate || 0,
            evolutionPossible: false,
            age: 0
        });
        
        this.logMessage(`Monster evolved into ${monster.name}!`);
    }

    fusionEvolve(monster1Id, monster2Id, newType) {
        const monster1 = this.state.monsters.find(m => m.id === monster1Id);
        const monster2 = this.state.monsters.find(m => m.id === monster2Id);
        const newMonsterType = this.state.monsterTypes[newType];
        
        if (!monster1 || !monster2 || !newMonsterType || !this.state.resourceManager.canAfford(newMonsterType.cost)) return;
        
        this.state.resourceManager.deduct(newMonsterType.cost);
        
        Object.assign(monster1, {
            type: newType,
            name: newMonsterType.name,
            health: newMonsterType.health,
            maxHealth: newMonsterType.health,
            attack: newMonsterType.attack,
            biomassRate: newMonsterType.biomassRate || 0,
            manaRate: newMonsterType.manaRate || 0,
            nutrientRate: newMonsterType.nutrientRate || 0,
            evolutionPossible: false,
            age: 0
        });
        
        this.state.monsters = this.state.monsters.filter(m => m.id !== monster2Id);
        this.logMessage(`Fusion successful! ${monster1.name} emerged from the fusion!`);
    }

    gameOver() {
        alert('Game Over! Your dungeon core has been destroyed!');
        this.state = new GameState();
        this.logMessage('Dungeon core destroyed! Starting anew...');
    }
    
    updateDisplay() {
        const dungeonBonus = Math.round((this.state.dungeon.level - 1) * 5);
        const bonusText = dungeonBonus > 0 ? ` (+${dungeonBonus}%)` : '';
        
        const resources = this.state.resourceManager.getAll();
        document.getElementById('biomass').textContent = Math.floor(resources.biomass);
        document.getElementById('mana').textContent = Math.floor(resources.mana);
        document.getElementById('nutrients').textContent = Math.floor(resources.nutrients);
        
        document.getElementById('dungeon-health').textContent = 
            `${Math.max(0, Math.floor(this.state.dungeon.health))}/${this.state.dungeon.maxHealth} (Level ${this.state.dungeon.level}${bonusText})`;
        document.getElementById('monster-count').textContent = this.state.monsters.length;
        document.getElementById('invasion-timer').textContent = Math.ceil(this.state.invasionTimer);
        
        this.updateMonsterList();
        this.updateButtonStates();
        this.updateHabitatList();
        this.updateEvolutionOptions();
    }
    
    updateMonsterList() {
        const monsterList = document.getElementById('monster-list');
        
        if (this.state.monsters.length === 0) {
            const emptyMessage = '<p style="color: #888; text-align: center; margin: 20px;">No monsters in your dungeon. Spawn some to begin!</p>';
            if (monsterList.innerHTML !== emptyMessage) {
                monsterList.innerHTML = emptyMessage;
            }
            return;
        }
        
        // Group monsters by type
        const monsterGroups = {};
        this.state.monsters.forEach(monster => {
            if (!monsterGroups[monster.type]) {
                monsterGroups[monster.type] = {
                    monsters: [],
                    count: 0,
                    evolutionReady: 0
                };
            }
            monsterGroups[monster.type].monsters.push(monster);
            monsterGroups[monster.type].count++;
            if (monster.evolutionPossible) {
                monsterGroups[monster.type].evolutionReady++;
            }
        });
        
        // Create new monster display data
        const newMonsterData = [];
        Object.keys(monsterGroups).forEach(monsterType => {
            const group = monsterGroups[monsterType];
            const sampleMonster = group.monsters[0];
            const monsterTypeData = this.state.monsterTypes[monsterType];
            const avgAge = group.monsters.reduce((sum, m) => sum + m.age, 0) / group.count;
            
            newMonsterData.push({
                type: monsterType,
                name: sampleMonster.name,
                count: group.count,
                health: sampleMonster.health,
                maxHealth: sampleMonster.maxHealth,
                attack: sampleMonster.attack,
                avgAge: Math.floor(avgAge),
                evolutionReady: group.evolutionReady,
                biomassRate: monsterTypeData.biomassRate ? (monsterTypeData.biomassRate * group.count).toFixed(1) : null,
                manaRate: monsterTypeData.manaRate ? (monsterTypeData.manaRate * group.count).toFixed(1) : null,
                nutrientRate: monsterTypeData.nutrientRate ? (monsterTypeData.nutrientRate * group.count).toFixed(1) : null
            });
        });
        
        // Only update if the content has actually changed
        const currentData = JSON.stringify(newMonsterData);
        if (this.lastMonsterData === currentData) {
            return; // No changes needed
        }
        this.lastMonsterData = currentData;
        
        // Rebuild the monster list
        monsterList.innerHTML = '';
        
        newMonsterData.forEach(data => {
            const monsterDiv = document.createElement('div');
            monsterDiv.className = 'monster';
            
            let productionText = '';
            if (data.biomassRate) productionText += `+${data.biomassRate}/s Biomass`;
            if (data.manaRate) productionText += ` +${data.manaRate}/s Mana`;
            if (data.nutrientRate) productionText += ` +${data.nutrientRate}/s Nutrients`;
            
            monsterDiv.innerHTML = `
                <div class="monster-info">
                    <div class="monster-name">${data.name} x${data.count}</div>
                    <div class="monster-stats">
                        HP: ${data.health}/${data.maxHealth} | 
                        ATK: ${data.attack} | 
                        Avg Age: ${data.avgAge}s
                        ${data.evolutionReady > 0 ? ` | <span style="color: #4caf50;">${data.evolutionReady} Evolution Ready!</span>` : ''}
                    </div>
                    <div class="monster-production">
                        ${productionText}
                    </div>
                </div>
            `;
            
            monsterList.appendChild(monsterDiv);
        });
    }
    
    updateButtonStates() {
        const spawnSlimeBtn = document.getElementById('spawn-slime');
        const slimeCost = this.state.getSlimeCost(); // Use dynamic cost
        spawnSlimeBtn.disabled = !this.state.resourceManager.canAfford(slimeCost);
        
        // Update button text to show current cost
        const costText = `${slimeCost.biomass} Biomass`;
        const purchasedText = this.state.slimesPurchased > 0 ? ` (${this.state.slimesPurchased} purchased)` : '';
        spawnSlimeBtn.textContent = `Spawn Basic Slime (${costText})${purchasedText}`;
        
        // Add tooltip showing pricing information
        if (this.state.slimesPurchased > 0) {
            const nextCost = Math.ceil(this.state.baseSlimeCost.biomass * Math.pow(1.1, this.state.slimesPurchased + 1));
            spawnSlimeBtn.title = `Current: ${slimeCost.biomass} Biomass | Next: ${nextCost} Biomass (×1.1 each purchase)`;
        } else {
            spawnSlimeBtn.title = `Base cost: ${this.state.baseSlimeCost.biomass} Biomass (increases by ×1.1 each purchase)`;
        }
        
        const upgradeDungeonBtn = document.getElementById('upgrade-dungeon');
        const upgradeCost = this.getDungeonUpgradeCost();
        const benefits = this.getDungeonUpgradeBenefits();
        upgradeDungeonBtn.disabled = !this.state.resourceManager.canAfford(upgradeCost);
        
        const upgradeCostText = upgradeCost.nutrients;
        const nextBonusText = benefits.nextResourceBonus;
        const nextLevel = this.state.dungeon.level + 1;
        
        let buttonText = `Upgrade Dungeon (${upgradeCostText} Nutrients) - Level ${nextLevel}: +50 HP, +${nextBonusText}% Resources`;
        
        if (nextLevel % 5 === 0) {
            const upgradeType = Math.floor(nextLevel / 5) % 4;
            buttonText += ` + MAJOR: ${MAJOR_UPGRADES.TYPES[upgradeType]}!`;
        } else {
            const levelsToMajor = 5 - (nextLevel % 5);
            buttonText += ` (${levelsToMajor} to major upgrade)`;
        }
        
        upgradeDungeonBtn.textContent = buttonText;
        
        const upgradeType = Math.floor(nextLevel / 5) % 4;
        let tooltipText = `Upgrade to Level ${nextLevel}\n• +50 Max Health\n• +5% Resource Generation\n• Cost: ${upgradeCostText} Nutrients`;
        
        if (nextLevel % 5 === 0) {
            tooltipText += `\n\nMAJOR UPGRADE:\n• ${MAJOR_UPGRADES.DESCRIPTIONS[upgradeType]}`;
        }
        
        upgradeDungeonBtn.title = tooltipText;
    }
    
    updateHabitatList() {
        const habitatList = document.getElementById('habitat-list');
        
        // Create habitat data for comparison
        const newHabitatData = [];
        Object.keys(this.state.habitats).forEach(habitatKey => {
            const habitat = this.state.habitats[habitatKey];
            let bonusText = '';
            Object.keys(habitat.bonus).forEach(bonus => {
                const value = habitat.bonus[bonus];
                bonusText += `${bonus}: +${Math.round((value - 1) * 100)}% `;
            });
            
            newHabitatData.push({
                key: habitatKey,
                name: habitat.name,
                unlocked: habitat.unlocked,
                capacity: habitat.capacity,
                bonusText,
                canAfford: habitat.cost ? this.state.resourceManager.canAfford(habitat.cost) : true,
                cost: habitat.cost ? Object.keys(habitat.cost).map(resource => 
                    `${habitat.cost[resource]} ${resource}`
                ).join(', ') : ''
            });
        });
        
        // Only update if the content has actually changed
        const currentData = JSON.stringify(newHabitatData);
        if (this.lastHabitatData === currentData) {
            return; // No changes needed
        }
        this.lastHabitatData = currentData;
        
        // Rebuild habitat list
        habitatList.innerHTML = '';
        
        newHabitatData.forEach(data => {
            const habitatDiv = document.createElement('div');
            habitatDiv.className = `habitat ${data.unlocked ? 'unlocked' : 'locked'}`;
            
            habitatDiv.innerHTML = `
                <div class="habitat-name">${data.name}</div>
                <div class="habitat-info">
                    Capacity: ${data.capacity} monsters<br>
                    Bonus: ${data.bonusText}
                </div>
                ${!data.unlocked ? `
                    <div class="habitat-cost">
                        Cost: ${data.cost}
                    </div>
                    <button class="habitat-unlock-btn" 
                            onclick="game.unlockHabitat('${data.key}')"
                            ${data.canAfford ? '' : 'disabled'}>
                        Unlock Habitat
                    </button>
                ` : `
                    <div class="habitat-info" style="color: #4caf50;">
                        ✓ Unlocked and operational
                    </div>
                `}
            `;
            
            habitatList.appendChild(habitatDiv);
        });
    }
    
    unlockHabitat(habitatKey) {
        const habitat = this.state.habitats[habitatKey];
        
        if (!habitat || habitat.unlocked || !this.state.resourceManager.canAfford(habitat.cost)) return;
        
        this.state.resourceManager.deduct(habitat.cost);
        habitat.unlocked = true;
        
        this.logMessage(`Unlocked ${habitat.name}!`);
    }
    
    updateEvolutionOptions() {
        const evolutionOptions = document.getElementById('evolution-options');
        
        // Group monsters by type and count evolution ready ones
        const monsterGroups = {};
        this.state.monsters.forEach(monster => {
            if (!monsterGroups[monster.type]) {
                monsterGroups[monster.type] = {
                    total: 0,
                    evolutionReady: 0,
                    monsters: []
                };
            }
            monsterGroups[monster.type].total++;
            monsterGroups[monster.type].monsters.push(monster);
            if (monster.evolutionPossible) {
                monsterGroups[monster.type].evolutionReady++;
            }
        });
        
        // Create grouped evolution data by monster type
        const newEvolutionData = {};
        
        // Collect evolution options grouped by monster type
        Object.keys(monsterGroups).forEach(monsterType => {
            const group = monsterGroups[monsterType];
            const monsterTypeData = this.state.monsterTypes[monsterType];
            
            if (monsterTypeData.evolvesTo && monsterTypeData.evolvesTo.length > 0) {
                newEvolutionData[monsterType] = {
                    groupInfo: {
                        name: group.monsters[0].name,
                        total: group.total,
                        evolutionReady: group.evolutionReady
                    },
                    evolutions: []
                };
                
                monsterTypeData.evolvesTo.forEach(evolutionType => {
                    const evolutionMonsterType = this.state.monsterTypes[evolutionType];
                    const canAfford = this.state.resourceManager.canAfford(evolutionMonsterType.cost);
                    const hasEvolvableMonsters = group.evolutionReady > 0;
                    
                    // Check if this is a fusion evolution
                    let isFusion = false;
                    let hasFusionRequirements = false;
                    let fusionRequirementsText = '';
                    
                    if (evolutionMonsterType.fusionRequirements) {
                        isFusion = true;
                        const fusion = EvolutionManager.checkFusionRequirements(
                            evolutionType, 
                            this.state.monsters, 
                            this.state.monsterTypes
                        );
                        hasFusionRequirements = fusion.possible;
                        fusionRequirementsText = fusion.requirementsText;
                    }
                    
                    // Determine the state of the evolution option
                    let stateClass = '';
                    let stateText = '';
                    
                    if (isFusion) {
                        if (!hasFusionRequirements && !canAfford) {
                            stateClass = 'disabled';
                            stateText = ' (Need both slimes & resources)';
                        } else if (!hasFusionRequirements) {
                            stateClass = 'disabled';
                            stateText = ' (Need both slimes ready)';
                        } else if (!canAfford) {
                            stateClass = 'disabled';
                            stateText = ' (Need resources)';
                        } else {
                            stateText = ' (Ready to fuse!)';
                        }
                    } else {
                        if (!hasEvolvableMonsters && !canAfford) {
                            stateClass = 'disabled';
                            stateText = ' (Need age & resources)';
                        } else if (!hasEvolvableMonsters) {
                            stateClass = 'disabled';
                            stateText = ' (Need 30+ age)';
                        } else if (!canAfford) {
                            stateClass = 'disabled';
                            stateText = ' (Need resources)';
                        } else {
                            stateText = ` (${group.evolutionReady} ready)`;
                        }
                    }
                    
                    const costText = Object.keys(evolutionMonsterType.cost)
                        .map(resource => `${evolutionMonsterType.cost[resource]} ${resource}`)
                        .join(', ');
                    
                    // Create benefits text
                    let benefitsText = [];
                    if (evolutionMonsterType.biomassRate) benefitsText.push(`${evolutionMonsterType.biomassRate}/s Biomass`);
                    if (evolutionMonsterType.manaRate) benefitsText.push(`${evolutionMonsterType.manaRate}/s Mana`);
                    if (evolutionMonsterType.nutrientRate) benefitsText.push(`${evolutionMonsterType.nutrientRate}/s Nutrients`);
                    
                    let specialText = '';
                    if (evolutionMonsterType.special) {
                        specialText = EvolutionManager.getSpecialAbilityText(evolutionMonsterType.special);
                    }
                    
                    let benefitsDisplay = '';
                    if (benefitsText.length > 0) {
                        benefitsDisplay = `Produces: ${benefitsText.join(', ')}`;
                    }
                    if (specialText) {
                        benefitsDisplay += (benefitsDisplay ? '\n' : '') + specialText;
                    }
                    if (fusionRequirementsText) {
                        benefitsDisplay = fusionRequirementsText + '\n' + benefitsDisplay;
                    }
                    
                    newEvolutionData[monsterType].evolutions.push({
                        id: `${monsterType}_to_${evolutionType}`,
                        evolutionType,
                        title: `→ ${evolutionMonsterType.name}${stateText}`,
                        cost: `Cost: ${costText}`,
                        benefits: benefitsDisplay,
                        stats: `HP: ${evolutionMonsterType.health} | ATK: ${evolutionMonsterType.attack}`,
                        stateClass,
                        canAfford,
                        hasEvolvableMonsters: isFusion ? hasFusionRequirements : hasEvolvableMonsters,
                        isFusion,
                        fusionRequirements: evolutionMonsterType.fusionRequirements
                    });
                });
            }
        });
        
        // Only update if the content has actually changed
        const currentData = JSON.stringify(newEvolutionData);
        if (this.lastEvolutionData === currentData) {
            return; // No changes needed
        }
        this.lastEvolutionData = currentData;
        
        // Clear and rebuild the evolution options
        evolutionOptions.innerHTML = '';
        
        if (Object.keys(newEvolutionData).length === 0) {
            evolutionOptions.innerHTML = '<p style="color: #888; text-align: center;">No monster types available for evolution yet.</p>';
            return;
        }
        
        // Create grouped evolution display with Basic Slime first
        const sortedMonsterTypes = Object.keys(newEvolutionData).sort((a, b) => {
            // Put 'slime' (Basic Slime) first, then alphabetical order
            if (a === 'slime') return -1;
            if (b === 'slime') return 1;
            return a.localeCompare(b);
        });
        
        sortedMonsterTypes.forEach(monsterType => {
            const groupData = newEvolutionData[monsterType];
            
            // Create group header
            const groupDiv = document.createElement('div');
            groupDiv.className = 'evolution-group';
            
            const headerDiv = document.createElement('div');
            headerDiv.className = 'evolution-group-header';
            headerDiv.innerHTML = `
                <div class="evolution-group-title">${groupData.groupInfo.name} Evolution Paths</div>
                <div class="evolution-group-info">
                    Available: ${groupData.groupInfo.total} total, 
                    <span style="color: ${groupData.groupInfo.evolutionReady > 0 ? '#4caf50' : '#888'};">
                        ${groupData.groupInfo.evolutionReady} ready for evolution
                    </span>
                </div>
            `;
            
            groupDiv.appendChild(headerDiv);
            
            // Create evolution options container
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'evolution-options-container';
            
            groupData.evolutions.forEach(evolution => {
                const optionDiv = document.createElement('div');
                optionDiv.className = `evolution-option ${evolution.stateClass}`;
                optionDiv.id = evolution.id;
                
                optionDiv.innerHTML = `
                    <div class="evolution-title">${evolution.title}</div>
                    <div class="evolution-stats">${evolution.stats}</div>
                    <div class="evolution-benefits">${evolution.benefits}</div>
                    <div class="evolution-cost">${evolution.cost}</div>
                `;
                
                if (evolution.canAfford && evolution.hasEvolvableMonsters) {
                    optionDiv.style.cursor = 'pointer';
                    
                    // Use a single click handler with immediate execution
                    optionDiv.addEventListener('click', () => {
                        this.handleEvolutionClick(monsterType, evolution.evolutionType, evolution.isFusion, evolution.fusionRequirements);
                    }, { once: true });
                } else {
                    optionDiv.style.cursor = 'not-allowed';
                }
                
                optionsContainer.appendChild(optionDiv);
            });
            
            groupDiv.appendChild(optionsContainer);
            evolutionOptions.appendChild(groupDiv);
        });
    }
    
    handleEvolutionClick(monsterType, evolutionType, isFusion = false, fusionRequirements = null) {
        const evolutionMonsterType = this.state.monsterTypes[evolutionType];
        if (!this.state.resourceManager.canAfford(evolutionMonsterType.cost)) {
            console.log('Cannot afford evolution');
            return;
        }
        
        if (isFusion && fusionRequirements) {
            const fusion = EvolutionManager.checkFusionRequirements(
                evolutionType, 
                this.state.monsters, 
                this.state.monsterTypes
            );
            
            if (!fusion.possible) {
                console.log('Missing required monsters for fusion');
                return;
            }
            
            this.fusionEvolve(fusion.monster1.id, fusion.monster2.id, evolutionType);
        } else {
            const readyMonster = this.state.monsters.find(m => 
                m.type === monsterType && m.evolutionPossible
            );
            
            if (!readyMonster) {
                console.log('No ready monster found');
                return;
            }
            
            this.evolveMonster(readyMonster.id, evolutionType);
        }
        
        this.updateEvolutionOptions();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new DungeonSymbiosis();
    window.game = game; // For debugging
});