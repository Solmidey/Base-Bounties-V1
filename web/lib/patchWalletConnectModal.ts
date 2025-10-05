export function patchWalletConnectModal() {
  if (typeof window === 'undefined' || typeof window.customElements === 'undefined') return;

  window.customElements
    .whenDefined('wcm-search-input')
    .then(() => {
      try {
        const ctor = window.customElements.get('wcm-search-input');
        if (!ctor) return;

        const proto = (ctor as { prototype: Record<string, any> }).prototype as {
          __patchedOnChange?: boolean;
        };
        if (proto.__patchedOnChange) return;

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
          set(this: any, value: unknown) {
            if (typeof value !== 'function') return originalSet.call(this, value);

            const handler = value as (arg: { value: string } | Event) => void;

            const wrapped = function (this: any, e?: any) {
              // If caller already supplies { value }, pass through
              if (e && typeof e === 'object' && 'value' in e) {
                return handler.call(this, e);
              }
              // Otherwise synthesize { value } from the input element or event.target
              const inputEl =
                (e?.target as HTMLInputElement | undefined) ??
                this?.shadowRoot?.querySelector?.('input') ??
                null;

              const valueObj = { value: String(inputEl?.value ?? '') };
              return handler.call(this, valueObj);
            };

            return originalSet.call(this, wrapped);
          },
        });

        proto.__patchedOnChange = true;
      } catch (err) {
        console.error('[walletconnect] patch failed:', err);
      }
    })
    .catch((error) => {
      console.error('[walletconnect] waiting for wcm-search-input failed:', error);
    });
}
