const Service = require('../models/Service');

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createService = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create services' });
  }
  try {
    const { 
      name, category, description, detailedDescription, location, address, area, landmark, latitude, longitude,
      contactNumber, emergencyPhone, email, website, workingHours, status,
      facilities, servicesOffered, requirements, fees, accessibility, onlineServices, complaintType
    } = req.body;
    
    const newService = new Service({
      name, category, description, detailedDescription, location, address, area, landmark, latitude, longitude,
      contactNumber, emergencyPhone, email, website, workingHours, status,
      facilities, servicesOffered, requirements, fees, accessibility, onlineServices, complaintType,
      createdBy: req.user.id
    });
    await newService.save();
    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateService = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update services' });
  }
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedService) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json({ message: 'Service updated', service: updatedService });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete services' });
  }
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
