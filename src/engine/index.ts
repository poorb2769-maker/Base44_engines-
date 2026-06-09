// Core
export { Entity, IComponent } from './core/Entity';
export { Transform } from './core/Transform';
export { Material, MaterialProps } from './core/Material';
export { Light, LightType, LightProps } from './core/Light';
export { Animation, AnimationTrack, AnimationKeyframe } from './core/Animation';

// Scene
export { Scene } from './scene/Scene';
export { SceneSerializer } from './scene/SceneSerializer';

// Undo/Redo
export { Command, CommandHistory } from './undo-redo';
export { MoveEntityCommand, AddEntityCommand, RemoveEntityCommand, DuplicateEntityCommand, DeleteEntityCommand } from './undo-redo';

// Assets
export { GLBLoader, LoadedModel } from './assets/GLBLoader';
