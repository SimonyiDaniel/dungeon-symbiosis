// Game State
class GameState {
    constructor() {
        this.resources = {
            biomass: 10,
            mana: 5,
            nutrients: 3
        };
        
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
        this.invasionTimer = 60;
        this.gameTime = 0;
        
        this.monsterTypes = {
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
                synergy: ['crystal_slime'] // Gets bonus near crystal slimes
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
                synergy: ['poison_slime'] // Gets bonus near poison slimes
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
                synergy: ['warrior_slime'] // Pack hunting bonus
            },
            toxic_horror: {
                name: 'Toxic Horror',
                health: 80,
                attack: 12,
                manaRate: 0.4,
                biomassRate: 0.1,
                cost: { biomass: 30, mana: 15 },
                evolvesFrom: 'poison_slime',
                habitat: 'swamps',
                special: 'poison_aura' // Damages all heroes over time
            },
            venomous_broodmother: {
                name: 'Venomous Broodmother',
                health: 70,
                attack: 8,
                manaRate: 0.3,
                biomassRate: 0.6, // Produces extra biomass by spawning mini-slimes
                cost: { biomass: 35, mana: 20 },
                evolvesFrom: 'poison_slime',
                habitat: 'nursery',
                special: 'spawn_minions' // Occasionally spawns free basic slimes
            },
            gem_guardian: {
                name: 'Gem Guardian',
                health: 120,
                attack: 10,
                nutrientRate: 0.2,
                cost: { biomass: 40, nutrients: 15 },
                evolvesFrom: 'crystal_slime',
                habitat: 'crystalCaves',
                special: 'crystal_armor' // Reduces incoming damage
            },
            crystal_hive: {
                name: 'Crystal Hive',
                health: 90,
                attack: 6,
                nutrientRate: 0.3,
                manaRate: 0.1,
                cost: { biomass: 45, nutrients: 20 },
                evolvesFrom: 'crystal_slime',
                habitat: 'crystalCaves',
                special: 'resource_conversion' // Converts biomass to mana/nutrients
            },
            slime_champion: {
                name: 'Slime Champion',
                health: 100,
                attack: 15,
                biomassRate: 0.3,
                cost: { biomass: 35, mana: 10, nutrients: 5 },
                evolvesFrom: 'warrior_slime',
                habitat: 'barracks',
                special: 'leadership' // Boosts nearby monsters
            },
            berserker_slime: {
                name: 'Berserker Slime',
                health: 80,
                attack: 20,
                biomassRate: 0.1,
                cost: { biomass: 30, mana: 15 },
                evolvesFrom: 'warrior_slime',
                habitat: 'battlegrounds',
                special: 'rage' // Attack increases when damaged
            }
        };
        
        this.heroTypes = [
            {
                name: 'Novice Adventurer',
                health: 30,
                attack: 8,
                loot: { biomass: 3, mana: 1 },
                weight: 40 // Higher chance to spawn
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
                special: 'mana_drain', // Steals extra mana
                weight: 20
            },
            {
                name: 'Elite Paladin',
                health: 100,
                attack: 15,
                loot: { biomass: 15, mana: 10, nutrients: 5 },
                special: 'holy_aura', // Extra damage to poison monsters
                weight: 8
            },
            {
                name: 'Dungeon Lord',
                health: 150,
                attack: 25,
                loot: { biomass: 25, mana: 20, nutrients: 15 },
                special: 'boss', // Can only appear after certain time
                weight: 2
            }
        ];
        
        this.habitats = {
            caves: { name: 'Dark Caves', unlocked: true, capacity: 10, bonus: { biomass: 1.1 } },
            swamps: { name: 'Toxic Swamps', unlocked: false, capacity: 8, bonus: { mana: 1.2 }, cost: { biomass: 50, mana: 20 } },
            crystalCaves: { name: 'Crystal Caverns', unlocked: false, capacity: 6, bonus: { nutrients: 1.3 }, cost: { biomass: 60, nutrients: 15 } },
            barracks: { name: 'War Barracks', unlocked: false, capacity: 12, bonus: { attack: 1.2 }, cost: { biomass: 80, mana: 15, nutrients: 10 } },
            nursery: { name: 'Breeding Pools', unlocked: false, capacity: 5, bonus: { biomass: 1.5 }, cost: { biomass: 40, mana: 25 } },
            battlegrounds: { name: 'Battle Arena', unlocked: false, capacity: 8, bonus: { attack: 1.4 }, cost: { biomass: 70, mana: 30, nutrients: 10 } }
        };
    }
}

// Game Engine
class DungeonSymbiosis {
    constructor() {
        this.state = new GameState();
        this.lastUpdate = Date.now();
        this.updateInterval = 100; // 100ms updates
        
        this.initializeUI();
        this.startGameLoop();
    }
    
    initializeUI() {
        // Button event listeners
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
        const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
        this.lastUpdate = now;
        
        this.state.gameTime += deltaTime;
        
        // Generate resources from monsters
        this.updateMonsters(deltaTime);
        
        // Handle hero invasions
        this.updateInvasions(deltaTime);
        
        // Update UI
        this.updateDisplay();
    }
    
    updateMonsters(deltaTime) {
        this.state.monsters.forEach(monster => {
            monster.age += deltaTime;
            
            const monsterType = this.state.monsterTypes[monster.type];
            
            // Calculate synergy bonuses
            const synergyBonus = this.calculateSynergyBonus(monster);
            
            // Calculate dungeon level bonus (5% per level above 1)
            const dungeonBonus = 1 + (this.state.dungeon.level - 1) * 0.05;
            
            // Apply special upgrade bonuses
            let specialBonus = 1.0;
            
            // Crystal bonus for crystal-type monsters
            if ((monster.type.includes('crystal') || monster.type.includes('gem')) && this.state.crystalBonus) {
                specialBonus *= this.state.crystalBonus;
            }
            
            // Generate resources using monster's individual rates with all bonuses
            if (monster.biomassRate !== undefined ? monster.biomassRate : monsterType.biomassRate) {
                const rate = (monster.biomassRate !== undefined ? monster.biomassRate : monsterType.biomassRate) * synergyBonus.biomass * dungeonBonus * specialBonus;
                this.state.resources.biomass += rate * deltaTime;
            }
            
            if (monster.manaRate !== undefined ? monster.manaRate : monsterType.manaRate) {
                const rate = (monster.manaRate !== undefined ? monster.manaRate : monsterType.manaRate) * synergyBonus.mana * dungeonBonus * specialBonus;
                this.state.resources.mana += rate * deltaTime;
            }
            
            if (monster.nutrientRate !== undefined ? monster.nutrientRate : monsterType.nutrientRate) {
                const rate = (monster.nutrientRate !== undefined ? monster.nutrientRate : monsterType.nutrientRate) * synergyBonus.nutrients * dungeonBonus * specialBonus;
                this.state.resources.nutrients += rate * deltaTime;
            }
            
            // Handle special abilities
            this.processSpecialAbilities(monster, deltaTime);
            
            // Check for evolution possibility
            if (monster.age > 30 && monsterType.evolvesTo && !monster.evolutionPossible) {
                monster.evolutionPossible = true;
            }
        });
        
        // Round resources to reasonable precision
        Object.keys(this.state.resources).forEach(key => {
            this.state.resources[key] = Math.round(this.state.resources[key] * 10) / 10;
        });
    }
    
    calculateSynergyBonus(monster) {
        const monsterType = this.state.monsterTypes[monster.type];
        let bonus = { biomass: 1.0, mana: 1.0, nutrients: 1.0, attack: 1.0 };
        
        if (monsterType.synergy) {
            const baseMultiplier = this.state.synergyBonus || 0.1; // Enhanced by major upgrades
            
            monsterType.synergy.forEach(synergyType => {
                const nearbyCount = this.state.monsters.filter(m => 
                    m.type === synergyType && m.id !== monster.id
                ).length;
                
                if (nearbyCount > 0) {
                    const synergyMultiplier = 1 + (nearbyCount * baseMultiplier);
                    bonus.biomass *= synergyMultiplier;
                    bonus.mana *= synergyMultiplier;
                    bonus.nutrients *= synergyMultiplier;
                    bonus.attack *= synergyMultiplier;
                }
            });
        }
        
        // Pack hunting bonus for warrior slimes
        if (monster.type === 'warrior_slime') {
            const packSize = this.state.monsters.filter(m => m.type === 'warrior_slime').length;
            if (packSize >= 3) {
                bonus.attack *= 1.5; // 50% attack bonus for pack of 3+
            }
        }
        
        return bonus;
    }
    
    processSpecialAbilities(monster, deltaTime) {
        const monsterType = this.state.monsterTypes[monster.type];
        
        if (!monsterType.special) return;
        
        // Initialize special ability timers if needed
        if (!monster.specialTimer) monster.specialTimer = 0;
        monster.specialTimer += deltaTime;
        
        switch (monsterType.special) {
            case 'spawn_minions':
                if (monster.specialTimer >= 120) { // Every 2 minutes
                    monster.specialTimer = 0;
                    this.spawnMinion('slime');
                    this.logMessage(`${monster.name} spawned a Basic Slime!`);
                }
                break;
                
            case 'resource_conversion':
                if (monster.specialTimer >= 30 && this.state.resources.biomass >= 5) { // Every 30 seconds
                    monster.specialTimer = 0;
                    this.state.resources.biomass -= 5;
                    this.state.resources.mana += 2;
                    this.state.resources.nutrients += 1;
                }
                break;
                
            case 'leadership':
                // Passive bonus handled in synergy calculation
                break;
                
            case 'rage':
                // Attack bonus based on missing health
                const healthPercent = monster.health / monster.maxHealth;
                monster.rageBonus = 1 + (1 - healthPercent); // Up to 2x attack when near death
                break;
        }
    }
    
    spawnMinion(type) {
        const monsterType = this.state.monsterTypes[type];
        
        // Create free minion (no cost)
        const newMonster = {
            id: Date.now() + Math.random(), // Ensure unique ID
            type: type,
            name: monsterType.name + ' (Minion)',
            health: Math.floor(monsterType.health * 0.7), // Weaker than normal
            maxHealth: Math.floor(monsterType.health * 0.7),
            attack: Math.floor(monsterType.attack * 0.7),
            biomassRate: (monsterType.biomassRate || 0) * 0.5, // Half production
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
            this.state.invasionTimer = 60 + Math.random() * 60; // 60-120 seconds between invasions
        }
    }
    
    spawnMonster(type) {
        const monsterType = this.state.monsterTypes[type];
        
        if (!monsterType) return false;
        
        // Check if player has enough resources
        if (!this.canAfford(monsterType.cost)) return false;
        
        // Deduct resources
        this.deductResources(monsterType.cost);
        
        // Create new monster
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
    
    spawnHero() {
        // Weighted hero selection
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
        
        // Special conditions for certain heroes
        if (selectedHero.special === 'boss' && this.state.gameTime < 300) {
            // Boss can only appear after 5 minutes
            selectedHero = this.state.heroTypes[1]; // Fallback to experienced fighter
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
        
        // Start combat immediately
        setTimeout(() => this.resolveCombat(hero), 1000);
    }
    
    resolveCombat(hero) {
        if (this.state.monsters.length === 0) {
            // No monsters to defend - hero damages dungeon directly
            let damage = hero.attack;
            
            // Special hero abilities when attacking core
            if (hero.special === 'mana_drain') {
                const manaDrained = Math.min(this.state.resources.mana, 10);
                this.state.resources.mana -= manaDrained;
                this.logMessage(`${hero.name} drains ${manaDrained} mana!`);
            }
            
            this.state.dungeon.health -= damage;
            this.logMessage(`${hero.name} damages the dungeon core for ${damage} damage!`);
            
            if (this.state.dungeon.health <= 0) {
                this.gameOver();
                return;
            }
            
            // Hero takes loot and leaves
            Object.keys(hero.loot).forEach(resource => {
                const stolen = Math.min(hero.loot[resource], this.state.resources[resource]);
                this.state.resources[resource] -= stolen;
            });
            this.logMessage(`${hero.name} steals resources and leaves...`);
        } else {
            // Combat with monsters
            let totalMonsterAttack = 0;
            
            this.state.monsters.forEach(monster => {
                const synergyBonus = this.calculateSynergyBonus(monster);
                let attack = monster.attack * synergyBonus.attack;
                
                // Apply combat bonus from major upgrades
                if (this.state.combatBonus) {
                    attack *= this.state.combatBonus;
                }
                
                // Apply special monster bonuses
                if (monster.rageBonus) {
                    attack *= monster.rageBonus;
                }
                
                totalMonsterAttack += attack;
                
                // Special abilities during combat
                const monsterType = this.state.monsterTypes[monster.type];
                if (monsterType.special === 'poison_aura') {
                    let poisonDamage = 2;
                    // Enhanced poison damage from major upgrades
                    if (this.state.toxicBonus) {
                        poisonDamage *= this.state.toxicBonus;
                    }
                    hero.health -= poisonDamage;
                }
                if (monsterType.special === 'crystal_armor') {
                    // Reduce incoming damage (handled below)
                }
            });
            
            // Apply hero special abilities
            if (hero.special === 'holy_aura') {
                const poisonMonsters = this.state.monsters.filter(m => m.type.includes('poison')).length;
                totalMonsterAttack *= Math.max(0.5, 1 - (poisonMonsters * 0.1)); // Reduces poison monster effectiveness
            }
            
            if (totalMonsterAttack >= hero.health) {
                // Monsters win
                this.logMessage(`Your monsters defeat ${hero.name}! Gained resources.`);
                Object.keys(hero.loot).forEach(resource => {
                    this.state.resources[resource] += hero.loot[resource];
                });
                
                // Bonus for defeating stronger heroes
                if (hero.special === 'boss') {
                    this.state.resources.biomass += 10;
                    this.state.resources.mana += 10;
                    this.state.resources.nutrients += 10;
                    this.logMessage('Bonus resources for defeating a boss!');
                }
            } else {
                // Hero wins - damage monsters
                let remainingDamage = hero.attack;
                
                // Sort monsters by health (weakest first)
                const sortedMonsters = [...this.state.monsters].sort((a, b) => a.health - b.health);
                
                for (const monster of sortedMonsters) {
                    if (remainingDamage <= 0) break;
                    
                    const monsterType = this.state.monsterTypes[monster.type];
                    let damage = Math.min(remainingDamage, monster.health);
                    
                    // Crystal armor reduces damage
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
        }
        
        // Remove hero from active list
        this.state.heroes = this.state.heroes.filter(h => h.id !== hero.id);
    }
    
    canAfford(cost) {
        return Object.keys(cost).every(resource => 
            this.state.resources[resource] >= cost[resource]
        );
    }
    
    deductResources(cost) {
        Object.keys(cost).forEach(resource => {
            this.state.resources[resource] -= cost[resource];
        });
    }
    
    upgradeDungeon() {
        const cost = this.getDungeonUpgradeCost();
        
        if (!this.canAfford(cost)) return;
        
        this.deductResources(cost);
        this.state.dungeon.level++;
        this.state.dungeon.maxHealth += 50;
        this.state.dungeon.health = this.state.dungeon.maxHealth;
        
        const benefits = this.getDungeonUpgradeBenefits();
        let upgradeMessage = `Dungeon upgraded to level ${this.state.dungeon.level}! Max health: ${this.state.dungeon.maxHealth}. Resource generation: +${benefits.currentResourceBonus}% (total).`;
        
        // Special bonuses every 5 levels
        if (this.state.dungeon.level % 5 === 0) {
            const specialBonus = this.applyMajorUpgrade(this.state.dungeon.level);
            upgradeMessage += ` MAJOR UPGRADE: ${specialBonus}`;
        }
        
        this.logMessage(upgradeMessage);
    }
    
    applyMajorUpgrade(level) {
        const upgradeType = Math.floor(level / 5);
        
        switch (upgradeType % 4) {
            case 1: // Level 5, 25, 45, etc. - Crystal Enhancement
                this.applyCrystalBonus();
                return "Crystal Enhancement! All crystal-type monsters gain +50% production permanently!";
                
            case 2: // Level 10, 30, 50, etc. - Combat Mastery
                this.applyCombatBonus();
                return "Combat Mastery! All monsters gain +25% attack permanently!";
                
            case 3: // Level 15, 35, 55, etc. - Toxic Evolution
                this.applyToxicBonus();
                return "Toxic Evolution! All poison-type monsters gain enhanced abilities!";
                
            case 0: // Level 20, 40, 60, etc. - Symbiosis Mastery
                this.applySymbiosisBonus();
                return "Symbiosis Mastery! All synergy bonuses increased by +10%!";
        }
    }
    
    applyCrystalBonus() {
        // Permanently boost crystal-type monsters
        if (!this.state.crystalBonus) this.state.crystalBonus = 1.0;
        this.state.crystalBonus += 0.5;
        
        // Apply to existing crystal monsters
        this.state.monsters.forEach(monster => {
            if (monster.type.includes('crystal') || monster.type.includes('gem')) {
                monster.crystalBoosted = true;
            }
        });
    }
    
    applyCombatBonus() {
        // Permanently boost all monster attack
        if (!this.state.combatBonus) this.state.combatBonus = 1.0;
        this.state.combatBonus += 0.25;
    }
    
    applyToxicBonus() {
        // Enhance poison abilities
        if (!this.state.toxicBonus) this.state.toxicBonus = 1.0;
        this.state.toxicBonus += 0.3;
    }
    
    applySymbiosisBonus() {
        // Enhance synergy bonuses
        if (!this.state.synergyBonus) this.state.synergyBonus = 0.1;
        this.state.synergyBonus += 0.1;
    }
    
    getDungeonUpgradeCost() {
        // Cost increases very aggressively: base cost * level^3
        const baseCost = 50;
        const scaledCost = Math.floor(baseCost * Math.pow(this.state.dungeon.level, 3));
        return { nutrients: scaledCost };
    }
    
    getDungeonUpgradeBenefits() {
        const currentLevel = this.state.dungeon.level;
        const currentBonus = Math.round((currentLevel - 1) * 5);
        const nextBonus = Math.round(currentLevel * 5);
        
        return {
            healthIncrease: 50,
            currentResourceBonus: currentBonus,
            nextResourceBonus: nextBonus
        };
    }
    
    evolveMonster(monsterId, newType) {
        const monster = this.state.monsters.find(m => m.id === monsterId);
        const newMonsterType = this.state.monsterTypes[newType];
        
        if (!monster || !newMonsterType || !this.canAfford(newMonsterType.cost)) return;
        
        this.deductResources(newMonsterType.cost);
        
        monster.type = newType;
        monster.name = newMonsterType.name;
        monster.health = newMonsterType.health;
        monster.maxHealth = newMonsterType.health;
        monster.attack = newMonsterType.attack;
        
        // Copy over production rates from the monster type
        monster.biomassRate = newMonsterType.biomassRate || 0;
        monster.manaRate = newMonsterType.manaRate || 0;
        monster.nutrientRate = newMonsterType.nutrientRate || 0;
        
        monster.evolutionPossible = false;
        monster.age = 0;
        
        this.logMessage(`Monster evolved into ${monster.name}!`);
    }
    
    logMessage(message) {
        const log = document.getElementById('invasion-log');
        const p = document.createElement('p');
        p.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        log.appendChild(p);
        
        // Keep only last 10 messages
        while (log.children.length > 10) {
            log.removeChild(log.firstChild);
        }
        
        log.scrollTop = log.scrollHeight;
    }
    
    gameOver() {
        alert('Game Over! Your dungeon core has been destroyed!');
        // Reset game or show restart options
        this.state = new GameState();
        this.logMessage('Dungeon core destroyed! Starting anew...');
    }
    
    updateDisplay() {
        // Update resources
        const dungeonBonus = Math.round((this.state.dungeon.level - 1) * 5);
        const bonusText = dungeonBonus > 0 ? ` (+${dungeonBonus}%)` : '';
        
        document.getElementById('biomass').textContent = Math.floor(this.state.resources.biomass);
        document.getElementById('mana').textContent = Math.floor(this.state.resources.mana);
        document.getElementById('nutrients').textContent = Math.floor(this.state.resources.nutrients);
        
        // Update dungeon status
        document.getElementById('dungeon-health').textContent = 
            `${Math.max(0, Math.floor(this.state.dungeon.health))}/${this.state.dungeon.maxHealth} (Level ${this.state.dungeon.level}${bonusText})`;
        document.getElementById('monster-count').textContent = this.state.monsters.length;
        
        // Update invasion timer
        document.getElementById('invasion-timer').textContent = Math.ceil(this.state.invasionTimer);
        
        // Update monster list
        this.updateMonsterList();
        
        // Update button states
        this.updateButtonStates();
        
        // Update habitat list
        this.updateHabitatList();
        
        // Update evolution options
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
        // Spawn slime button
        const spawnSlimeBtn = document.getElementById('spawn-slime');
        const slimeCost = this.state.monsterTypes.slime.cost;
        spawnSlimeBtn.disabled = !this.canAfford(slimeCost);
        
        // Upgrade dungeon button
        const upgradeDungeonBtn = document.getElementById('upgrade-dungeon');
        const upgradeCost = this.getDungeonUpgradeCost();
        const benefits = this.getDungeonUpgradeBenefits();
        upgradeDungeonBtn.disabled = !this.canAfford(upgradeCost);
        
        // Update button text with current cost and benefits
        const costText = upgradeCost.nutrients;
        const nextBonusText = benefits.nextResourceBonus;
        const nextLevel = this.state.dungeon.level + 1;
        
        let buttonText = `Upgrade Dungeon (${costText} Nutrients) - Level ${nextLevel}: +50 HP, +${nextBonusText}% Resources`;
        
        // Add major upgrade indicator
        if (nextLevel % 5 === 0) {
            const upgradeType = Math.floor(nextLevel / 5) % 4;
            const majorUpgrades = ['Symbiosis Mastery', 'Crystal Enhancement', 'Combat Mastery', 'Toxic Evolution'];
            buttonText += ` + MAJOR: ${majorUpgrades[upgradeType]}!`;
        } else {
            const levelsToMajor = 5 - (nextLevel % 5);
            buttonText += ` (${levelsToMajor} to major upgrade)`;
        }
        
        upgradeDungeonBtn.textContent = buttonText;
        
        // Enhanced tooltip with more detailed info
        const upgradeType = Math.floor(nextLevel / 5) % 4;
        const majorUpgradeDescriptions = [
            'All synergy bonuses +10%',
            'Crystal monsters +50% production',
            'All monsters +25% attack',
            'Poison abilities enhanced +30%'
        ];
        
        let tooltipText = `Upgrade to Level ${nextLevel}\n• +50 Max Health\n• +5% Resource Generation\n• Cost: ${costText} Nutrients`;
        
        if (nextLevel % 5 === 0) {
            tooltipText += `\n\nMAJOR UPGRADE:\n• ${majorUpgradeDescriptions[upgradeType]}`;
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
                canAfford: habitat.cost ? this.canAfford(habitat.cost) : true,
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
        
        if (!habitat || habitat.unlocked || !this.canAfford(habitat.cost)) return;
        
        this.deductResources(habitat.cost);
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
                    const canAfford = this.canAfford(evolutionMonsterType.cost);
                    const hasEvolvableMonsters = group.evolutionReady > 0;
                    
                    // Determine the state of the evolution option
                    let stateClass = '';
                    let stateText = '';
                    
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
                        switch (evolutionMonsterType.special) {
                            case 'poison_aura': specialText = ' • Poison Aura: Damages heroes over time'; break;
                            case 'spawn_minions': specialText = ' • Spawns free Basic Slimes every 2 minutes'; break;
                            case 'crystal_armor': specialText = ' • Crystal Armor: Reduces incoming damage by 30%'; break;
                            case 'resource_conversion': specialText = ' • Converts 5 Biomass → 2 Mana + 1 Nutrients every 30s'; break;
                            case 'leadership': specialText = ' • Leadership: Boosts nearby monsters'; break;
                            case 'rage': specialText = ' • Rage: Attack increases when damaged'; break;
                        }
                    }
                    
                    let benefitsDisplay = '';
                    if (benefitsText.length > 0) {
                        benefitsDisplay = `Produces: ${benefitsText.join(', ')}`;
                    }
                    if (specialText) {
                        benefitsDisplay += (benefitsDisplay ? '\n' : '') + specialText;
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
                        hasEvolvableMonsters
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
                        this.handleEvolutionClick(monsterType, evolution.evolutionType);
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
    
    handleEvolutionClick(monsterType, evolutionType) {
        // Find the first evolution-ready monster of this type
        const readyMonster = this.state.monsters.find(m => 
            m.type === monsterType && m.evolutionPossible
        );
        
        if (!readyMonster) {
            console.log('No ready monster found');
            return;
        }
        
        const evolutionMonsterType = this.state.monsterTypes[evolutionType];
        if (!this.canAfford(evolutionMonsterType.cost)) {
            console.log('Cannot afford evolution');
            return;
        }
        
        // Perform the evolution
        this.evolveMonster(readyMonster.id, evolutionType);
        
        // Force immediate UI update
        this.updateEvolutionOptions();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new DungeonSymbiosis();
    window.game = game; // For debugging
});