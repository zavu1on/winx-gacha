# verify-gacha skill

Verify gacha mechanics correctness by running statistical tests in Node.

## Steps

1. Run pity verification (1000 pulls simulation):
   ```bash
   node -e "
   let pityRare = 0, pityLeg = 0;
   let maxR = 0, maxL = 0;
   for (let i = 0; i < 1000; i++) {
     pityRare++; pityLeg++;
     const legRate = pityLeg < 90 ? 0.006 : Math.min(0.006 + 0.066*(pityLeg-89), 1);
     const rareRate = pityRare < 7 ? 0.051 : Math.min(0.051 + 0.20*(pityRare-6), 1);
     const roll = Math.random();
     if (pityLeg >= 120 || roll < legRate) { pityRare=0; pityLeg=0; }
     else if (pityRare >= 10 || roll < legRate+rareRate) { pityRare=0; }
     maxR = Math.max(maxR, pityRare);
     maxL = Math.max(maxL, pityLeg);
   }
   console.log('Max pityRare:', maxR, '(must be ≤ 10)');
   console.log('Max pityLeg:', maxL, '(must be ≤ 120)');
   console.log(maxR <= 10 && maxL <= 120 ? 'PASS' : 'FAIL');
   "
   ```

2. Verify x10 guarantee (100 simulations):
   All 10-pulls must contain at least 1 Rare or Legendary.

3. Check TypeScript:
   ```bash
   npx tsc --noEmit
   ```

4. Run build:
   ```bash
   npm run build
   ```

## Expected results

- `Max pityRare` ≤ 10
- `Max pityLeg` ≤ 120
- `npx tsc --noEmit` → 0 errors
- `npm run build` → success, no chunk > 1MB
