const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

const SHOP_ITEMS = {
    'pet_food': {
        name: 'Premium Pet Food',
        price: 200,
        description: 'Instantly restores 40 hunger and 10 health to all pets',
        category: 'pet_care'
    },
    'car_repair': {
        name: 'Car Repair Kit',
        price: 1500,
        description: 'Restores 30 durability to your active car',
        category: 'vehicle'
    },
    'security_upgrade': {
        name: 'Home Security System',
        price: 5000,
        description: 'Permanently increases your property security by 2 levels',
        category: 'security'
    },
    'family_vacation': {
        name: 'Family Vacation Package',
        price: 3000,
        description: 'Increases all family member bonds by 15%',
        category: 'family'
    },
    'lucky_charm': {
        name: 'Lucky Charm',
        price: 10000,
        description: 'Increases work earnings by 50% for 7 days',
        category: 'boost'
    }
};

module.exports = {
    name: 'shop',
    description: 'Browse and buy special items',
    usage: '!shop [buy <item_id>]',
    async execute(message, args) {
        if (!args[0]) {
           
            const shopList = Object.entries(SHOP_ITEMS).map(([id, item]) => 
                `**${id}** - ${item.name} - ${item.price}\n   ${item.description}`
            ).join('\n\n');
            
            const embed = new EmbedBuilder()
                .setTitle('🛒 Special Items Shop')
                .setDescription(shopList)
                .setColor('#9C27B0')
                .setFooter({ text: 'Use !shop buy <item_id> to purchase' })
                .setTimestamp();
                
            return message.reply({ embeds: [embed] });
        }
        
        if (args[0] === 'buy' && args[1]) {
            const itemId = args[1].toLowerCase();
            const item = SHOP_ITEMS[itemId];
            
            if (!item) {
                return message.reply('❌ Invalid item ID! Use `!shop` to see available items.');
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.wallet < item.price) {
                return message.reply(`❌ You need ${item.price} to buy this item!`);
            }
            
            profile.wallet -= item.price;
            
          
            let effectDescription = '';
            
            switch (itemId) {
                case 'pet_food':
                    profile.pets.forEach(pet => {
                        pet.hunger = Math.min(100, pet.hunger + 40);
                        pet.health = Math.min(100, pet.health + 10);
                    });
                    effectDescription = `Fed all ${profile.pets.length} pets!`;
                    break;
                    
                case 'car_repair':
                    const car = profile.cars.find(c => c.carId === profile.activeCar);
                    if (car) {
                        car.durability = Math.min(100, car.durability + 30);
                        effectDescription = `Repaired ${car.name} (+30 durability)!`;
                    } else {
                        profile.wallet += item.price; // Refund
                        return message.reply('❌ You need an active car to use this item!');
                    }
                    break;
                    
                case 'security_upgrade':
                    const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
                    if (primaryProperty) {
                        primaryProperty.securityLevel = Math.min(10, primaryProperty.securityLevel + 2);
                        effectDescription = `Upgraded ${primaryProperty.name} security!`;
                    } else {
                        profile.wallet += item.price; // Refund
                        return message.reply('❌ You need to own a property to use this item!');
                    }
                    break;
                    
                case 'family_vacation':
                    profile.familyMembers.forEach(member => {
                        member.bond = Math.min(100, member.bond + 15);
                    });
                    const newFamilyBond = profile.familyMembers.length > 0 ? 
                        Math.floor(profile.familyMembers.reduce((sum, m) => sum + m.bond, 0) / profile.familyMembers.length) : 0;
                    profile.familyBond = newFamilyBond;
                    effectDescription = `Improved all family bonds by 15%!`;
                    break;
                    
                case 'lucky_charm':
                    effectDescription = `Lucky charm activated for 7 days!`;
                    break;
            }
            
            await profile.save();
            
            const embed = new EmbedBuilder()
                .setTitle('🛒 Item Purchased!')
                .setDescription(`You bought **${item.name}** for ${item.price}!`)
                .addFields({
                    name: '✨ Effect',
                    value: effectDescription
                })
                .setColor('#4CAF50')
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
        }
    }
};