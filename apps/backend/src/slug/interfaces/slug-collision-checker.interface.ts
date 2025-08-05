/**
 * Interface for slug collision detection
 *
 * This interface allows slug services to check for collisions without directly
 * depending on the Link entity or LinkRepository, maintaining proper separation of concerns.
 */
export interface SlugCollisionChecker {
  /**
   * Check if a slug is already in use
   * @param slug - The slug to check
   * @param namespace - Optional namespace to check within
   * @returns Promise<boolean> - true if slug already exists (collision), false if available
   */
  checkSlugCollision(slug: string, namespace?: string): Promise<boolean>;
}

/**
 * Type alias for collision checker function
 * This can be used as a callback parameter in slug services
 */
export type SlugCollisionCheckerFn = (
  slug: string,
  namespace?: string
) => Promise<boolean>;
