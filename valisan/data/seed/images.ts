/**
 * Curated royalty-free photography (Unsplash License — free for commercial use, no attribution required).
 * Every slot lists 2–3 candidates; the <Photo> component falls through to the next one on load error and
 * finally to a brand gradient, so a removed photo never renders as a broken image.
 * Swap any ID here to re-art-direct the whole site. Format: https://images.unsplash.com/<id>?auto=format&fit=crop&q=80&w=<px>
 */
import type { BlogCategory, Modality } from '@/domain/types';

export const unsplash = (id: string, w = 1200, h?: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}${h ? `&h=${h}` : ''}`;
const set = (ids: string[], w = 1200, h?: number) => ids.map((id) => unsplash(id, w, h));

// ── Subjects ────────────────────────────────────────────────────────────────
const REFORMER = 'photo-1588286840104-8957b019727f';      // woman on a wooden reformer, soft daylight
const MAT_STRETCH = 'photo-1518611012118-696072aa579a';   // floor stretch on a mat, ivory light
const YOGA_WARRIOR = 'photo-1544367567-0f2fcb009e0b';     // calm standing yoga pose
const YOGA_CLASS = 'photo-1545205597-3d9d02c29597';       // small yoga class on mats
const YOGA_DAWN = 'photo-1506126613408-eca07ce68773';     // serene yoga at first light
const HOME_YOGA = 'photo-1552196563-55cd4e45efb3';        // gentle mat practice, warm interior
const MEDITATION = 'photo-1518310383802-640c2de311b2';    // seated meditation
const CLASS_LIGHT = 'photo-1575052814086-f385e2e2ad1b';   // bright studio class
const STRETCH_SIDE = 'photo-1510894347713-fc3ed6fdf539';  // side stretch, alignment
const PLANTS_YOGA = 'photo-1603988363607-e1e4a66962c6';   // yoga at home with plants
const MOBILITY = 'photo-1549576490-b0b4831ef60a';         // mobility flow
const STRENGTH_SOFT = 'photo-1571019614242-c5c5dee9f50b'; // light dumbbells, studio
const STUDIO_WOMEN = 'photo-1574680096145-d05b474e2155';  // women training in a bright studio
const HOME_STRENGTH = 'photo-1583454110551-21f2fa2afe61'; // soft strength at home
const INTERIOR_MINIMAL = 'photo-1600210492486-724fe5c67fb0'; // Japandi interior
const INTERIOR_WARM = 'photo-1586023492125-27b2c045efd7';    // warm minimalist room
const SPA_STONES = 'photo-1540555700478-4be289fbecef';       // spa stones, calm
const SPA_MASSAGE = 'photo-1571902943202-507ec2618e8f';      // recovery / massage
const BOWL_GREEN = 'photo-1512621776951-a57141f2eefd';       // plant-based bowl
const BREAKFAST = 'photo-1490645935967-10de6ba17061';        // clean breakfast bowl
const SALAD_TOP = 'photo-1540420773420-3366772f4999';        // overhead salad
const FRUIT_TABLE = 'photo-1498837167922-ddd27525d352';      // fresh produce
const BED_LINEN = 'photo-1515377905703-c4788e51af15';        // soft bed, sleep
const BED_MORNING = 'photo-1522771739844-6a9f6d5f14af';      // morning light on linen
const PORTRAIT_A = 'photo-1573496359142-b8d87734a5a2';       // elegant professional portrait
const PORTRAIT_B = 'photo-1494790108377-be9c29b29330';       // warm portrait
const PORTRAIT_C = 'photo-1524504388940-b1c1722653e1';       // soft studio portrait
const PORTRAIT_D = 'photo-1531746020798-e6953c6e8e04';       // natural-light portrait
const PORTRAIT_E = 'photo-1580489944761-15a19d654956';       // smiling portrait
const PORTRAIT_F = 'photo-1544005313-94ddf0286df2';          // neutral studio portrait
const PORTRAIT_G = 'photo-1517841905240-472988babdf9';       // warm-toned portrait
const PORTRAIT_H = 'photo-1534528741775-53994a69daeb';       // editorial portrait
const PORTRAIT_I = 'photo-1508214751196-bcfd4ca60f91';       // gentle portrait
const PORTRAIT_J = 'photo-1438761681033-6461ffad8d80';       // bright portrait

export const IMAGES = {
  hero: set([REFORMER, STUDIO_WOMEN, MAT_STRETCH], 1400),
  heroThumb: set([YOGA_CLASS, CLASS_LIGHT], 400, 300),
  about: set([INTERIOR_MINIMAL, INTERIOR_WARM, REFORMER], 1200),
  cta: set([YOGA_DAWN, YOGA_CLASS, MAT_STRETCH], 1600, 700),
  studio: [
    set([REFORMER, STUDIO_WOMEN], 900, 1100),
    set([INTERIOR_MINIMAL, INTERIOR_WARM], 900, 700),
    set([SPA_STONES, SPA_MASSAGE], 900, 700),
    set([MAT_STRETCH, HOME_YOGA], 900, 1100),
  ],
  modality: {
    pilates_reformer: set([REFORMER, STUDIO_WOMEN, MAT_STRETCH], 800, 600),
    pilates_mat: set([MAT_STRETCH, HOME_YOGA, CLASS_LIGHT], 800, 600),
    yoga_hatha: set([YOGA_WARRIOR, YOGA_DAWN, YOGA_CLASS], 800, 600),
    yoga_vinyasa: set([YOGA_CLASS, CLASS_LIGHT, YOGA_WARRIOR], 800, 600),
    corrective: set([STRETCH_SIDE, MAT_STRETCH, HOME_YOGA], 800, 600),
    postpartum: set([PLANTS_YOGA, MEDITATION, HOME_YOGA], 800, 600),
    mobility: set([MOBILITY, STRETCH_SIDE, YOGA_WARRIOR], 800, 600),
    strength: set([STRENGTH_SOFT, HOME_STRENGTH, STUDIO_WOMEN], 800, 600),
  } satisfies Record<Modality, string[]>,
  coach: {
    c1: set([PORTRAIT_A, PORTRAIT_E, PORTRAIT_J], 600, 600),
    c2: set([PORTRAIT_B, PORTRAIT_F, PORTRAIT_G], 600, 600),
    c3: set([PORTRAIT_C, PORTRAIT_H, PORTRAIT_I], 600, 600),
    c4: set([PORTRAIT_D, PORTRAIT_E, PORTRAIT_F], 600, 600),
  } as Record<string, string[]>,
  blog: {
    'protein-for-women-strength': set([BOWL_GREEN, BREAKFAST, SALAD_TOP], 800, 600),
    'anti-inflammatory-plate': set([FRUIT_TABLE, SALAD_TOP, BOWL_GREEN], 800, 600),
    'desk-posture-reset': set([STRETCH_SIDE, MAT_STRETCH, HOME_YOGA], 800, 600),
    'core-not-abs': set([REFORMER, MAT_STRETCH, STUDIO_WOMEN], 800, 600),
    'breath-before-movement': set([MEDITATION, YOGA_DAWN, YOGA_WARRIOR], 800, 600),
    'five-minute-stillness': set([YOGA_DAWN, MEDITATION, SPA_STONES], 800, 600),
    'sleep-is-training': set([BED_LINEN, BED_MORNING, SPA_STONES], 800, 600),
    'active-recovery-days': set([MOBILITY, SPA_MASSAGE, YOGA_WARRIOR], 800, 600),
  } as Record<string, string[]>,
  blogCategory: {
    nutrition: set([BOWL_GREEN, BREAKFAST], 800, 600),
    corrective: set([STRETCH_SIDE, MAT_STRETCH], 800, 600),
    mindfulness: set([MEDITATION, YOGA_DAWN], 800, 600),
    recovery: set([BED_LINEN, SPA_MASSAGE], 800, 600),
  } satisfies Record<BlogCategory, string[]>,
};

export const coachPhotos = (coachId: string) => IMAGES.coach[coachId] ?? [];
export const blogPhotos = (slug: string, category: BlogCategory) => IMAGES.blog[slug] ?? IMAGES.blogCategory[category];
