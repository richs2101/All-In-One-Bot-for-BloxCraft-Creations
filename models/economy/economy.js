const Economy = require('./schema');

class EconomyManager {
    // Create or get profile
    static async getProfile(userId, guildId) {
        let profile = await Economy.findOne({ userId, guildId });
        if (!profile) {
            profile = new Economy({
                userId,
                guildId,
                wallet: 1000,
                bank: 0,
                familyVault: 0
            });
            await profile.save();
        }
        return profile;
    }

    // Update wallet
    static async updateWallet(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.wallet = Math.max(0, profile.wallet + amount);
        await profile.save();
        return profile;
    }

    // Update bank
    static async updateBank(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.bank = Math.max(0, profile.bank + amount);
        await profile.save();
        return profile;
    }

    // Family vault operations
    static async updateFamilyVault(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.familyVault = Math.max(0, profile.familyVault + amount);
        await profile.save();
        return profile;
    }

    // Calculate total security level
    static calculateSecurityLevel(profile) {
        let totalSecurity = 0;
        
        // Property security
        const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
        if (primaryProperty) {
            totalSecurity += primaryProperty.securityLevel * 10;
        }
        
        // Pet security
        profile.pets.forEach(pet => {
            const petEfficiency = (pet.happiness + pet.health + pet.cleanliness) / 300;
            totalSecurity += pet.securityLevel * petEfficiency;
        });
        
        // Role bonuses
        profile.purchasedRoles.forEach(role => {
            if (!role.expiryDate || role.expiryDate > new Date()) {
                totalSecurity += role.benefits.robberyProtection;
            }
        });
        
        return Math.min(100, totalSecurity);
    }

    // Calculate work multiplier
    static calculateWorkMultiplier(profile) {
        let multiplier = 1.0;
        
        // Family bond bonus
        const familyBonus = (profile.familyBond / 100) * 0.5;
        multiplier += familyBonus;
        
        // Role bonuses
        profile.purchasedRoles.forEach(role => {
            if (!role.expiryDate || role.expiryDate > new Date()) {
                multiplier += role.benefits.workMultiplier - 1;
            }
        });
        
        return multiplier;
    }
}

module.exports = { Economy, EconomyManager };