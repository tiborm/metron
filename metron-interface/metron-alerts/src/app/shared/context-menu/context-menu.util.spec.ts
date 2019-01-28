import { merge } from './context-menu.util';

describe('context-menu.util', () => {

  it('merge function should be able to merge two objects', () => {
    expect(merge( { first: 'aaa' }, { second: 'bbb' } )).toEqual({ first: 'aaa', second: 'bbb' });
  })

  it('merge should be able to merge many objects', () => {
    const objects = [
      { first: 'aaa' },
      { second: 'bbb' },
      { third: 'ccc' },
      { fourth: 'ddd' },
      { fiveth: 'eee' },
      { sixth: 'fff' },
      { seventh: 'ggg' },
    ];

    expect(merge.apply(null, objects)).toEqual(
      objects.reduce((result, next) => Object.assign(result, next), {})
    );
  })

});
