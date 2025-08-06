const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense', 'transfer', 'investment', 'trade', 'racing', 'robbery', 'family_work'],
        required: true
    },
    amount: { type: Number, required: true },
    description: String,
    category: String,
    timestamp: { type: Date, default: Date.now }
});

const carSchema = new mongoose.Schema({
    carId: String,
    name: String,
    type: {
        type: String,
        enum: ['economy', 'sports', 'luxury', 'supercar', 'hypercar']
    },
    speed: { type: Number, min: 1, max: 100 },
    acceleration: { type: Number, min: 1, max: 100 },
    handling: { type: Number, min: 1, max: 100 },
    durability: { type: Number, min: 1, max: 100, default: 100 },
    purchasePrice: Number,
    currentValue: Number,
    maintenanceCost: Number,
    raceWins: { type: Number, default: 0 },
    raceLosses: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    dateAcquired: { type: Date, default: Date.now }
});

const petSchema = new mongoose.Schema({
    petId: String,
    name: String,
    type: {
        type: String,
        enum: ['dog', 'cat', 'bird', 'security_dog', 'guard_cat']
    },
    breed: String,
    securityLevel: { type: Number, min: 1, max: 100 },
    happiness: { type: Number, min: 0, max: 100, default: 50 },
    health: { type: Number, min: 0, max: 100, default: 100 },
    hunger: { type: Number, min: 0, max: 100, default: 50 },
    cleanliness: { type: Number, min: 0, max: 100, default: 50 },
    lastFed: Date,
    lastGroomed: Date,
    lastPlayed: Date,
    purchasePrice: Number,
    dateAdopted: { type: Date, default: Date.now }
});

const familyMemberSchema = new mongoose.Schema({
    memberId: String,
    name: String,
    relationship: {
        type: String,
        enum: ['spouse', 'child', 'parent', 'sibling', 'grandparent']
    },
    age: Number,
    profession: String,
    salary: Number,
    bond: { type: Number, min: 0, max: 100, default: 50 },
    workEfficiency: { type: Number, min: 0.5, max: 2.0, default: 1.0 },
    lastTrip: Date,
    totalTrips: { type: Number, default: 0 }
});

const propertySchema = new mongoose.Schema({
    propertyId: String,
    name: String,
    type: {
        type: String,
        enum: ['studio', 'apartment', 'house', 'mansion', 'penthouse', 'estate']
    },
    purchasePrice: Number,
    currentValue: Number,
    monthlyRent: Number,
    utilities: Number,
    securityLevel: { type: Number, min: 1, max: 10, default: 1 },
    maxFamilyMembers: Number,
    hasGarage: { type: Boolean, default: false },
    garageCapacity: { type: Number, default: 0 },
    vaultCapacity: { type: Number, default: 0 },
    condition: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
        default: 'good'
    },
    dateAcquired: Date
});

const roleSchema = new mongoose.Schema({
    roleId: String,
    roleName: String,
    price: Number,
    benefits: {
        workMultiplier: { type: Number, default: 1.0 },
        racingBonus: { type: Number, default: 0 },
        robberyProtection: { type: Number, default: 0 },
        familyBonus: { type: Number, default: 0 }
    },
    datePurchased: { type: Date, default: Date.now },
    expiryDate: Date
});

const economySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    
    // Basic Economy
    wallet: { type: Number, default: 1000, min: 0 },
    bank: { type: Number, default: 0, min: 0 },
    bankLimit: { type: Number, default: 10000 },
    
    // Family System
    familyVault: { type: Number, default: 0, min: 0 },
    familyMembers: [familyMemberSchema],
    familyBond: { type: Number, min: 0, max: 100, default: 50 },
    
    // Vehicle System
    cars: [carSchema],
    activeCar: String, // carId of currently selected car
    
    // Pet System
    pets: [petSchema],
    maxPets: { type: Number, default: 2 },
    
    // Property System
    properties: [propertySchema],
    primaryResidence: String, // propertyId
    
    // Role System
    purchasedRoles: [roleSchema],
    
    // Stats and Progress
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    
    // Racing Stats
    racingStats: {
        totalRaces: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        winStreak: { type: Number, default: 0 }
    },
    
    // Security & Robbery
    lastRobbed: Date,
    robberyAttempts: { type: Number, default: 0 },
    successfulRobberies: { type: Number, default: 0 },
    
    // Cooldowns
    cooldowns: {
        daily: Date,
        work: Date,
        race: Date,
        trip: Date,
        petCare: Date,
        robbery: Date
    },
    
    transactions: [transactionSchema],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamp
economySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Economy', economySchema);