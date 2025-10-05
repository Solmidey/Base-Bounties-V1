export function patchWalletConnectModal() {
  if (typeof window === 'undefined' || typeof window.customElements === 'undefined') {
    return;
  }

  window.customElements
    .whenDefined('wcm-search-input')
    .then(() => {
      try {
        const ctor = window.customElements.get('wcm-search-input');
        if (!ctor) {
          return;
        }

        const proto = (ctor as { prototype: Record<string, unknown> }).prototype as {
          __patchedOnChange?: boolean;
        };

        if (proto.__patchedOnChange) {
          return;
        }

        const descriptor = Object.getOwnPropertyDescriptor(proto, 'onChange');
        if (!descriptor || typeof descriptor.set !== 'function') {
          proto.__patchedOnChange = true;
          return;
        }

        const originalSet = descriptor.set;
        const originalGet = descriptor.get;

        Object.defineProperty(proto, 'onChange', {
          configurable: descriptor.configurable ?? true,
          enumerable: descriptor.enumerable ?? false,
          get: originalGet,
          set(this: unknown, value: unknown) {
            if (typeof value === 'function') {
              const handler = value as (event: Event & { target: EventTarget & { value?: string } }) => void;
              const wrapped = function (this: any, event?: Event) {
                const input = (event?.target as HTMLInputElement | undefined) ??
                  (event as unknown as { currentTarget?: EventTarget })?.currentTarget ??
                  this?.shadowRoot?.querySelector?.('input') ??
                  null;

                const safeEvent = (() => {
                  if (event && typeof event === 'object' && (event as { target?: unknown }).target) {
                    return event as Event & { target: EventTarget & { value?: string } };
                  }

                  const fallbackTarget = (input ?? ({ value: '' } as EventTarget & { value?: string })) as EventTarget & {
                    value?: string;
                  };

                  return {
                    target: fallbackTarget,
                  } as Event & { target: EventTarget & { value?: string } };
                })();

                handler.call(this, safeEvent);
              };

              return originalSet.call(this, wrapped);
            }

            return originalSet.call(this, value);
          },
        });

        proto.__patchedOnChange = true;
      } catch (err) {
        console.error('[walletconnect] Failed to patch search input handler:', err);
      }
    })
    .catch((error) => {
      console.error('[walletconnect] Failed waiting for search input definition:', error);
    });
}
