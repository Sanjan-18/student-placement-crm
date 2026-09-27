export const MAX_ACCEPTED_OFFERS = 2;
export const SECOND_OFFER_MULTIPLIER = 2;

export function canAcceptSecondOffer(currentPackage: number | null | undefined, previousPackage: number | null | undefined) {
  return currentPackage != null && previousPackage != null && currentPackage >= previousPackage * SECOND_OFFER_MULTIPLIER;
}
