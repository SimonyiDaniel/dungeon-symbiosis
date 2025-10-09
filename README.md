# Dungeon Symbiosis

A unique incremental/idle game where you manage and evolve a living dungeon ecosystem instead of playing as the hero.

## Game Concept

In Dungeon Symbiosis, you control a sentient dungeon that must grow and evolve its monster ecosystem to survive against invading heroes. Rather than traditional combat, the game focuses on:

- **Ecosystem Management**: Balance different monster types and their resource production
- **Evolution Mechanics**: Evolve basic slimes into powerful specialized creatures
- **Resource Strategy**: Manage biomass, mana, and nutrients to expand your dungeon
- **Defensive Planning**: Prepare your monsters to defend against increasingly powerful heroes

## Current Features

### ✅ Core Mechanics Implemented
- **Resource System**: Biomass, Mana, and Nutrients with automatic generation
- **Monster Spawning**: Start with basic slimes that produce biomass over time
- **Evolution Tree**: Evolve slimes into Poison Slimes (mana producers) or Crystal Slimes (nutrient producers)
- **Hero Invasions**: Random hero attacks that steal resources or destroy monsters
- **Combat System**: Automatic combat resolution based on total monster attack vs hero health
- **Dungeon Health**: Core health system with upgrade mechanics

### 🎮 How to Play
1. **Start Simple**: Begin with basic slimes that generate biomass
2. **Expand**: Use biomass to spawn more slimes
3. **Evolve**: Wait for monsters to mature (30+ seconds) then evolve them into specialized types
4. **Defend**: Build up your monster army to defend against hero invasions
5. **Upgrade**: Use nutrients to upgrade your dungeon core for more health

## Development Roadmap

### Phase 1: Core Foundation ✅
- [x] Basic resource generation system
- [x] Monster spawning and management
- [x] Simple hero invasion mechanics
- [x] Evolution system prototype
- [x] Basic UI and game loop

### Phase 2: Ecosystem Expansion (Next)
- [ ] More monster types and evolution paths
- [ ] Monster synergies and food chains
- [ ] Dungeon room/habitat system
- [ ] Monster AI behaviors
- [ ] Resource conversion mechanics

### Phase 3: Advanced Features
- [ ] Multiple hero classes with unique abilities
- [ ] Loot and equipment systems
- [ ] Boss invasions
- [ ] Prestige/reset mechanics
- [ ] Achievement system

### Phase 4: Polish & Balance
- [ ] Art and sound effects
- [ ] Advanced UI/UX
- [ ] Save/load system
- [ ] Playtesting and balancing

## Monster Evolution Tree

```
Basic Slime (Biomass producer)
├── Poison Slime (Mana producer)
│   ├── Toxic Horror (planned)
│   └── Venomous Broodmother (planned)
└── Crystal Slime (Nutrient producer)
    ├── Gem Guardian (planned)
    └── Crystal Hive (planned)
```

## Resource Types

- **Biomass**: Basic organic matter, produced by slimes, used for spawning most monsters
- **Mana**: Magical energy, produced by evolved creatures, used for advanced evolutions
- **Nutrients**: Refined dungeon essence, produced by specialized monsters, used for dungeon upgrades

## Getting Started

1. Open `index.html` in a web browser
2. Start with 1 basic slime producing biomass
3. Save up 5 biomass to spawn your second slime
4. Wait for monsters to age and become eligible for evolution
5. Defend against hero invasions to protect your growing ecosystem

## Technical Details

- **Engine**: Vanilla JavaScript with object-oriented design
- **Update Frequency**: 100ms game loop for smooth resource generation
- **Save System**: Coming soon - currently resets on page refresh
- **Browser Compatibility**: Modern browsers supporting ES6+ features

## Contributing

This is an early prototype following the roadmap outlined in the initial game design document. Future expansions will add more depth to the ecosystem mechanics, additional monster types, and complex hero interaction systems.