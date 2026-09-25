/**
 * COLDRAW Executive Dining Network — Prototype fixture data
 *
 * ⚠️ すべて架空です。実在の店舗・料理人・体験に関する未確認情報は一切含みません。
 *    All restaurants, chefs and experiences below are fictional, written to be
 *    realistic enough to test the decision experience — nothing here describes
 *    a real venue.
 *
 * 情報構造の原則 / Information model principles:
 *  - `disclosure` は「開示」であって「認証」ではない。Disclosure, never certification.
 *  - COLDRAW が事実として述べられるのは Nature Pack / Nature Cocktail の範囲のみ。
 *  - 店舗全体の Vegan / Halal / Allergen 適合は restaurant-reported として扱う。
 */

export const AREAS = [
  { id: 'ginza', label: 'Ginza', labelJa: '銀座' },
  { id: 'marunouchi', label: 'Marunouchi', labelJa: '丸の内' },
  { id: 'azabudai', label: 'Azabudai', labelJa: '麻布台' },
  { id: 'nihonbashi', label: 'Nihonbashi', labelJa: '日本橋' },
  { id: 'kyoto', label: 'Kyoto', labelJa: '京都' }
];

export const CUISINES = [
  { id: 'japanese', label: 'Japanese' },
  { id: 'kaiseki', label: 'Kaiseki' },
  { id: 'sushi', label: 'Sushi' },
  { id: 'french', label: 'French' },
  { id: 'italian', label: 'Italian' },
  { id: 'innovative', label: 'Innovative' }
];

export const BUDGETS = [
  { id: 'b15', label: '¥15,000+', min: 15000 },
  { id: 'b20', label: '¥20,000+', min: 20000 },
  { id: 'b30', label: '¥30,000+', min: 30000 },
  { id: 'b40', label: '¥40,000+', min: 40000 }
];

export const OCCASIONS = [
  { id: 'client', label: 'Client dinner' },
  { id: 'executive', label: 'Executive dinner' },
  { id: 'international', label: 'International guests' },
  { id: 'celebration', label: 'Celebration' },
  { id: 'quiet', label: 'Quiet conversation' }
];

/**
 * Constraints handled by the Concierge / Dietary layer.
 * `kind: 'reported'` = 店舗申告 / `kind: 'coldraw'` = COLDRAW が確認済の Nature Pack 事実
 */
export const CONSTRAINTS = [
  { id: 'alcoholfree', label: 'Alcohol-free', note: 'No ethanol in any served glass' },
  { id: 'vegan', label: 'Vegan', note: 'No animal-derived ingredients' },
  { id: 'vegetarian', label: 'Vegetarian', note: 'No meat or fish' },
  { id: 'shellfish', label: 'Shellfish allergy', note: 'Crustacean / mollusc' },
  { id: 'nuts', label: 'Tree nut allergy', note: 'Including nut oils' },
  { id: 'gluten', label: 'Gluten', note: 'Wheat, barley, rye' },
  { id: 'dairy', label: 'Dairy-free', note: 'Milk, butter, cream' },
  { id: 'pork', label: 'Pork-free', note: 'Including stock and gelatine' },
  { id: 'beef', label: 'Beef-free', note: 'Including stock' },
  { id: 'raw', label: 'No raw fish', note: 'Cooked or cured only' }
];

export const RESTAURANTS = [
  {
    id: 'koan',
    name: 'Kōan',
    nameJa: '香庵',
    cuisine: 'Kaiseki',
    cuisineTags: ['kaiseki', 'japanese'],
    area: 'ginza',
    areaLabel: 'Ginza',
    established: 2019,
    priceMin: 28000,
    priceMax: 38000,
    palette: ['#1b1a16', '#6d5a3c', '#c9a86a'],
    lede: 'A twelve-seat kaiseki house that treats the glass as a course, not a drink.',
    why: [
      'Three sound-isolated private rooms — the kind where a term sheet can be discussed at normal volume.',
      'The kitchen writes the non-alcohol pairing before the wine list, so the two menus are equal in ambition.',
      'Eleven years of hosting board-level dinners; the service reads the table without being asked.'
    ],
    pairing: {
      courses: 8,
      price: 12000,
      title: 'Eight-glass Nature Pairing',
      note: 'Built course-by-course with the kitchen. Served in the same stemware as the wine pairing — no visual difference at the table.',
      glasses: [
        { name: 'Shiso & Green Almond', base: 'Cold-extracted shiso, green almond, sansho oil', note: 'Opens with the hassun' },
        { name: 'Clear Kombu', base: 'Rishiri kombu, yuzu peel, koji water', note: 'With the clear soup' },
        { name: 'White Peach & Verbena', base: 'Vacuum-extracted white peach, lemon verbena', note: 'With grilled ayu' },
        { name: 'Roasted Barley & Fig', base: 'Roasted barley, black fig, walnut oil', note: 'With the charcoal course' },
        { name: 'Kabosu Nature Cocktail', base: 'COLDRAW Nature Pack — kabosu, hinoki', note: 'Palate reset' },
        { name: 'Aged Hojicha', base: 'Three-year hojicha, low-temperature extraction', note: 'With rice and pickles' },
        { name: 'Fermented Pear', base: 'Pear, koji, sea salt', note: 'Pre-dessert' },
        { name: 'Cacao Husk & Sanshō', base: 'Cacao husk, sanshō, cane', note: 'With wagashi' }
      ]
    },
    bestFor: ['client', 'executive', 'quiet', 'international'],
    practical: {
      privateRooms: '3 rooms (2–8 guests), sound-isolated',
      noise: 'Very quiet — conversation at normal volume',
      seating: 'Counter 8 / Private rooms',
      english: 'Full — menu, service and pairing narration',
      dietary: 'Consultation required 3 days ahead',
      station: 'Ginza Station, 4 min walk',
      leadTime: '3 days',
      smoking: 'Non-smoking throughout'
    },
    capacity: { min: 2, max: 8 },
    attributes: { privateRoom: true, counter: true, quiet: 5, hosting: 5, pairing: 5, english: 5 },
    chef: {
      name: 'Rin Setoguchi',
      title: 'Chef / Owner',
      since: 2019,
      bio: 'Trained in Kyoto, then eight years in Copenhagen fermentation kitchens. Writes the non-alcohol pairing herself, before the food menu is fixed.',
      patrons: 412
    },
    dietary: {
      vegan: 'Full vegan kaiseki available with 3 days notice — dashi rebuilt on kombu and roasted vegetable.',
      vegetarian: 'Available with 3 days notice.',
      allergen: 'Written allergen sheet per course, provided at booking. Shellfish, nut, gluten and dairy substitutions routine.',
      religious: 'Pork-free and beef-free menus can be arranged. No religious certification is held or claimed.',
      ingredients: 'Course-level ingredient list issued in Japanese and English on request.'
    },
    disclosure: {
      lastVerified: '2026-07-14',
      items: [
        { label: 'Alcohol usage (Nature Pack)', value: 'Non-alcoholic. No ethanol added at any stage.', kind: 'coldraw' },
        { label: 'Animal-derived ingredients (Nature Pack)', value: 'None used in the kabosu / hinoki pack.', kind: 'coldraw' },
        { label: 'Allergens (Nature Pack)', value: 'None of the 28 items designated in Japan. Produced on shared equipment.', kind: 'coldraw' },
        { label: 'Manufacturing (Nature Pack)', value: 'Low-temperature, reduced-pressure extraction. Lot code on request.', kind: 'coldraw' },
        { label: 'Restaurant menu composition', value: 'Vegan and pork-free menus available on notice.', kind: 'reported' }
      ]
    },
    coldraw: 'Kōan runs a COLDRAW Brewer at the counter. The kabosu Nature Cocktail is extracted the morning of service.',
    photos: ['dish', 'glass', 'room']
  },

  {
    id: 'ardoise',
    name: 'Ardoise',
    nameJa: 'アルドワーズ',
    cuisine: 'Modern French',
    cuisineTags: ['french', 'innovative'],
    area: 'marunouchi',
    areaLabel: 'Marunouchi',
    established: 2021,
    priceMin: 22000,
    priceMax: 30000,
    palette: ['#16181a', '#3f5a63', '#a9c4c9'],
    lede: 'The Marunouchi room that solved the 7pm problem: dinner that ends clean at 21:30.',
    why: [
      'Four minutes underground from Tokyo Station — no weather, no taxi, no delay for a guest arriving by Shinkansen.',
      'Courses are paced to finish inside two hours without feeling rushed; the kitchen will hold to a stated end time.',
      'The sommelier runs both pairings, so a guest who is not drinking is never handed a different level of attention.'
    ],
    pairing: {
      courses: 6,
      price: 9000,
      title: 'Six-glass Non-Alcohol Pairing',
      note: 'Poured and narrated by the sommelier. Guests can move between the wine and non-alcohol pairing course by course.',
      glasses: [
        { name: 'Clarified Tomato', base: 'Clarified tomato water, basil stem, salt', note: 'With the amuse' },
        { name: 'Smoked Apple', base: 'Cold-smoked apple, celery, verjus', note: 'With scallop' },
        { name: 'Yellow Plum Nature Cocktail', base: 'COLDRAW Nature Pack — yellow plum, thyme', note: 'With langoustine' },
        { name: 'Roasted Corn', base: 'Roasted corn silk, brown butter aroma (dairy-free option)', note: 'With poultry' },
        { name: 'Cabernet Grape & Beetroot', base: 'Pressed cabernet grape, beetroot, black pepper', note: 'With the meat course' },
        { name: 'Coffee Cascara', base: 'Cascara, cane sugar, orange peel', note: 'With dessert' }
      ]
    },
    bestFor: ['client', 'international', 'executive'],
    practical: {
      privateRooms: '2 rooms (4–10 guests)',
      noise: 'Quiet — soft music, well-spaced tables',
      seating: 'Table / Private rooms',
      english: 'Full — French and English service',
      dietary: 'Consultation 2 days ahead',
      station: 'Tokyo Station, 4 min underground',
      leadTime: '2 days',
      smoking: 'Non-smoking'
    },
    capacity: { min: 2, max: 10 },
    attributes: { privateRoom: true, counter: false, quiet: 4, hosting: 5, pairing: 5, english: 5 },
    chef: {
      name: 'Théo Marchand',
      title: 'Chef de Cuisine',
      since: 2021,
      bio: 'Lyon, then Tokyo. Insists the non-alcohol pairing be tasted blind against the wine pairing before either goes on the menu.',
      patrons: 268
    },
    dietary: {
      vegan: 'Vegan menu available with 2 days notice. Stocks rebuilt without animal products.',
      vegetarian: 'Available with 1 day notice.',
      allergen: 'Allergen sheet per course. Dairy-free and gluten-free service is routine.',
      religious: 'Pork-free menu available. Alcohol can be excluded from all cooking on request. No certification claimed.',
      ingredients: 'Ingredient list in English on request.'
    },
    disclosure: {
      lastVerified: '2026-06-30',
      items: [
        { label: 'Alcohol usage (Nature Pack)', value: 'Non-alcoholic. No ethanol added at any stage.', kind: 'coldraw' },
        { label: 'Animal-derived ingredients (Nature Pack)', value: 'None used in the yellow plum / thyme pack.', kind: 'coldraw' },
        { label: 'Allergens (Nature Pack)', value: 'None of the 28 designated items. Shared-equipment production.', kind: 'coldraw' },
        { label: 'Manufacturing (Nature Pack)', value: 'Low-temperature, reduced-pressure extraction. Lot code on request.', kind: 'coldraw' },
        { label: 'Cooking alcohol', value: 'Can be excluded from all courses on request.', kind: 'reported' }
      ]
    },
    coldraw: 'The bar runs a COLDRAW Brewer for the pairing. Extraction happens in the afternoon for the same evening.',
    photos: ['room', 'dish', 'glass']
  },

  {
    id: 'soji',
    name: 'Sōji',
    nameJa: '草滋',
    cuisine: 'Innovative Japanese',
    cuisineTags: ['innovative', 'japanese'],
    area: 'azabudai',
    areaLabel: 'Azabudai',
    established: 2023,
    priceMin: 30000,
    priceMax: 45000,
    palette: ['#141613', '#42583c', '#9dbb8a'],
    lede: 'The kitchen where the non-alcohol pairing is the house pairing — the wine list is the option.',
    why: [
      'The only room on this list where not drinking is the default posture, so no guest has to explain themselves.',
      'A single private room with its own entrance — useful when the guest should not be seen in the main dining room.',
      'Vegetable-led cooking that a heavy-eating guest still leaves satisfied by; this is not a light menu.'
    ],
    pairing: {
      courses: 9,
      price: 14000,
      title: 'Nine-glass House Pairing (non-alcoholic)',
      note: 'The default pairing of the house. Around 70% of guests take it. Wine is available separately.',
      glasses: [
        { name: 'Young Pine', base: 'Cold-extracted young pine, green yuzu', note: 'On arrival' },
        { name: 'Raw Milk Turnip', base: 'Turnip, koji, brown rice (dairy-free)', note: 'With the first vegetable' },
        { name: 'Ash & Pear', base: 'Vegetable ash, pear, sea salt', note: 'With the charcoal course' },
        { name: 'Hinoki Nature Cocktail', base: 'COLDRAW Nature Pack — hinoki, green apple', note: 'Mid-menu' },
        { name: 'Fermented Tomato', base: 'Three-day fermented tomato, shiso stem', note: 'With the broth course' },
        { name: 'Black Sesame', base: 'Black sesame, roasted buckwheat', note: 'With the grain course' },
        { name: 'Cedar Smoke', base: 'Cedar-smoked apple, sanshō', note: 'With the main' },
        { name: 'Chrysanthemum', base: 'Chrysanthemum, honeydew, salt', note: 'Palate reset' },
        { name: 'Burnt Sugar & Yomogi', base: 'Burnt sugar, yomogi, cacao husk', note: 'With dessert' }
      ]
    },
    bestFor: ['executive', 'quiet', 'international', 'celebration'],
    practical: {
      privateRooms: '1 room (2–6 guests), separate entrance',
      noise: 'Very quiet',
      seating: 'Counter 10 / 1 private room',
      english: 'Full',
      dietary: 'Consultation 5 days ahead — the menu is rebuilt, not substituted',
      station: 'Kamiyachō Station, 6 min walk',
      leadTime: '5 days',
      smoking: 'Non-smoking'
    },
    capacity: { min: 2, max: 6 },
    attributes: { privateRoom: true, counter: true, quiet: 5, hosting: 4, pairing: 5, english: 5 },
    chef: {
      name: 'Kanae Horiuchi',
      title: 'Chef / Owner',
      since: 2023,
      bio: 'Opened Sōji after six years running the fermentation programme at a Nordic-Japanese kitchen. Publishes the extraction notes for every glass.',
      patrons: 731
    },
    dietary: {
      vegan: 'The full nine-course menu is vegan by default. Animal products are the exception, added on request.',
      vegetarian: 'Default.',
      allergen: 'Per-course allergen sheet. Nut-free and gluten-free versions of the full menu exist.',
      religious: 'Pork-free, beef-free and alcohol-free cooking is the standing default. No certification claimed.',
      ingredients: 'Full ingredient disclosure published for every course and every glass.'
    },
    disclosure: {
      lastVerified: '2026-08-02',
      items: [
        { label: 'Alcohol usage (Nature Pack)', value: 'Non-alcoholic. No ethanol added at any stage.', kind: 'coldraw' },
        { label: 'Animal-derived ingredients (Nature Pack)', value: 'None used in the hinoki / green apple pack.', kind: 'coldraw' },
        { label: 'Allergens (Nature Pack)', value: 'None of the 28 designated items. Shared-equipment production.', kind: 'coldraw' },
        { label: 'Manufacturing (Nature Pack)', value: 'Low-temperature, reduced-pressure extraction. Lot code on request.', kind: 'coldraw' },
        { label: 'Kitchen default', value: 'No alcohol used in cooking at any time.', kind: 'reported' }
      ]
    },
    coldraw: 'Two COLDRAW Brewers run continuously through service. The hinoki extraction is done to order.',
    photos: ['counter', 'dish', 'glass']
  },

  {
    id: 'rivage',
    name: 'Rivage',
    nameJa: 'リヴァージュ',
    cuisine: 'Seafood / French',
    cuisineTags: ['french', 'innovative'],
    area: 'nihonbashi',
    areaLabel: 'Nihonbashi',
    established: 2020,
    priceMin: 18000,
    priceMax: 26000,
    palette: ['#12171a', '#2f4f5e', '#8fb4c2'],
    lede: 'The dependable Wednesday: serious cooking, no ceremony, out by nine.',
    why: [
      'The right register for a working dinner — good enough to honour the guest, not so grand it becomes the topic.',
      'Two private rooms that take six comfortably, bookable at short notice most weeks.',
      'A four-glass pairing at ¥6,000 that does not feel like the budget option.'
    ],
    pairing: {
      courses: 4,
      price: 6000,
      title: 'Four-glass Non-Alcohol Pairing',
      note: 'Shorter format, built for a two-hour working dinner.',
      glasses: [
        { name: 'Green Tomato & Oyster Leaf', base: 'Green tomato, oyster leaf, salt', note: 'With the raw course' },
        { name: 'Lemon Nature Cocktail', base: 'COLDRAW Nature Pack — lemon, coriander seed', note: 'With shellfish' },
        { name: 'Saffron & Fennel', base: 'Saffron, fennel, white grape', note: 'With the fish main' },
        { name: 'Dark Cherry', base: 'Dark cherry, black tea, cocoa', note: 'With dessert' }
      ]
    },
    bestFor: ['client', 'quiet'],
    practical: {
      privateRooms: '2 rooms (4–6 guests)',
      noise: 'Moderate — lively at the bar, quiet in the rooms',
      seating: 'Table / Counter / Private rooms',
      english: 'Good — menu in English, service conversational',
      dietary: 'Consultation 2 days ahead',
      station: 'Nihonbashi Station, 3 min walk',
      leadTime: '2 days',
      smoking: 'Non-smoking'
    },
    capacity: { min: 2, max: 6 },
    attributes: { privateRoom: true, counter: true, quiet: 3, hosting: 4, pairing: 4, english: 4 },
    chef: {
      name: 'Sae Kobayashi',
      title: 'Chef',
      since: 2020,
      bio: 'Brittany-trained, Nihonbashi-raised. Runs the shortest pairing on the network and defends every glass in it.',
      patrons: 154
    },
    dietary: {
      vegan: 'Possible with 4 days notice — this is a seafood kitchen, so the menu is rewritten rather than adapted.',
      vegetarian: 'Available with 2 days notice.',
      allergen: 'Shellfish is central to the menu; a shellfish-free menu is available but must be arranged at booking.',
      religious: 'Pork-free available. No certification claimed.',
      ingredients: 'Ingredient list on request, Japanese and English.'
    },
    disclosure: {
      lastVerified: '2026-05-19',
      items: [
        { label: 'Alcohol usage (Nature Pack)', value: 'Non-alcoholic. No ethanol added at any stage.', kind: 'coldraw' },
        { label: 'Animal-derived ingredients (Nature Pack)', value: 'None used in the lemon / coriander seed pack.', kind: 'coldraw' },
        { label: 'Allergens (Nature Pack)', value: 'None of the 28 designated items. Shared-equipment production.', kind: 'coldraw' },
        { label: 'Manufacturing (Nature Pack)', value: 'Low-temperature, reduced-pressure extraction. Lot code on request.', kind: 'coldraw' },
        { label: 'Kitchen note', value: 'Shellfish handled throughout the kitchen.', kind: 'reported' }
      ]
    },
    coldraw: 'A COLDRAW Brewer sits behind the bar; the lemon Nature Cocktail is the house aperitif.',
    photos: ['dish', 'glass', 'room']
  },

  {
    id: 'hakuro',
    name: 'Hakuro',
    nameJa: '白露',
    cuisine: 'Sushi',
    cuisineTags: ['sushi', 'japanese'],
    area: 'azabudai',
    areaLabel: 'Azabudai',
    established: 2018,
    priceMin: 30000,
    priceMax: 40000,
    palette: ['#17151a', '#4a4258', '#b6a9c9'],
    lede: 'Counter sushi where the pairing was designed with the shari, not around it.',
    why: [
      'Eight seats, one seating — the room belongs to your table for the evening if you take it whole.',
      'The pairing is built on acidity and temperature rather than sweetness, so it holds up across twenty pieces.',
      'The chef speaks directly to guests in English; a first-time international guest is never left out of the room.'
    ],
    pairing: {
      courses: 7,
      price: 11000,
      title: 'Seven-glass Nature Pairing',
      note: 'Temperature-matched to the neta. Served in tasting glassware at the counter.',
      glasses: [
        { name: 'Cold Kombu', base: 'Kombu, green yuzu, salt', note: 'With the opening pieces' },
        { name: 'Green Shiso', base: 'Shiso, cucumber, rice vinegar', note: 'With white fish' },
        { name: 'Sudachi Nature Cocktail', base: 'COLDRAW Nature Pack — sudachi, sanshō', note: 'With silver-skinned fish' },
        { name: 'Roasted Rice', base: 'Roasted rice, hojicha, sea salt', note: 'With tuna' },
        { name: 'Ginger & Pear', base: 'Young ginger, pear, lime leaf', note: 'Palate reset' },
        { name: 'Warm Mushroom', base: 'Warm shiitake extraction, kombu', note: 'With the egg and anago' },
        { name: 'Muscat & Green Tea', base: 'Muscat, gyokuro, salt', note: 'To close' }
      ]
    },
    bestFor: ['executive', 'international', 'celebration'],
    practical: {
      privateRooms: 'None — counter can be booked whole (8 guests)',
      noise: 'Quiet — single seating',
      seating: 'Counter 8',
      english: 'Full — the chef narrates in English',
      dietary: 'Consultation 4 days ahead',
      station: 'Azabu-jūban Station, 7 min walk',
      leadTime: '4 days',
      smoking: 'Non-smoking'
    },
    capacity: { min: 2, max: 8 },
    attributes: { privateRoom: false, counter: true, quiet: 4, hosting: 4, pairing: 5, english: 5 },
    chef: {
      name: 'Jun Amagai',
      title: 'Chef / Owner',
      since: 2018,
      bio: 'Fifteen years at a Ginza counter before opening eight seats of his own. Tastes the pairing against the rice every morning.',
      patrons: 389
    },
    dietary: {
      vegan: 'Not available — this is a sushi counter and the kitchen will say so rather than improvise.',
      vegetarian: 'Limited vegetable course available; not recommended as a full menu.',
      allergen: 'Shellfish and fish are central. Nut-free and gluten-free (tamari) service available.',
      religious: 'Pork-free by nature of the menu. Alcohol can be excluded from cooking. No certification claimed.',
      ingredients: 'Neta list provided on request.'
    },
    disclosure: {
      lastVerified: '2026-07-01',
      items: [
        { label: 'Alcohol usage (Nature Pack)', value: 'Non-alcoholic. No ethanol added at any stage.', kind: 'coldraw' },
        { label: 'Animal-derived ingredients (Nature Pack)', value: 'None used in the sudachi / sanshō pack.', kind: 'coldraw' },
        { label: 'Allergens (Nature Pack)', value: 'None of the 28 designated items. Shared-equipment production.', kind: 'coldraw' },
        { label: 'Manufacturing (Nature Pack)', value: 'Low-temperature, reduced-pressure extraction. Lot code on request.', kind: 'coldraw' },
        { label: 'Menu composition', value: 'Raw fish throughout. Cooked-only menu not offered.', kind: 'reported' }
      ]
    },
    coldraw: 'The sudachi Nature Cocktail is extracted before service on a COLDRAW Brewer kept behind the counter.',
    photos: ['counter', 'glass', 'dish']
  },

  {
    id: 'almo',
    name: 'Almo',
    nameJa: 'アルモ',
    cuisine: 'Italian',
    cuisineTags: ['italian', 'innovative'],
    area: 'ginza',
    areaLabel: 'Ginza',
    established: 2022,
    priceMin: 20000,
    priceMax: 28000,
    palette: ['#191512', '#6b4230', '#d09a72'],
    lede: 'Warm, conversational Italian for the dinner that needs to build a relationship, not impress one.',
    why: [
      'The warmest room on the list — right when the goal is for a guest to relax rather than be impressed.',
      'Large private room takes twelve, which is rare in Ginza at this level.',
      'Handles mixed tables well: half the party drinking, half not, without the table splitting in two.'
    ],
    pairing: {
      courses: 5,
      price: 7500,
      title: 'Five-glass Non-Alcohol Pairing',
      note: 'Designed to sit alongside the wine pairing at the same table, glass for glass, course for course.',
      glasses: [
        { name: 'Bitter Orange', base: 'Bitter orange, gentian root, salt', note: 'Aperitivo' },
        { name: 'Tomato & Oregano', base: 'Clarified tomato, oregano stem', note: 'With antipasti' },
        { name: 'Bergamot Nature Cocktail', base: 'COLDRAW Nature Pack — bergamot, rosemary', note: 'With primi' },
        { name: 'Roasted Grape', base: 'Roasted grape, balsamic vapour, pepper', note: 'With secondi' },
        { name: 'Espresso Cascara', base: 'Cascara, hazelnut aroma, cane', note: 'With dolci' }
      ]
    },
    bestFor: ['client', 'celebration', 'international'],
    practical: {
      privateRooms: '1 room (6–12 guests)',
      noise: 'Moderate — warm and conversational',
      seating: 'Table / Private room',
      english: 'Full — Italian and English service',
      dietary: 'Consultation 2 days ahead',
      station: 'Higashi-Ginza Station, 5 min walk',
      leadTime: '2 days',
      smoking: 'Non-smoking'
    },
    capacity: { min: 2, max: 12 },
    attributes: { privateRoom: true, counter: false, quiet: 2, hosting: 4, pairing: 4, english: 5 },
    chef: {
      name: 'Marco Bellandi',
      title: 'Chef / Owner',
      since: 2022,
      bio: 'Piedmont, then twelve years in Tokyo. Built the non-alcohol pairing after his own doctor told him to stop drinking at work.',
      patrons: 203
    },
    dietary: {
      vegan: 'Vegan menu available with 2 days notice.',
      vegetarian: 'Available same-week.',
      allergen: 'Gluten-free pasta made in-house. Dairy is heavily used; dairy-free menu needs 3 days notice.',
      religious: 'Pork-free menu available. Alcohol can be excluded from cooking. No certification claimed.',
      ingredients: 'Ingredient list on request.'
    },
    disclosure: {
      lastVerified: '2026-06-11',
      items: [
        { label: 'Alcohol usage (Nature Pack)', value: 'Non-alcoholic. No ethanol added at any stage.', kind: 'coldraw' },
        { label: 'Animal-derived ingredients (Nature Pack)', value: 'None used in the bergamot / rosemary pack.', kind: 'coldraw' },
        { label: 'Allergens (Nature Pack)', value: 'None of the 28 designated items. Shared-equipment production.', kind: 'coldraw' },
        { label: 'Manufacturing (Nature Pack)', value: 'Low-temperature, reduced-pressure extraction. Lot code on request.', kind: 'coldraw' },
        { label: 'Kitchen note', value: 'Dairy used across most courses.', kind: 'reported' }
      ]
    },
    coldraw: 'A COLDRAW Brewer runs at the pass; the bergamot Nature Cocktail is extracted daily.',
    photos: ['room', 'dish', 'glass']
  },

  {
    id: 'tsukikage',
    name: 'Tsukikage',
    nameJa: '月影',
    cuisine: 'Kaiseki',
    cuisineTags: ['kaiseki', 'japanese'],
    area: 'kyoto',
    areaLabel: 'Kyoto — Gion',
    established: 2016,
    priceMin: 35000,
    priceMax: 50000,
    palette: ['#151312', '#5c4038', '#c39b86'],
    lede: 'A machiya with four rooms, for the dinner that has to be remembered for ten years.',
    why: [
      'A converted machiya where every party has its own room and its own garden view — the guest never meets another table.',
      'The register for a founder-to-founder dinner or a farewell; the room does the work before the food arrives.',
      'The pairing draws on the same producers as the kitchen, so the glass and the plate share a season.'
    ],
    pairing: {
      courses: 8,
      price: 13000,
      title: 'Eight-glass Seasonal Pairing (non-alcoholic)',
      note: 'Changes every two weeks with the kitchen. Producers are named on the menu card.',
      glasses: [
        { name: 'Spring Water & Sanshō', base: 'Local spring water, green sanshō', note: 'On arrival' },
        { name: 'Kamo Aubergine', base: 'Kamo aubergine, white sesame', note: 'With the vegetable course' },
        { name: 'Clear Hamo Broth', base: 'Kombu, green plum, salt', note: 'With the soup' },
        { name: 'Yuzu Nature Cocktail', base: 'COLDRAW Nature Pack — yuzu, hinoki', note: 'Mid-menu' },
        { name: 'Charcoal Peach', base: 'Charcoal-grilled peach, verbena', note: 'With the grilled course' },
        { name: 'Uji Gyokuro', base: 'Low-temperature gyokuro', note: 'With rice' },
        { name: 'Kuromame', base: 'Roasted black soybean, cane', note: 'Pre-dessert' },
        { name: 'Matcha & Cacao', base: 'Matcha, cacao husk, salt', note: 'With wagashi' }
      ]
    },
    bestFor: ['celebration', 'executive', 'international', 'quiet'],
    practical: {
      privateRooms: '4 rooms (2–8 guests), each with garden view',
      noise: 'Silent — rooms do not adjoin',
      seating: 'Private rooms only',
      english: 'Good — English menu, service supported by a interpreter on request',
      dietary: 'Consultation 7 days ahead',
      station: 'Gion-Shijō Station, 8 min walk',
      leadTime: '7 days',
      smoking: 'Non-smoking'
    },
    capacity: { min: 2, max: 8 },
    attributes: { privateRoom: true, counter: false, quiet: 5, hosting: 5, pairing: 5, english: 4 },
    chef: {
      name: 'Sōichirō Nakatani',
      title: 'Chef / Owner',
      since: 2016,
      bio: 'Third generation. Was the first kaiseki house in the network to put the non-alcohol pairing on the same page as the sake list.',
      patrons: 566
    },
    dietary: {
      vegan: 'Shōjin-style vegan kaiseki available with 7 days notice.',
      vegetarian: 'Available with 5 days notice.',
      allergen: 'Written allergen sheet per course. Dashi contains katsuo unless kombu-only is requested.',
      religious: 'Pork-free, beef-free and alcohol-free cooking available on notice. No certification claimed.',
      ingredients: 'Producer and ingredient list issued with the menu card.'
    },
    disclosure: {
      lastVerified: '2026-07-28',
      items: [
        { label: 'Alcohol usage (Nature Pack)', value: 'Non-alcoholic. No ethanol added at any stage.', kind: 'coldraw' },
        { label: 'Animal-derived ingredients (Nature Pack)', value: 'None used in the yuzu / hinoki pack.', kind: 'coldraw' },
        { label: 'Allergens (Nature Pack)', value: 'None of the 28 designated items. Shared-equipment production.', kind: 'coldraw' },
        { label: 'Manufacturing (Nature Pack)', value: 'Low-temperature, reduced-pressure extraction. Lot code on request.', kind: 'coldraw' },
        { label: 'Dashi composition', value: 'Katsuo-based unless kombu-only is requested at booking.', kind: 'reported' }
      ]
    },
    coldraw: 'The yuzu Nature Cocktail is extracted on a COLDRAW Brewer kept in the tea preparation room.',
    photos: ['room', 'dish', 'glass']
  },

  {
    id: 'sekitei',
    name: 'Sekitei',
    nameJa: '石亭',
    cuisine: 'Charcoal Japanese',
    cuisineTags: ['japanese', 'innovative'],
    area: 'nihonbashi',
    areaLabel: 'Nihonbashi',
    established: 2017,
    priceMin: 24000,
    priceMax: 32000,
    palette: ['#141414', '#4d4238', '#b39c80'],
    lede: 'Charcoal cooking with the volume of a steakhouse and the quiet of a tea room.',
    why: [
      'For the guest who expects a substantial dinner — the charcoal courses carry the meal without wine doing the work.',
      'Private rooms hold ten, with a separate lift from the lobby.',
      'Late kitchen: last order 21:30, which absorbs a meeting that runs over.'
    ],
    pairing: {
      courses: 6,
      price: 9500,
      title: 'Six-glass Nature Pairing',
      note: 'Built around smoke, roast and umami rather than fruit — designed not to tire across a long meal.',
      glasses: [
        { name: 'Cold Sencha', base: 'Cold-extracted sencha, salt', note: 'On arrival' },
        { name: 'Roasted Kombu', base: 'Roasted kombu, dried shiitake', note: 'With the opening bites' },
        { name: 'Charred Leek', base: 'Charred leek, apple, black pepper', note: 'With vegetables' },
        { name: 'Sanshō Nature Cocktail', base: 'COLDRAW Nature Pack — sanshō, green plum', note: 'Before the meat' },
        { name: 'Roasted Barley & Plum', base: 'Roasted barley, umeboshi, cane', note: 'With the charcoal main' },
        { name: 'Hojicha & Cacao', base: 'Hojicha, cacao husk', note: 'With dessert' }
      ]
    },
    bestFor: ['client', 'executive'],
    practical: {
      privateRooms: '3 rooms (4–10 guests), separate lift',
      noise: 'Quiet — charcoal noise contained in the open kitchen',
      seating: 'Counter 12 / Private rooms',
      english: 'Good — English menu, some English service',
      dietary: 'Consultation 3 days ahead',
      station: 'Mitsukoshimae Station, 2 min walk',
      leadTime: '3 days',
      smoking: 'Non-smoking'
    },
    capacity: { min: 2, max: 10 },
    attributes: { privateRoom: true, counter: true, quiet: 4, hosting: 4, pairing: 4, english: 3 },
    chef: {
      name: 'Hideto Kurata',
      title: 'Chef',
      since: 2017,
      bio: 'Built his own charcoal grill and then spent two years making a pairing that could stand next to it without sugar.',
      patrons: 141
    },
    dietary: {
      vegan: 'Available with 4 days notice — charcoal vegetable menu.',
      vegetarian: 'Available with 2 days notice.',
      allergen: 'Allergen sheet per course. Soy and wheat used throughout; gluten-free needs 3 days notice.',
      religious: 'Pork-free and beef-free menus available. No certification claimed.',
      ingredients: 'Ingredient list on request.'
    },
    disclosure: {
      lastVerified: '2026-04-22',
      items: [
        { label: 'Alcohol usage (Nature Pack)', value: 'Non-alcoholic. No ethanol added at any stage.', kind: 'coldraw' },
        { label: 'Animal-derived ingredients (Nature Pack)', value: 'None used in the sanshō / green plum pack.', kind: 'coldraw' },
        { label: 'Allergens (Nature Pack)', value: 'None of the 28 designated items. Shared-equipment production.', kind: 'coldraw' },
        { label: 'Manufacturing (Nature Pack)', value: 'Low-temperature, reduced-pressure extraction. Lot code on request.', kind: 'coldraw' },
        { label: 'Kitchen note', value: 'Soy and wheat used across most courses.', kind: 'reported' }
      ]
    },
    coldraw: 'A COLDRAW Brewer runs in the prep kitchen; the sanshō Nature Cocktail is extracted each afternoon.',
    photos: ['counter', 'dish', 'glass']
  }
];

export const byId = (id) => RESTAURANTS.find((r) => r.id === id);

export const yen = (n) => '¥' + n.toLocaleString('en-US');

// ¥28,000–38,000 — the second ¥ is noise at card size.
export const priceLabel = (r) => `${yen(r.priceMin)}–${r.priceMax.toLocaleString('en-US')}`;

export const areaLabel = (id) => (AREAS.find((a) => a.id === id) || {}).label || id;

export const occasionLabel = (id) => (OCCASIONS.find((o) => o.id === id) || {}).label || id;

export const constraintLabel = (id) => (CONSTRAINTS.find((c) => c.id === id) || {}).label || id;

/**
 * 秘書・経営者どちらの導線からも同じ関数で候補を出す。
 * Returns [{ restaurant, score, reasons[] }] sorted best-first.
 */
export function matchRestaurants(query) {
  const { area, party = 2, privateRoom, budget, cuisine, pairing, occasion } = query;
  const budgetMin = budget ? (BUDGETS.find((b) => b.id === budget) || {}).min : null;

  return RESTAURANTS.map((r) => {
    let score = 0;
    const reasons = [];
    const blockers = [];

    if (area && r.area === area) {
      score += 30;
      reasons.push(`In ${r.areaLabel}`);
    } else if (area) {
      score -= 40;
    }

    if (party > r.capacity.max) {
      blockers.push(`Takes up to ${r.capacity.max} guests`);
      score -= 60;
    } else if (party >= 4 && r.capacity.max >= party) {
      score += 8;
    }

    if (privateRoom) {
      if (r.attributes.privateRoom) {
        score += 25;
        reasons.push(`Private room for ${party}`);
      } else if (r.attributes.counter && party <= r.capacity.max) {
        score += 4;
        reasons.push('Counter bookable whole — no private room');
      } else {
        blockers.push('No private room');
        score -= 45;
      }
    }

    if (budgetMin) {
      if (r.priceMax >= budgetMin && r.priceMin <= budgetMin * 1.6) {
        score += 18;
        // the card already prints the price — say what it means, not what it is
        reasons.push('Sits inside the stated budget');
      } else if (r.priceMin > budgetMin * 1.6) {
        score -= 20;
        blockers.push(`Above the stated budget (${priceLabel(r)})`);
      } else {
        score -= 8;
      }
    }

    if (cuisine) {
      if (r.cuisineTags.includes(cuisine)) {
        score += 22;
        reasons.push(r.cuisine);
      } else {
        score -= 30;
      }
    }

    if (pairing) {
      score += r.attributes.pairing * 9;
      if (r.attributes.pairing === 5) {
        reasons.push(`${r.pairing.courses}-glass non-alcohol pairing, ${yen(r.pairing.price)}`);
      } else {
        reasons.push(`${r.pairing.courses}-glass pairing, ${yen(r.pairing.price)}`);
      }
    }

    if (occasion) {
      if (r.bestFor.includes(occasion)) {
        score += 16;
        reasons.push(`Regularly used for ${occasionLabel(occasion).toLowerCase()}s`);
      } else {
        score -= 6;
      }
    }

    score += r.attributes.hosting * 4 + r.attributes.quiet * 2;

    return { restaurant: r, score, reasons: reasons.slice(0, 3), blockers };
  })
    .sort((a, b) => b.score - a.score);
}

/**
 * Concierge: constraint 適合を「開示された事実」として返す。認証はしない。
 * level: 'strong' | 'workable' | 'not-recommended'
 */
export function assessConstraints(r, constraintIds) {
  return constraintIds.map((id) => {
    let level = 'workable';
    let detail = '';

    switch (id) {
      case 'alcoholfree':
        level = r.attributes.pairing >= 4 ? 'strong' : 'workable';
        detail = `${r.pairing.courses}-glass non-alcohol pairing, ${yen(r.pairing.price)}. ${r.dietary.religious.includes('Alcohol can be excluded') || r.id === 'soji' ? 'Cooking alcohol can be excluded.' : 'Ask about cooking alcohol at booking.'}`;
        break;
      case 'vegan':
        level = /Not available/.test(r.dietary.vegan) ? 'not-recommended' : (r.id === 'soji' ? 'strong' : 'workable');
        detail = r.dietary.vegan;
        break;
      case 'vegetarian':
        level = /not recommended/i.test(r.dietary.vegetarian) ? 'not-recommended' : 'strong';
        detail = r.dietary.vegetarian;
        break;
      case 'shellfish':
        level = r.id === 'rivage' || r.id === 'hakuro' ? 'not-recommended' : 'workable';
        detail = r.dietary.allergen;
        break;
      case 'nuts':
      case 'gluten':
      case 'dairy':
        level = 'workable';
        detail = r.dietary.allergen;
        break;
      case 'pork':
      case 'beef':
        level = 'workable';
        detail = r.dietary.religious;
        break;
      case 'raw':
        level = r.id === 'hakuro' ? 'not-recommended' : 'workable';
        detail = r.id === 'hakuro' ? 'Raw fish throughout; a cooked-only menu is not offered.' : 'Cooked-only menu can be arranged at booking.';
        break;
      default:
        detail = 'Ask at booking.';
    }

    return { id, label: constraintLabel(id), level, detail };
  });
}
