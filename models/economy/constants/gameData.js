const CARS = {
    'economy_sedan': {
        name: 'Economy Sedan',
        type: 'economy',
        price: 15000,
        speed: 45,
        acceleration: 40,
        handling: 50,
        maintenanceCost: 200
    },
    'sports_coupe': {
        name: 'Sports Coupe',
        type: 'sports',
        price: 45000,
        speed: 70,
        acceleration: 75,
        handling: 65,
        maintenanceCost: 600
    },
    'luxury_sedan': {
        name: 'Luxury Sedan',
        type: 'luxury',
        price: 80000,
        speed: 60,
        acceleration: 55,
        handling: 80,
        maintenanceCost: 1000
    },
    'supercar': {
        name: 'Supercar',
        type: 'supercar',
        price: 200000,
        speed: 95,
        acceleration: 90,
        handling: 85,
        maintenanceCost: 2500
    },
    'hypercar': {
        name: 'Hypercar',
        type: 'hypercar',
        price: 500000,
        speed: 100,
        acceleration: 100,
        handling: 95,
        maintenanceCost: 5000
    }
};

const PETS = {
    'house_cat': {
        name: 'House Cat',
        type: 'cat',
        price: 500,
        securityLevel: 10,
        breed: 'Domestic'
    },
    'guard_dog': {
        name: 'Guard Dog',
        type: 'security_dog',
        price: 2000,
        securityLevel: 40,
        breed: 'German Shepherd'
    },
    'security_cat': {
        name: 'Security Cat',
        type: 'guard_cat',
        price: 1500,
        securityLevel: 25,
        breed: 'Maine Coon'
    },
    'attack_dog': {
        name: 'Attack Dog',
        type: 'security_dog',
        price: 5000,
        securityLevel: 70,
        breed: 'Rottweiler'
    },
    'surveillance_bird': {
        name: 'Surveillance Parrot',
        type: 'bird',
        price: 3000,
        securityLevel: 35,
        breed: 'Macaw'
    }
};

const PROPERTIES = {
    'studio': {
        name: 'Studio Apartment',
        type: 'studio',
        price: 50000,
        monthlyRent: 800,
        utilities: 150,
        maxFamilyMembers: 1,
        securityLevel: 1,
        vaultCapacity: 10000
    },
    'apartment': {
        name: '2BR Apartment',
        type: 'apartment',
        price: 120000,
        monthlyRent: 1500,
        utilities: 250,
        maxFamilyMembers: 3,
        securityLevel: 2,
        vaultCapacity: 25000,
        hasGarage: true,
        garageCapacity: 1
    },
    'house': {
        name: 'Family House',
        type: 'house',
        price: 300000,
        monthlyRent: 2500,
        utilities: 400,
        maxFamilyMembers: 5,
        securityLevel: 4,
        vaultCapacity: 75000,
        hasGarage: true,
        garageCapacity: 2
    },
    'mansion': {
        name: 'Luxury Mansion',
        type: 'mansion',
        price: 800000,
        monthlyRent: 5000,
        utilities: 800,
        maxFamilyMembers: 8,
        securityLevel: 7,
        vaultCapacity: 200000,
        hasGarage: true,
        garageCapacity: 5
    },
    'estate': {
        name: 'Private Estate',
        type: 'estate',
        price: 2000000,
        monthlyRent: 10000,
        utilities: 1500,
        maxFamilyMembers: 12,
        securityLevel: 10,
        vaultCapacity: 500000,
        hasGarage: true,
        garageCapacity: 10
    }
};

const ROLES = {
    'vip': {
        name: 'VIP Member',
        price: 50000,
        duration: 30, // days
        benefits: {
            workMultiplier: 1.5,
            racingBonus: 1000,
            robberyProtection: 20,
            familyBonus: 0.2
        }
    },
    'premium': {
        name: 'Premium Member',
        price: 100000,
        duration: 30,
        benefits: {
            workMultiplier: 2.0,
            racingBonus: 2500,
            robberyProtection: 40,
            familyBonus: 0.5
        }
    },
    'diamond': {
        name: 'Diamond Elite',
        price: 250000,
        duration: 30,
        benefits: {
            workMultiplier: 3.0,
            racingBonus: 5000,
            robberyProtection: 60,
            familyBonus: 1.0
        }
    }
};

module.exports = { CARS, PETS, PROPERTIES, ROLES };
