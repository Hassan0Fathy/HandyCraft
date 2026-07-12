const Promo = require('../models/Promo');

exports.createPromo = async (req, res) => {
  try {
    const promo = new Promo(req.body);
    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promo) return res.status(404).json({ message: 'Promo code not found' });
    res.json(promo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePromo = async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validatePromo = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const promo = await Promo.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!promo) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }
    
    if (promo.expirationDate && new Date() > promo.expirationDate) {
      return res.status(400).json({ message: 'Promo expired' });
    }
    
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ message: 'Promo usage limit reached' });
    }
    
    if (orderAmount < promo.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of EGP ${promo.minOrderAmount} required`,
        minOrderAmount: promo.minOrderAmount 
      });
    }
    
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (orderAmount * promo.discountValue) / 100;
    } else {
      discount = promo.discountValue;
    }
    
    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, orderAmount);
    
    res.json({
      code: promo.code,
      discountAmount: discount,
      discountType: promo.discountType,
      discountValue: promo.discountValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
