import {Renderer2, RendererType2} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {DomRendererFactory2} from '@angular/platform-browser/src/dom/dom_renderer';

declare type RendererFunction = (element: any, type: RendererType2 | null) => Renderer2;

interface ExposedBrowserModule extends BrowserModule {
	decorators?: {
		args?: {
			providers?: {
				useClass?: {
					prototype?: {
						createRenderer?: RendererFunction;
					};
				};
			}[];
		}[];
	}[];
}

/**
 * Extend the AppModule with this and call the "super('myuniqueid')" in the constructor.
 * "BuildOptimizer" in the angular.json config must be set to 'false'
 */
export class AppEncapsulationModule {
	constructor(appName: string) {
		const renderer: DomRendererFactory2 | undefined = this.findDomRendererInstance();
		if (renderer) {
			this.replaceRenderer(renderer, appName);
		} else {
			console.error(
				'Has Angular been updated or is the "buildOptimizer" active? The DomRendererFactory2 could not be found and the view encapsulation emulation cannot be adapted to ensure that each embedded angular application is uniquely tagged'
			);
			console.error('Please see: https://github.com/angular/angular/issues/16676 and https://github.com/angular/angular/pull/17745');
		}
	}

	/**
	 * Attempts to find and return the current {DomRendererFactory2} instance loaded
	 */
	private findDomRendererInstance(): DomRendererFactory2 | undefined {
		const exposedModule = this.getBrowserModule();
		if (exposedModule.decorators) {
			const l = exposedModule.decorators.length;
			for (let i = 0; i < l; i++) {
				const dec = exposedModule.decorators[i];
				if (dec.args) {
					const ll = dec.args.length;
					for (let ii = 0; ii < ll; ii++) {
						const arg = dec.args[ii];
						if (arg.providers) {
							const renderer = arg.providers.find((entry) => {
								if (entry && entry.useClass && entry.useClass.prototype && entry.useClass.prototype.createRenderer) {
									return true;
								}

								return false;
							});
							if (renderer) {
								return renderer.useClass as DomRendererFactory2;
							}
						}
					}
				}
			}
		}
	}

	/**
	 * Replaces the prototype of the {createRenderer} function in {DomRendererFactory2}
	 * so that the component/element {id}s are supplied with a prefix before render.
	 */
	private replaceRenderer(renderer: DomRendererFactory2, appName: string): void {
		const proto: DomRendererFactory2 = this.getRendererPrototype(renderer);
		const oldFunc: RendererFunction = proto.createRenderer;
		const that: TUIModule = this;
		proto.createRenderer = function(element: any, type: RendererType2 | null) {
			// better clone it just to be safe ;)
			const clonedType = that.cloneObject(type);
			if (clonedType && clonedType.id) {
				clonedType.id = `${appName}-${clonedType.id}`;
			}
			const res = oldFunc.bind(this)(element, clonedType);

			return res;
		};
	}

	/**
	 * Typescript casting
	 */
	private getBrowserModule(): ExposedBrowserModule {
		const temp: any = BrowserModule;

		return temp as ExposedBrowserModule;
	}

	/**
	 * Typescript casting
	 */
	private getRendererPrototype(renderer: DomRendererFactory2): DomRendererFactory2 {
		const temp: any = renderer;

		return temp.prototype as DomRendererFactory2;
	}

	private cloneObject(type: RendererType2 | null): RendererType2 | null {
		if (type) {
			return {...type};
		}

		return null;
	}
}
