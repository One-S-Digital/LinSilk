'use client';

/* Saved shipping addresses. Medusa's own store API already holds these —
   nothing here is custom — this just gives the account a place to see, add,
   edit and remove them. Checkout still takes an address fresh; wiring these
   in as a picker there is a next step, not this one. */

import { useActionState, useState } from 'react';
import { addAddressAction, removeAddressAction, updateAddressAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import type { ApiAddress } from '@/lib/session';
import styles from '@/app/account/account.module.css';

const COUNTRIES: [string, string][] = [
  ['ch', 'Switzerland'],
  ['at', 'Austria'],
  ['be', 'Belgium'],
  ['de', 'Germany'],
  ['dk', 'Denmark'],
  ['es', 'Spain'],
  ['fr', 'France'],
  ['ie', 'Ireland'],
  ['it', 'Italy'],
  ['lu', 'Luxembourg'],
  ['nl', 'Netherlands'],
  ['pt', 'Portugal'],
  ['se', 'Sweden'],
  ['gb', 'United Kingdom'],
  ['us', 'United States'],
  ['sg', 'Singapore'],
  ['jp', 'Japan'],
  ['au', 'Australia'],
];

const addressLines = (address: ApiAddress) =>
  [
    [address.first_name, address.last_name].filter(Boolean).join(' '),
    address.address_1,
    address.address_2,
    [address.postal_code, address.city].filter(Boolean).join(' '),
    COUNTRIES.find(([code]) => code === address.country_code)?.[1] ?? address.country_code,
  ].filter(Boolean);

function AddressForm({ address, onDone }: { address?: ApiAddress; onDone: () => void }) {
  const action = address ? updateAddressAction.bind(null, address.id) : addAddressAction;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={styles.form} style={{ maxWidth: 'none' }}>
      <div className={styles.addressGrid}>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>First name</label>
          <input name="first_name" defaultValue={address?.first_name ?? ''} className={styles.input} />
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>Last name</label>
          <input name="last_name" defaultValue={address?.last_name ?? ''} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Address</label>
          <input name="address_1" defaultValue={address?.address_1 ?? ''} required className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Apartment, suite, etc. (optional)</label>
          <input name="address_2" defaultValue={address?.address_2 ?? ''} className={styles.input} />
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>Postal code</label>
          <input name="postal_code" defaultValue={address?.postal_code ?? ''} className={styles.input} />
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>City</label>
          <input name="city" defaultValue={address?.city ?? ''} required className={styles.input} />
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>Country</label>
          <select name="country_code" defaultValue={address?.country_code ?? 'ch'} className={styles.input}>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field} data-half="true">
          <label className={styles.label}>Phone (optional)</label>
          <input name="phone" defaultValue={address?.phone ?? ''} className={styles.input} />
        </div>
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      <div className={styles.actions}>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? 'Saving…' : 'Save address'}
        </Button>
        <button type="button" onClick={onDone} className={styles.switch}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddressCard({ address }: { address: ApiAddress }) {
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (editing) {
    return <AddressForm address={address} onDone={() => setEditing(false)} />;
  }

  return (
    <div className={styles.addressCard}>
      <div className={styles.addressText}>
        {addressLines(address).map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className={styles.addressActions}>
        <button type="button" onClick={() => setEditing(true)} className={styles.switch}>
          Edit
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
          {removing ? 'Removing…' : 'Remove'}
        </button>
      </div>
    </div>
  );
}

export function AddressBook({ addresses }: { addresses: ApiAddress[] }) {
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
            + Add an address
          </button>
        </div>
      )}
    </div>
  );
}
