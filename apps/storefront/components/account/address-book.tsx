'use client';

/* Saved shipping addresses. Medusa's own store API already holds these —
   nothing here is custom — this just gives the account a place to see, add,
   edit and remove them. Checkout still takes an address fresh; wiring these
   in as a picker there is a next step, not this one. */

import { useActionState, useEffect, useRef, useState } from 'react';
import { addAddressAction, removeAddressAction, updateAddressAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import type { ApiAddress } from '@/lib/session';
import styles from '@/app/account/account.module.css';
import { accountText } from '@/lib/i18n-account';
import { useLang } from '@/lib/use-lang';

const COUNTRY_CODES = ['ch', 'at', 'be', 'de', 'dk', 'es', 'fr', 'ie', 'it', 'lu', 'nl', 'pt', 'se', 'gb', 'us', 'sg', 'jp', 'au'];

const addressLines = (address: ApiAddress, countries: Record<string, string>) =>
  [
    [address.first_name, address.last_name].filter(Boolean).join(' '),
    address.address_1,
    address.address_2,
    [address.postal_code, address.city].filter(Boolean).join(' '),
    countries[address.country_code ?? ''] ?? address.country_code,
  ].filter(Boolean);

function AddressForm({ address, onDone }: { address?: ApiAddress; onDone: () => void }) {
  const t = accountText(useLang()).address;
  const f = accountText(useLang()).form;
  const action = address ? updateAddressAction.bind(null, address.id) : addAddressAction;
  const [state, formAction, pending] = useActionState(action, {});

  /* `state` is a fresh object every time the action resolves, success
     included, so the form closes on that change and on nothing else. Not on
     mount — React runs a mounting effect twice in development — and not when
     the parent re-renders: it hands down a new `onDone` each time, and an
     open form that closed because a different address was removed would take
     what was being typed with it. */
  const initial = useRef(state);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (state !== initial.current && !state.error) done.current();
  }, [state]);

  return (
    <form action={formAction} className={styles.form} style={{ maxWidth: 'none' }}>
      <div className={styles.addressGrid}>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>{f.firstName}</label>
          <input name="first_name" defaultValue={address?.first_name ?? ''} className={styles.input} />
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>{f.lastName}</label>
          <input name="last_name" defaultValue={address?.last_name ?? ''} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t.address}</label>
          <input name="address_1" defaultValue={address?.address_1 ?? ''} required className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t.apartment}</label>
          <input name="address_2" defaultValue={address?.address_2 ?? ''} className={styles.input} />
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>{t.postal}</label>
          <input name="postal_code" defaultValue={address?.postal_code ?? ''} className={styles.input} />
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>{t.city}</label>
          <input name="city" defaultValue={address?.city ?? ''} required className={styles.input} />
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>{t.country}</label>
          <select name="country_code" defaultValue={address?.country_code ?? 'ch'} className={styles.input}>
            {COUNTRY_CODES.map((code) => (
              <option key={code} value={code}>
                {t.countries[code]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>{t.phoneOpt}</label>
          <input name="phone" defaultValue={address?.phone ?? ''} className={styles.input} />
        </div>
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      <div className={styles.actions}>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? t.saving : t.save}
        </Button>
        <button type="button" onClick={onDone} className={styles.switch}>
          {f.cancel}
        </button>
      </div>
    </form>
  );
}

function AddressCard({ address }: { address: ApiAddress }) {
  const t = accountText(useLang()).address;
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (editing) {
    return <AddressForm address={address} onDone={() => setEditing(false)} />;
  }

  return (
    <div className={styles.addressCard}>
      <div className={styles.addressText}>
        {addressLines(address, t.countries).map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className={styles.addressActions}>
        <button type="button" onClick={() => setEditing(true)} className={styles.switch}>
          {t.edit}
        </button>
        <button
          type="button"
          disabled={removing}
          onClick={() => {
            setRemoving(true);
            void removeAddressAction(address.id);
          }}
          className={styles.switch}
        >
          {removing ? t.removing : t.remove}
        </button>
      </div>
    </div>
  );
}

export function AddressBook({ addresses }: { addresses: ApiAddress[] }) {
  const t = accountText(useLang()).address;
  const [adding, setAdding] = useState(false);

  return (
    <div>
      {addresses.length > 0 && (
        <div className={styles.addressList}>
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}

      {adding ? (
        <div style={{ marginTop: 20 }}>
          <AddressForm onDone={() => setAdding(false)} />
        </div>
      ) : (
        <div className={styles.actions} style={{ marginTop: addresses.length ? 20 : 0 }}>
          <button type="button" onClick={() => setAdding(true)} className={styles.switch}>
            {t.add}
          </button>
        </div>
      )}
    </div>
  );
}
