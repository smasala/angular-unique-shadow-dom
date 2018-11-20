# angular-unique-shadow-dom
Creates unique shadow DOM encapsulation attribute / ids for Angular applications (custom elements)

# Usage

Extends the `app.module.ts` class with the `AppEncapsulationModule` and call the super constructor

```typescript
export class MyAppModule extends AppEncapsulationModule {
  constructor() {
    super('myUniqueAppName');
  }
}

```

Angular.json configuration must have the `buildOptimizer` set to `false` as the class meta data is required to find the correct DOM renderer instance.

# Compability

- Tested with Angular 7+
- Could work with all Angular versions which implement `DomRendererFactory2` 
