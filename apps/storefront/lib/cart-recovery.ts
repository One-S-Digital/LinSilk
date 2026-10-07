/* Adding a line to a cart that has since been completed.
 *
 * A cart can be closed behind this page's back — paid for in another tab, or
 * by a payment that finished after the page was left — and Medusa then refuses
 * new lines on it. The id this page remembers would fail every attempt until a
 * reload. So when an add is refused, the cart is asked about; only if it is
 * known to be closed is a new one started and the line added there, once.
 * Anything else is the house's own refusal of the line, or a failure to reach
 * it, and is passed on untouched — a cart that cannot be shown to be closed is
 * never let go of. */
export async function addWithRecovery<T>({
  cartId,
  post,
  isCompleted,
  startCart,
}: {
  cartId: string;
  post: (cartId: string) => Promise<T>;
  /** Whether the cart is known to be closed; false when that cannot be told. */
  isCompleted: (cartId: string) => Promise<boolean>;
  /** Opens a new cart and returns its id. */
  startCart: () => Promise<string>;
}): Promise<T> {
  try {
    return await post(cartId);
  } catch (error) {
    if (!(await isCompleted(cartId))) throw error;
    return post(await startCart());
  }
}
