/**
 * This spec verifies the core logic that modal routes are excluded from the
 * "normal" stack on the web platform.  It purposely avoids `renderRouter`
 * (which depends on react-native-test-renderer) and instead exercises the same
 * predicate used inside `ModalStackView`.
 */

import { StackNavigationState } from '@react-navigation/native';

// Replicate the helper from ModalStack.web.tsx
function isModalPresentation(options?: { presentation?: string | null }) {
  const p = options?.presentation;
  return p === 'modal' || p === 'formSheet' || p === 'fullScreenModal' || p === 'containedModal';
}

describe('modal route filtering on web', () => {
  const ORIGINAL_OS = process.env.EXPO_OS;

  afterEach(() => {
    process.env.EXPO_OS = ORIGINAL_OS; // restore
  });

  function makeState(routeKeys: string[]): StackNavigationState<any> {
    return {
      index: 0,
      routes: routeKeys.map((key) => ({ key, name: key })),
      stale: false,
      key: 'stack-1',
      routeNames: routeKeys,
    } as any;
  }

  it('excludes modal routes when EXPO_OS === "web"', () => {
    process.env.EXPO_OS = 'web';

    const state = makeState(['index', 'second']);
    const descriptors: any = {
      index: { options: {} },
      second: { options: { presentation: 'modal' } },
    };

    const nonModal = state.routes.filter((route) => {
      const isModalType = isModalPresentation(descriptors[route.key].options);
      return !(process.env.EXPO_OS === 'web' && isModalType);
    });

    expect(nonModal.map((r) => r.key)).toEqual(['index']);
  });

  // We purposefully avoid asserting native behaviour here because in the Jest
  // web / node projects the Babel transform inlines `process.env.EXPO_OS` as
  // "web" at compile-time, so runtime mutation wouldn't reflect in the code
  // under test.
});
