import { DynamicMenuItem } from './dynamic-item.model';

describe('dynamic-item.model', () => {

  it('should return error if url pattern is missing', () => {
    expect(DynamicMenuItem.isConfigValid({ label: 'test' })).toBeFalsy();
  });

  it('should return error if label is missing', () => {
    expect(DynamicMenuItem.isConfigValid({ urlPattern: '/test' })).toBeFalsy();
  });

  it('should return error if url pattern is empty', () => {
    expect(DynamicMenuItem.isConfigValid({ label: '', urlPattern: '/test' })).toBeFalsy();
  });

  it('should return error if label is empty', () => {
    expect(DynamicMenuItem.isConfigValid({ label: 'test', urlPattern: '' })).toBeFalsy();
  });

  it('should instatiate if all good', () => {
    expect(DynamicMenuItem.isConfigValid({ label: 'test', urlPattern: '/test' })).toBeTruthy();
  });

});
