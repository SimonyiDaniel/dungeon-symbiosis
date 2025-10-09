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
                evolvesTo: ['poison_slime', 'crystal_slime']
            },
            poison_slime: {
                name: 'Poison Slime',
                health: 35,
                attack: 5,
                biomassRate: 0.3,
                manaRate: 0.2,
                cost: { biomass: 15 },
                evolvesFrom: 'slime'
            },
            crystal_slime: {
                name: 'Crystal Slime',
                health: 50,
                attack: 4,
                nutrientRate: 0.1,
                cost: { biomass: 25 },
                evolvesFrom: 'slime'
            }
        };
        
        this.heroTypes = [
            {
                name: 'Novice Adventurer',
                health: 30,
                attack: 8,
                loot: { biomass: 3, mana: 1 }
            },
            {
                name: 'Experienced Fighter',
                health: 60,
                attack: 12,
                loot: { biomass: 8, mana: 3, nutrients: 1 }
            }
        ];
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
            
            // Generate resources using monster's individual rates (for evolved monsters) or type rates (for base monsters)
            if (monster.biomassRate !== undefined ? monster.biomassRate : monsterType.biomassRate) {
                this.state.resources.biomass += (monster.biomassRate !== undefined ? monster.biomassRate : monsterType.biomassRate) * deltaTime;
            }
            
            if (monster.manaRate !== undefined ? monster.manaRate : monsterType.manaRate) {
                this.state.resources.mana += (monster.manaRate !== undefined ? monster.manaRate : monsterType.manaRate) * deltaTime;
            }
            
            if (monster.nutrientRate !== undefined ? monster.nutrientRate : monsterType.nutrientRate) {
                this.state.resources.nutrients += (monster.nutrientRate !== undefined ? monster.nutrientRate : monsterType.nutrientRate) * deltaTime;
            }
            
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
        const heroTemplate = this.state.heroTypes[Math.floor(Math.random() * this.state.heroTypes.length)];
        
        const hero = {
            id: Date.now(),
            name: heroTemplate.name,
            health: heroTemplate.health,
            maxHealth: heroTemplate.health,
            attack: heroTemplate.attack,
            loot: { ...heroTemplate.loot }
        };
        
        this.state.heroes.push(hero);
        this.logMessage(`${hero.name} has invaded your dungeon!`);
        
        // Start combat immediately
        setTimeout(() => this.resolveCombat(hero), 1000);
    }
    
    resolveCombat(hero) {
        if (this.state.monsters.length === 0) {
            // No monsters to defend - hero damages dungeon directly
            this.state.dungeon.health -= hero.attack;
            this.logMessage(`${hero.name} damages the dungeon core for ${hero.attack} damage!`);
            
            if (this.state.dungeon.health <= 0) {
                this.gameOver();
                return;
            }
            
            // Hero takes loot and leaves
            Object.keys(hero.loot).forEach(resource => {
                this.state.resources[resource] = Math.max(0, this.state.resources[resource] - hero.loot[resource]);
            });
            this.logMessage(`${hero.name} steals resources and leaves...`);
        } else {
            // Combat with monsters
            const totalMonsterAttack = this.state.monsters.reduce((sum, monster) => sum + monster.attack, 0);
            
            if (totalMonsterAttack >= hero.health) {
                // Monsters win
                this.logMessage(`Your monsters defeat ${hero.name}! Gained resources.`);
                Object.keys(hero.loot).forEach(resource => {
                    this.state.resources[resource] += hero.loot[resource];
                });
            } else {
                // Hero wins - remove weakest monster
                const weakestMonster = this.state.monsters.reduce((weakest, monster) => 
                    monster.health < weakest.health ? monster : weakest
                );
                
                this.state.monsters = this.state.monsters.filter(monster => monster.id !== weakestMonster.id);
                this.logMessage(`${hero.name} defeats ${weakestMonster.name} and escapes!`);
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
        const cost = { nutrients: 50 };
        
        if (!this.canAfford(cost)) return;
        
        this.deductResources(cost);
        this.state.dungeon.level++;
        this.state.dungeon.maxHealth += 50;
        this.state.dungeon.health = this.state.dungeon.maxHealth;
        
        this.logMessage(`Dungeon upgraded to level ${this.state.dungeon.level}!`);
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
        document.getElementById('biomass').textContent = Math.floor(this.state.resources.biomass);
        document.getElementById('mana').textContent = Math.floor(this.state.resources.mana);
        document.getElementById('nutrients').textContent = Math.floor(this.state.resources.nutrients);
        
        // Update dungeon status
        document.getElementById('dungeon-health').textContent = Math.max(0, Math.floor(this.state.dungeon.health));
        document.getElementById('monster-count').textContent = this.state.monsters.length;
        
        // Update invasion timer
        document.getElementById('invasion-timer').textContent = Math.ceil(this.state.invasionTimer);
        
        // Update monster list
        this.updateMonsterList();
        
        // Update button states
        this.updateButtonStates();
        
        // Update evolution options
        this.updateEvolutionOptions();
    }
    
    updateMonsterList() {
        const monsterList = document.getElementById('monster-list');
        monsterList.innerHTML = '';
        
        if (this.state.monsters.length === 0) {
            monsterList.innerHTML = '<p style="color: #888; text-align: center; margin: 20px;">No monsters in your dungeon. Spawn some to begin!</p>';
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
        
        // Display grouped monsters
        Object.keys(monsterGroups).forEach(monsterType => {
            const group = monsterGroups[monsterType];
            const sampleMonster = group.monsters[0];
            const monsterTypeData = this.state.monsterTypes[monsterType];
            
            const monsterDiv = document.createElement('div');
            monsterDiv.className = 'monster';
            
            // Calculate average age for display
            const avgAge = group.monsters.reduce((sum, m) => sum + m.age, 0) / group.count;
            
            monsterDiv.innerHTML = `
                <div class="monster-info">
                    <div class="monster-name">${sampleMonster.name} x${group.count}</div>
                    <div class="monster-stats">
                        HP: ${sampleMonster.health}/${sampleMonster.maxHealth} | 
                        ATK: ${sampleMonster.attack} | 
                        Avg Age: ${Math.floor(avgAge)}s
                        ${group.evolutionReady > 0 ? ` | <span style="color: #4caf50;">${group.evolutionReady} Evolution Ready!</span>` : ''}
                    </div>
                    <div class="monster-production">
                        ${monsterTypeData.biomassRate ? `+${(monsterTypeData.biomassRate * group.count).toFixed(1)}/s Biomass` : ''}
                        ${monsterTypeData.manaRate ? ` +${(monsterTypeData.manaRate * group.count).toFixed(1)}/s Mana` : ''}
                        ${monsterTypeData.nutrientRate ? ` +${(monsterTypeData.nutrientRate * group.count).toFixed(1)}/s Nutrients` : ''}
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
        const upgradeCost = { nutrients: 50 };
        upgradeDungeonBtn.disabled = !this.canAfford(upgradeCost);
    }
    
    updateEvolutionOptions() {
        const evolutionOptions = document.getElementById('evolution-options');
        evolutionOptions.innerHTML = '';
        
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
        
        // Show evolution options for each monster type that can evolve
        Object.keys(monsterGroups).forEach(monsterType => {
            const group = monsterGroups[monsterType];
            const monsterTypeData = this.state.monsterTypes[monsterType];
            
            if (monsterTypeData.evolvesTo) {
                monsterTypeData.evolvesTo.forEach(evolutionType => {
                    const evolutionMonsterType = this.state.monsterTypes[evolutionType];
                    
                    const optionDiv = document.createElement('div');
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
                    
                    optionDiv.className = `evolution-option ${stateClass}`;
                    
                    const costText = Object.keys(evolutionMonsterType.cost)
                        .map(resource => `${evolutionMonsterType.cost[resource]} ${resource}`)
                        .join(', ');
                    
                    const sampleMonster = group.monsters[0];
                    
                    optionDiv.innerHTML = `
                        <div class="evolution-title">Evolve ${sampleMonster.name} → ${evolutionMonsterType.name}${stateText}</div>
                        <div class="evolution-cost">Cost: ${costText}</div>
                        <div class="evolution-available">Available: ${group.total} total, ${group.evolutionReady} evolution ready</div>
                    `;
                    
                    if (canAfford && hasEvolvableMonsters) {
                        optionDiv.style.cursor = 'pointer';
                        optionDiv.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Prevent multiple rapid clicks
                            if (optionDiv.classList.contains('evolving')) return;
                            
                            // Double-check conditions at click time
                            const currentGroup = this.state.monsters.filter(m => m.type === monsterType);
                            const readyMonster = currentGroup.find(m => m.evolutionPossible);
                            
                            if (!readyMonster || !this.canAfford(evolutionMonsterType.cost)) return;
                            
                            optionDiv.classList.add('evolving');
                            
                            this.evolveMonster(readyMonster.id, evolutionType);
                            
                            // Re-enable after evolution completes
                            setTimeout(() => {
                                if (optionDiv.classList) {
                                    optionDiv.classList.remove('evolving');
                                }
                            }, 300);
                        }, { once: false });
                    } else {
                        optionDiv.style.cursor = 'not-allowed';
                    }
                    
                    evolutionOptions.appendChild(optionDiv);
                });
            }
        });
        
        if (evolutionOptions.children.length === 0) {
            evolutionOptions.innerHTML = '<p style="color: #888; text-align: center;">No monster types available for evolution yet.</p>';
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new DungeonSymbiosis();
    window.game = game; // For debugging
});