import { describe, expect, it, vi } from 'vitest';
import { addWithRecovery } from './cart-recovery';

/* A cart can be closed behind this page's back — paid for in another tab, or
   by a payment that finished after the page was left — and Medusa refuses new
   lines on it. The id this page holds then fails every attempt until a reload. */

const refusal = new Error('Cart is already completed.');

describe('addWithRecovery', () => {
  it('adds to the cart it holds, and asks nothing else', async () => {
    const post = vi.fn(async (cartId: string) => `added to ${cartId}`);
    const isCompleted = vi.fn(async () => false);
    const startCart = vi.fn(async () => 'cart_new');

    await expect(addWithRecovery({ cartId: 'cart_old', post, isCompleted, startCart })).resolves.toBe(
      'added to cart_old',
    );
    expect(isCompleted).not.toHaveBeenCalled();
    expect(startCart).not.toHaveBeenCalled();
  });

  it('starts a new cart and adds there once when the held cart has been completed', async () => {
    const post = vi.fn(async (cartId: string) => {
      if (cartId === 'cart_old') throw refusal;
      return `added to ${cartId}`;
    });
    const startCart = vi.fn(async () => 'cart_new');

    await expect(
      addWithRecovery({ cartId: 'cart_old', post, isCompleted: async () => true, startCart }),
    ).resolves.toBe('added to cart_new');
    expect(post.mock.calls.map(([id]) => id)).toEqual(['cart_old', 'cart_new']);
    expect(startCart).toHaveBeenCalledTimes(1);
  });

  it('keeps the held cart and the original error when the cart is still open', async () => {
    const startCart = vi.fn(async () => 'cart_new');
    const rule = new Error('Each piece is cut for one person.');

    await expect(
      addWithRecovery({
        cartId: 'cart_open',
        post: async () => {
          throw rule;
        },
        isCompleted: async () => false,
        startCart,
      }),
    ).rejects.toBe(rule);
    expect(startCart).not.toHaveBeenCalled();
  });

  it('does not try a third time when the new cart refuses the line too', async () => {
    const rule = new Error('A piece from a closed season.');
    const post = vi.fn(async (cartId: string) => {
      throw cartId === 'cart_old' ? refusal : rule;
    });
    const startCart = vi.fn(async () => 'cart_new');

    await expect(
      addWithRecovery({ cartId: 'cart_old', post, isCompleted: async () => true, startCart }),
    ).rejects.toBe(rule);
    expect(post).toHaveBeenCalledTimes(2);
    expect(startCart).toHaveBeenCalledTimes(1);
  });
});
