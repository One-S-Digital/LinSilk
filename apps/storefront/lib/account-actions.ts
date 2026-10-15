'use server';

/* Registration, sign-in and the saved measurement profile — the account
 * surface, all of it Server Actions so the session cookie in `session.ts`
 * never has to leave this file for a client component to call in.
 *
 * Register is two Medusa calls in sequence: create the auth identity, then
 * create the customer record with the token that returns. Both endpoints are
 * Medusa's own; nothing here is custom.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZONES } from './catalog';
import { toLineItemMetadata, type Measurements, type Unit } from './measurements';
import { MEDUSA_URL, medusaHeaders } from './medusa';
import { authedFetch, clearSession, getCustomer, getToken, isEmailVerified, setSession } from './session';

type ActionResult = { error?: string };

const post = (path: string, body: unknown, token?: string) =>
  fetch(`${MEDUSA_URL}${path}`, {
    method: 'POST',
    headers: {
      ...medusaHeaders(),
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

const readError = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);
  return (body as { message?: string } | null)?.message ?? fallback;
};

/* A token's `actor_id` claim, read without verifying the signature — Medusa
   already did that to issue it, so this is only ever used to decide between
   two things this file is about to do with a token it just received, never
   to authorize anything by itself. Empty means the auth identity behind this
   token has no customer attached. */
const actorIdOf = (token: string): string => {
  try {
    const payload = token.split('.')[1];
    return (JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { actor_id?: string })
      .actor_id ?? '';
  } catch {
    return '';
  }
};

const NOT_VERIFIED = 'Confirm your email first — the link was sent when you registered.';

export async function loginAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (!email || !password) return { error: 'An email and a password are both needed.' };

  const response = await post('/auth/customer/emailpass', { email, password });
  if (!response.ok) {
    return {
      error:
        response.status === 401
          ? 'That email and password do not match an account here.'
          : await readError(response, 'Could not sign in. Try again in a moment.'),
    };
  }

  const { token } = (await response.json()) as { token: string };

  /* The password matches, but nothing is attached to it: a registration that
     created the auth identity and stopped there, the store call right after
     it failing. Finished here, so signing in is what recovers it rather than
     a password that is correct and an account that still does not exist. */
  if (!actorIdOf(token)) {
    const created = await post('/store/customers', { email }, token);
    if (!created.ok) {
      return { error: await readError(created, 'Could not sign in. Try again in a moment.') };
    }
    // This token was issued before the customer existed; it reads as
    // unauthorized now that one is attached, the same as a register token.
    const relogin = await post('/auth/customer/emailpass', { email, password });
    if (!relogin.ok) {
      return { error: 'Could not sign in. Try again in a moment.' };
    }
    const { token: freshToken } = (await relogin.json()) as { token: string };
    await setSession(freshToken);
    redirect('/account');
  }

  await setSession(token);
  redirect('/account');
}

export async function registerAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (!name || !email || !password) {
    return { error: 'A name, an email and a password are all needed.' };
  }
  if (password.length < 8) return { error: 'The password needs at least eight characters.' };

  const registered = await post('/auth/customer/emailpass/register', { email, password });
  if (!registered.ok) {
    return {
      error:
        registered.status === 401
          ? 'That email already has an account here. Sign in instead.'
          : await readError(registered, 'Could not open an account. Try again in a moment.'),
    };
  }
  const { token: registerToken } = (await registered.json()) as { token: string };

  const [firstName, ...rest] = name.split(/\s+/);
  const created = await post(
    '/store/customers',
    { email, first_name: firstName, last_name: rest.join(' ') || undefined },
    registerToken,
  );
  if (!created.ok) {
    return { error: await readError(created, 'Could not open an account. Try again in a moment.') };
  }

  // The registration token has no customer attached; a fresh login does.
  const login = await post('/auth/customer/emailpass', { email, password });
  if (!login.ok) redirect('/account');
  const { token } = (await login.json()) as { token: string };
  await setSession(token);
  redirect('/account');
}

export async function logoutAction() {
  await clearSession();
  redirect('/account');
}

export async function requestPasswordResetAction(
  _prev: ActionResult & { sent?: boolean },
  form: FormData,
): Promise<ActionResult & { sent?: boolean }> {
  const email = String(form.get('email') ?? '').trim();
  if (!email) return { error: 'An email is needed.' };

  await post('/auth/customer/emailpass/reset-password', { identifier: email });
  // Medusa never says whether the address exists, on purpose; neither do we.
  return { sent: true };
}

export async function completePasswordResetAction(
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const email = String(form.get('email') ?? '').trim();
  const token = String(form.get('token') ?? '');
  const password = String(form.get('password') ?? '');
  if (!token || !email) return { error: 'This link is missing what it needs. Ask for a new one.' };
  if (password.length < 8) return { error: 'The password needs at least eight characters.' };

  const response = await post('/auth/customer/emailpass/update', { email, password }, token);
  if (!response.ok) {
    return { error: 'This link has expired or was already used. Ask for a new one.' };
  }

  const login = await post('/auth/customer/emailpass', { email, password });
  if (login.ok) {
    const { token: sessionToken } = (await login.json()) as { token: string };
    await setSession(sessionToken);
  }
  redirect('/account');
}

/** What "Save this profile" writes to once someone is signed in — the
    fifteen body zones only. A garment's length is a decision about one
    order, not a fact that belongs on the standing profile. */
export async function saveMeasurementProfileAction(
  values: Measurements,
  unit: Unit,
): Promise<{ error?: string }> {
  const customer = await getCustomer();
  if (!customer) return { error: 'Sign in to save a profile.' };
  if (!(await isEmailVerified())) return { error: NOT_VERIFIED };

  const kept = Object.fromEntries(
    Object.entries(customer.metadata ?? {}).filter(
      ([key]) => !key.startsWith('measure_') && key !== 'measurement_unit',
    ),
  );

  const updated = await authedFetch('/store/customers/me', {
    method: 'POST',
    json: { metadata: { ...kept, ...toLineItemMetadata(values, unit, ZONES) } },
  });
  if (!updated) return { error: 'Could not save. Try again in a moment.' };
  revalidatePath('/account');
  return {};
}

/* ---- Settings: profile, password, addresses, and closing the account ----
 * Everything below assumes a session already exists; each checks with
 * `authedFetch`, which returns null rather than throwing when one doesn't.
 */

export async function updateProfileAction(
  _prev: ActionResult & { saved?: boolean },
  form: FormData,
): Promise<ActionResult & { saved?: boolean }> {
  const first_name = String(form.get('first_name') ?? '').trim();
  const last_name = String(form.get('last_name') ?? '').trim();
  const phone = String(form.get('phone') ?? '').trim();
  if (!first_name) return { error: 'A name is needed.' };
  if (!(await isEmailVerified())) return { error: NOT_VERIFIED };

  const updated = await authedFetch('/store/customers/me', {
    method: 'POST',
    json: { first_name, last_name: last_name || null, phone: phone || null },
  });
  if (!updated) return { error: 'Could not save. Try again in a moment.' };
  revalidatePath('/account');
  revalidatePath('/account/settings');
  return { saved: true };
}

export async function changePasswordAction(
  _prev: ActionResult & { saved?: boolean },
  form: FormData,
): Promise<ActionResult & { saved?: boolean }> {
  const current_password = String(form.get('current_password') ?? '');
  const password = String(form.get('password') ?? '');
  if (!current_password || !password) {
    return { error: 'The current and a new password are both needed.' };
  }
  if (password.length < 8) return { error: 'The new password needs at least eight characters.' };

  const result = await authedFetch<{ success?: boolean }>('/store/customers/me/password', {
    method: 'POST',
    json: { current_password, password },
  });
  if (!result) return { error: 'That is not the current password.' };
  return { saved: true };
}

const addressFromForm = (form: FormData) => ({
  address_name: String(form.get('address_name') ?? '').trim() || null,
  first_name: String(form.get('first_name') ?? '').trim() || null,
  last_name: String(form.get('last_name') ?? '').trim() || null,
  address_1: String(form.get('address_1') ?? '').trim() || null,
  address_2: String(form.get('address_2') ?? '').trim() || null,
  city: String(form.get('city') ?? '').trim() || null,
  province: String(form.get('province') ?? '').trim() || null,
  postal_code: String(form.get('postal_code') ?? '').trim() || null,
  country_code: String(form.get('country_code') ?? '').trim().toLowerCase() || null,
  phone: String(form.get('phone') ?? '').trim() || null,
});

export async function addAddressAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const address = addressFromForm(form);
  if (!address.address_1 || !address.city || !address.country_code) {
    return { error: 'An address, a city and a country are all needed.' };
  }

  if (!(await isEmailVerified())) return { error: NOT_VERIFIED };
  const created = await authedFetch('/store/customers/me/addresses', { method: 'POST', json: address });
  if (!created) return { error: 'Could not save that address. Try again in a moment.' };
  revalidatePath('/account/settings');
  return {};
}

export async function updateAddressAction(
  addressId: string,
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const address = addressFromForm(form);
  if (!address.address_1 || !address.city || !address.country_code) {
    return { error: 'An address, a city and a country are all needed.' };
  }

  if (!(await isEmailVerified())) return { error: NOT_VERIFIED };
  const updated = await authedFetch(`/store/customers/me/addresses/${addressId}`, {
    method: 'POST',
    json: address,
  });
  if (!updated) return { error: 'Could not save that address. Try again in a moment.' };
  revalidatePath('/account/settings');
  return {};
}

export async function removeAddressAction(addressId: string) {
  await authedFetch(`/store/customers/me/addresses/${addressId}`, { method: 'DELETE' });
  revalidatePath('/account/settings');
}

export async function deleteAccountAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const password = String(form.get('password') ?? '');
  if (!password) return { error: 'Your password confirms this — enter it to continue.' };

  const result = await authedFetch<{ success?: boolean }>('/store/customers/me/account', {
    method: 'POST',
    json: { password },
  });
  if (!result) return { error: 'That is not the current password.' };

  await clearSession();
  redirect('/account?closed=1');
}

/** Sends the confirmation link again, to the address on the account. */
export async function resendVerificationAction(): Promise<ActionResult & { sent?: boolean }> {
  const token = await getToken();
  if (!token) return { error: 'Sign in first.' };
  const response = await post('/store/customers/me/email-verification', {}, token);
  if (!response.ok) return { error: await readError(response, 'Could not send it. Try again in a moment.') };
  return { sent: true };
}
