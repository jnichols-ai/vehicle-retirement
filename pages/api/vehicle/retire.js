import { MondayApi } from '../../../lib/mondayApi';
import formidable from 'formidable';
import fs from 'fs';

const mondayApi = new MondayApi(process.env.MONDAY_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: true });
    const [fields, files] = await form.parse(req);

    // Flatten formidable fields (they return arrays)
    const data = {};
    Object.keys(fields).forEach(key => {
      data[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
    });

    // Validate required fields
    const errors = [];
    if (!data.manager) errors.push('manager');
    if (!data.vin) errors.push('vin');
    if (!data.mileage) errors.push('mileage');
    if (!data.condition) errors.push('condition');
    if (data.gpsRemoved !== 'true' || data.equipmentRemoved !== 'true' || data.tagsValid !== 'true') {
      errors.push('checkboxes');
    }

    // Check photo count
    const photoFiles = Object.keys(files).filter(k => k.startsWith('photo_'));
    if (photoFiles.length !== 6) {
      errors.push(`photos (${photoFiles.length}/6 uploaded)`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: errors,
      });
    }

    // Prepare column values for Monday item
    const columnValues = {
      text_mm4t4qgh: data.vin.toUpperCase(), // VIN
      text_mm4tqmew: `${data.make || ''} ${data.model || ''}`.trim(), // Make/Model
      text_mm4tvvtc: data.office || '', // Office Location
      boolean_mm4tcx3f: data.gpsRemoved === 'true', // GPS Removed
      boolean_mm4tj15z: data.equipmentRemoved === 'true', // Equipment Removed
      boolean_mm4tmpn3: data.tagsValid === 'true', // Tags Valid
      numeric_mm4tggtq: parseInt(data.mileage), // Mileage
      dropdown_mm4t7a05: data.condition, // Condition
      multiple_person_mm4tz33p: data.manager, // Manager
      date_mm4tavn0: new Date().toISOString().split('T')[0], // Submission Date
    };

    // Add License State and License Plate if available
    if (data.licenseState) columnValues.text_mm4t_license_state = data.licenseState;
    if (data.licensePlate) columnValues.text_mm4t_license_plate = data.licensePlate;

    // Add Pickup Location if available
    if (data.pickupStreet || data.pickupCity || data.pickupState || data.pickupZip) {
      const pickupAddress = `${data.pickupStreet || ''}, ${data.pickupCity || ''}, ${data.pickupState || ''} ${data.pickupZip || ''}`.trim();
      columnValues.text_mm4t_pickup_location = pickupAddress;
    }

    // Handle photo uploads (simplified - in production would upload to Monday)
    // For now, we'll just count them as submitted
    if (photoFiles.length > 0) {
      // TODO: Implement Monday file attachment API
      console.log(`Received ${photoFiles.length} photos for processing`);
    }

    // Create item in Vehicle Retirement board
    const itemName = `${data.year || ''} ${data.make || ''} ${data.model || ''} (${data.vin})`.trim();

    const result = await mondayApi.createBoardItem(18419998708, {
      name: itemName,
      columnValues: columnValues,
    });

    // TODO: Upload photos to the created item
    // This would require another API call to attach files

    return res.status(201).json({
      success: true,
      itemId: result.id,
      message: 'Vehicle retirement request submitted successfully',
    });
  } catch (error) {
    console.error('Vehicle retirement submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit vehicle retirement request',
      details: error.message,
    });
  }
}
