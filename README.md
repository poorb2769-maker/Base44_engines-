# Base44 Engine

A lightweight web-based game engine built with TypeScript and Three.js.

## Features

- **Entity Component System (ECS)** - Flexible entity-based architecture
- **Scene Management** - JSON import/export for scene serialization
- **Undo/Redo System** - Command pattern implementation for reversible operations
- **GLB Model Loading** - Load and place 3D models in scenes
- **Web-based** - Run directly in the browser
- **Type-safe** - Built with TypeScript

## Project Structure

```
Base44_engines-/
├── src/
│   ├── engine/           # Core engine library
│   │   ├── core/        # ECS, Entity, Transform
│   │   ├── scene/       # Scene management & serialization
│   │   ├── undo-redo/   # Command pattern & history
│   │   ├── assets/      # Asset loading (GLB, etc.)
│   │   └── index.ts     # Engine exports
│   ├── editor/          # Scene editor
│   │   ├── viewport/    # 3D viewport
│   │   ├── panels/      # UI panels
│   │   └── index.html   # Editor entry point
│   └── runtime/         # Game runtime
│       └── index.html   # Runtime entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Install dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Architecture

### Entity Component System (ECS)
- Entities are containers for components
- Components hold data
- Systems process entities with specific components

### Scene Format
Scenes are serialized to JSON:
```json
{
  "name": "Scene1",
  "id": "scene-id",
  "root": {
    "id": "root-id",
    "name": "Root",
    "components": {},
    "children": [
      {
        "id": "entity-1",
        "name": "Cube",
        "components": {
          "transform": { "position": [0, 0, 0], "rotation": [0, 0, 0, 1], "scale": [1, 1, 1] }
        },
        "children": []
      }
    ]
  }
}
```

### Undo/Redo
All modifiable operations are commands that can be undone/redone:
- Move entity
- Add/remove entity
- Modify component

## License

MIT
