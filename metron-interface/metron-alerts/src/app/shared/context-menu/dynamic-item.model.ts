export class DynamicMenuItem {

  label: string;
  urlPattern: string;

  /**
   * Validating server response and logging error if something required missing.
   *
   * @param config {} Menu config object received from and endpoint.
   */
  static isConfigValid(config: {}): boolean {
    return ['label', 'urlPattern'].every((requiredField) => {
      if (config.hasOwnProperty(requiredField) && config[requiredField] !== '') {
        return true;
      } else {
        console.error(`[context-menu] Service returned with a incomplete config object. Missing field: ${requiredField}`);
      }
    })
  }

  /**
   * Make sure you using isConfigValid before calling the constructor.
   */
  constructor(readonly config: any) {
    this.label = config.label;
    this.urlPattern = config.urlPattern;
  }
}
