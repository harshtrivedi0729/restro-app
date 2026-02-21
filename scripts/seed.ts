import { PrismaClient, RestaurantVibe } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Restaurant 1: Luxury
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: 'The Golden Spoon',
      slug: 'the-golden-spoon',
      description: 'An opulent dining experience where luxury meets culinary artistry',
      vibe: RestaurantVibe.LUXURY,
      targetAudience: 'Wealthy, Gen-Z',
      primaryColor: '#D4AF37',
      secondaryColor: '#1a1a1a',
      accentColor: '#FFD700',
      fontFamily: 'Playfair Display',
      animationIntensity: 'medium',
      darkModeDefault: true,
      address: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 22 1234 5678',
      email: 'info@goldenspoon.com',
      coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
      founderStory: 'Founded in 2015 by renowned chef Rajesh Kumar, The Golden Spoon represents a decade of culinary excellence. What started as a dream to bring world-class fine dining to Mumbai has become a landmark destination for food connoisseurs.',
      chefStory: 'Chef Kumar trained under Michelin-starred chefs in Paris and New York before returning to India. His philosophy combines traditional Indian flavors with modern French techniques, creating a unique culinary identity.',
      awards: [
        { year: 2023, title: 'Best Fine Dining Restaurant - Mumbai', organization: 'Times Food Awards' },
        { year: 2022, title: 'Chef of the Year', organization: 'Indian Culinary Institute' },
      ],
      timeline: [
        { year: 2015, event: 'Restaurant opened in Mumbai' },
        { year: 2018, event: 'First Michelin recognition' },
        { year: 2020, event: 'Expanded to second location' },
        { year: 2023, event: 'Awarded Best Fine Dining' },
      ],
    },
  })

  // Restaurant 2: Romantic
  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: 'Moonlight Terrace',
      slug: 'moonlight-terrace',
      description: 'A romantic rooftop escape with breathtaking city views',
      vibe: RestaurantVibe.ROMANTIC,
      targetAudience: 'Couples, Gen-Z',
      primaryColor: '#E91E63',
      secondaryColor: '#2d1b2e',
      accentColor: '#FF6B9D',
      fontFamily: 'Cormorant Garamond',
      animationIntensity: 'low',
      darkModeDefault: true,
      address: '456 Connaught Place',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 11 2345 6789',
      email: 'hello@moonlightterrace.com',
      coverImageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
      founderStory: 'Moonlight Terrace was born from a love story. Founders Priya and Arjun wanted to create a space where couples could celebrate their special moments under the stars.',
      chefStory: 'Chef Priya specializes in creating dishes that tell a story. Each plate is designed to evoke emotions and create lasting memories.',
    },
  })

  // Restaurant 3: Party
  const restaurant3 = await prisma.restaurant.create({
    data: {
      name: 'Electric Nights',
      slug: 'electric-nights',
      description: 'Where the party never stops and the energy is electric',
      vibe: RestaurantVibe.PARTY,
      targetAudience: 'Gen-Z, Party-goers',
      primaryColor: '#FF6B35',
      secondaryColor: '#1a1a2e',
      accentColor: '#FFB800',
      fontFamily: 'Bebas Neue',
      animationIntensity: 'high',
      darkModeDefault: true,
      address: '789 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '+91 80 3456 7890',
      email: 'party@electricnights.com',
      coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      founderStory: 'Electric Nights was created for the night owls and party enthusiasts. We believe dining should be an experience, not just a meal.',
    },
  })

  // Restaurant 4: Artistic
  const restaurant4 = await prisma.restaurant.create({
    data: {
      name: 'Canvas & Cuisine',
      slug: 'canvas-cuisine',
      description: 'Where art meets food in a symphony of flavors and aesthetics',
      vibe: RestaurantVibe.ARTISTIC,
      targetAudience: 'Art lovers, Gen-Z',
      primaryColor: '#9B59B6',
      secondaryColor: '#2c1810',
      accentColor: '#E74C3C',
      fontFamily: 'Cinzel',
      animationIntensity: 'medium',
      darkModeDefault: true,
      address: '321 Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
      phone: '+91 33 4567 8901',
      email: 'art@canvasandcuisine.com',
      coverImageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200',
      founderStory: 'Canvas & Cuisine is the brainchild of artist-turned-chef Meera Das. Every dish is a masterpiece, every plate a canvas.',
      chefStory: 'Chef Meera brings her artistic vision to the kitchen, creating dishes that are as beautiful as they are delicious.',
    },
  })

  // Create menus and dishes for Restaurant 1
  const menu1 = await prisma.menu.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Main Menu',
      description: 'Our signature dishes crafted with precision and passion',
    },
  })

  const category1 = await prisma.menuCategory.create({
    data: {
      menuId: menu1.id,
      name: 'Appetizers',
      description: 'Start your journey with these exquisite starters',
      order: 1,
    },
  })

  const category2 = await prisma.menuCategory.create({
    data: {
      menuId: menu1.id,
      name: 'Main Course',
      description: 'Our chef\'s signature creations',
      order: 2,
    },
  })

  const category3 = await prisma.menuCategory.create({
    data: {
      menuId: menu1.id,
      name: 'Desserts',
      description: 'Sweet endings to your meal',
      order: 3,
    },
  })

  // Create sample dishes - All Vegetarian
  await prisma.dish.createMany({
    data: [
      {
        restaurantId: restaurant1.id,
        categoryId: category1.id,
        name: 'Truffle Arancini',
        description: 'Crispy risotto balls filled with truffle and parmesan, served with arugula',
        story: 'Inspired by our chef\'s time in Italy, this dish has become our most requested appetizer. The combination of earthy truffle and creamy risotto creates an unforgettable first bite.',
        price: 850,
        protein: 12,
        calories: 320,
        allergens: ['Dairy', 'Gluten'],
        isBestSeller: true,
        isChefRecommend: true,
        isVegetarian: true,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=800&fit=crop',
        ingredients: [
          { name: 'Risotto', icon: '🍚' },
          { name: 'Truffle', icon: '🍄' },
          { name: 'Parmesan', icon: '🧀' },
        ],
        drinkPairings: [
          {
            name: 'Sparkling Elderflower Mocktail',
            type: 'Non-Alcoholic Beverage',
            description: 'The delicate bubbles complement the richness of the truffle',
          },
        ],
        orderCount: 245,
        rating: 4.8,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: category1.id,
        name: 'Caprese Salad',
        description: 'Fresh mozzarella, ripe tomatoes, and basil drizzled with balsamic reduction',
        story: 'A classic Italian appetizer showcasing the finest ingredients. Each component is carefully selected for peak freshness.',
        price: 650,
        protein: 15,
        calories: 280,
        allergens: ['Dairy'],
        isBestSeller: true,
        isVegetarian: true,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=800&fit=crop',
        ingredients: [
          { name: 'Mozzarella', icon: '🧀' },
          { name: 'Tomatoes', icon: '🍅' },
          { name: 'Basil', icon: '🌿' },
        ],
        drinkPairings: [
          {
            name: 'Fresh Mint Lemonade',
            type: 'Non-Alcoholic Beverage',
            description: 'Refreshing citrus notes enhance the fresh flavors',
          },
        ],
        orderCount: 198,
        rating: 4.7,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: category2.id,
        name: 'Wild Mushroom Risotto',
        description: 'Creamy arborio rice with assorted wild mushrooms, truffle oil, and parmesan',
        story: 'Our signature vegetarian main course that rivals any meat dish. The combination of wild mushrooms creates a deep, earthy flavor profile that has become legendary.',
        price: 1200,
        protein: 18,
        calories: 450,
        allergens: ['Dairy', 'Gluten'],
        isBestSeller: true,
        isChefRecommend: true,
        isVegetarian: true,
        imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=800&fit=crop',
        ingredients: [
          { name: 'Wild Mushrooms', icon: '🍄' },
          { name: 'Arborio Rice', icon: '🍚' },
          { name: 'Parmesan', icon: '🧀' },
          { name: 'Truffle Oil', icon: '🫒' },
        ],
        drinkPairings: [
          {
            name: 'Ginger Turmeric Tonic',
            type: 'Non-Alcoholic Beverage',
            description: 'Warming spices complement the earthy mushroom flavors',
          },
        ],
        orderCount: 189,
        rating: 4.9,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: category2.id,
        name: 'Eggplant Parmigiana',
        description: 'Layers of breaded eggplant, marinara sauce, and mozzarella, baked to perfection',
        story: 'A vegetarian masterpiece that has won over even the most dedicated meat lovers. Each layer is carefully crafted for the perfect balance of flavors.',
        price: 950,
        protein: 20,
        calories: 520,
        allergens: ['Dairy', 'Eggs', 'Gluten'],
        isChefRecommend: true,
        isVegetarian: true,
        imageUrl: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800&h=800&fit=crop',
        ingredients: [
          { name: 'Eggplant', icon: '🍆' },
          { name: 'Marinara Sauce', icon: '🍅' },
          { name: 'Mozzarella', icon: '🧀' },
        ],
        drinkPairings: [
          {
            name: 'Italian Soda',
            type: 'Non-Alcoholic Beverage',
            description: 'Sweet and refreshing, perfect with rich Italian flavors',
          },
        ],
        orderCount: 167,
        rating: 4.6,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: category3.id,
        name: 'Chocolate Soufflé',
        description: 'Warm chocolate soufflé with vanilla ice cream and gold leaf',
        story: 'A classic French dessert perfected over years. The secret is in the timing - served at the perfect moment when it\'s still warm and airy.',
        price: 650,
        protein: 8,
        calories: 420,
        allergens: ['Dairy', 'Eggs', 'Gluten'],
        isChefRecommend: true,
        isVegetarian: true,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=800&fit=crop',
        ingredients: [
          { name: 'Dark Chocolate', icon: '🍫' },
          { name: 'Vanilla Ice Cream', icon: '🍨' },
          { name: 'Gold Leaf', icon: '✨' },
        ],
        drinkPairings: [
          {
            name: 'Decaf Espresso',
            type: 'Non-Alcoholic Beverage',
            description: 'Rich coffee notes enhance the chocolate flavors',
          },
        ],
        orderCount: 156,
        rating: 4.7,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: category3.id,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone',
        story: 'Our take on the timeless Italian favorite. Each layer is carefully assembled to create the perfect balance of coffee and cream.',
        price: 550,
        protein: 10,
        calories: 380,
        allergens: ['Dairy', 'Eggs', 'Gluten'],
        isBestSeller: true,
        isVegetarian: true,
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=800&fit=crop',
        ingredients: [
          { name: 'Mascarpone', icon: '🧀' },
          { name: 'Coffee', icon: '☕' },
          { name: 'Cocoa', icon: '🍫' },
        ],
        drinkPairings: [
          {
            name: 'Iced Vanilla Latte',
            type: 'Non-Alcoholic Beverage',
            description: 'Creamy coffee complements the dessert perfectly',
          },
        ],
        orderCount: 203,
        rating: 4.8,
      },
    ],
  })

  // Create tables for QR codes
  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({
      data: {
        restaurantId: restaurant1.id,
        tableNumber: `T${i}`,
        qrCode: `${restaurant1.slug}-T${i}`,
        capacity: i <= 5 ? 4 : 6,
        location: i <= 3 ? 'WINDOW' : i <= 6 ? 'OUTDOOR' : 'PRIVATE',
      },
    })
  }

  // Create menus and dishes for Restaurant 2 (Romantic)
  const menu2 = await prisma.menu.create({
    data: {
      restaurantId: restaurant2.id,
      name: 'Romantic Menu',
      description: 'Perfect dishes to share with someone special',
    },
  })

  const cat2_1 = await prisma.menuCategory.create({
    data: {
      menuId: menu2.id,
      name: 'Romantic Starters',
      description: 'Start your romantic evening',
      order: 1,
    },
  })

  const cat2_2 = await prisma.menuCategory.create({
    data: {
      menuId: menu2.id,
      name: 'Main Course',
      description: 'Hearty vegetarian mains',
      order: 2,
    },
  })

  const cat2_3 = await prisma.menuCategory.create({
    data: {
      menuId: menu2.id,
      name: 'Desserts',
      description: 'Sweet endings',
      order: 3,
    },
  })

  await prisma.dish.createMany({
    data: [
      {
      restaurantId: restaurant2.id,
        categoryId: cat2_1.id,
      name: 'Heart-Shaped Bruschetta',
      description: 'Tomato and basil bruschetta in a heart shape, perfect for sharing',
      price: 450,
      isBestSeller: true,
        isVegetarian: true,
        imageUrl: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800&h=800&fit=crop',
      orderCount: 120,
      rating: 4.6,
    },
    ],
  })

  // Create menus and dishes for Restaurant 3 (Party)
  const menu3 = await prisma.menu.create({
    data: {
      restaurantId: restaurant3.id,
      name: 'Party Menu',
      description: 'Energetic dishes for the party atmosphere',
    },
  })

  const cat3_1 = await prisma.menuCategory.create({
    data: {
      menuId: menu3.id,
      name: 'Starters',
      order: 1,
    },
  })

  await prisma.dish.createMany({
    data: [
      {
        restaurantId: restaurant3.id,
        categoryId: cat3_1.id,
        name: 'Loaded Nachos',
        description: 'Crispy tortilla chips loaded with cheese, jalapeños, and fresh salsa',
        price: 550,
        isBestSeller: true,
        isVegetarian: true,
        isSpicy: true,
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&h=800&fit=crop',
        orderCount: 145,
        rating: 4.5,
      },
    ],
  })

  // Create menus and dishes for Restaurant 4 (Artistic)
  const menu4 = await prisma.menu.create({
    data: {
      restaurantId: restaurant4.id,
      name: 'Artistic Menu',
      description: 'Visually stunning vegetarian creations',
    },
  })

  const cat4_1 = await prisma.menuCategory.create({
    data: {
      menuId: menu4.id,
      name: 'Artistic Creations',
      order: 1,
    },
  })

  await prisma.dish.createMany({
    data: [
      {
        restaurantId: restaurant4.id,
        categoryId: cat4_1.id,
        name: 'Rainbow Buddha Bowl',
        description: 'Colorful array of vegetables, grains, and tahini dressing arranged like art',
        price: 750,
        isChefRecommend: true,
        isVegetarian: true,
        isVegan: true,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=800&fit=crop',
        orderCount: 98,
        rating: 4.7,
      },
    ],
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

