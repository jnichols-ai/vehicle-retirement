import { MondayApi } from '../lib/mondayApi';
import { uploadPhotosToMonday } from '../lib/photoUpload';

const mondayApi = new MondayApi(process.env.MONDAY_API_KEY);

/**
 * VIN Lookup - Query FL Trucks Enterprise board
 * GET /api/vehicle/lookup
 */
export async function handleVinLookup(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vin } = req.body;

  if (!vin || vin.length !== 17) {
    return res.status(400).json({ error: 'VIN must be exactly 17 characters' });
  }

  try {
    // Query FL TRUCKS ENTERPRISE board (id: 18391343450)
    const vehicles = await mondayApi.searchBoardItems({
      boardId: 18391343450,
      searchTerm: vin,
    });

    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found in system' });
    }

    const vehicle = vehicles[0];
    const vehicleData = await mondayApi.getItemDetails(vehicle.id, 18391343450);

    // Extract make, model, year, license plate from board columns
    const make = vehicleData.columns.find(c => c.title === 'Make')?.value || '';
    const model = vehicleData.columns.find(c => c.title === 'Model')?.value || '';
    const year = vehicleData.columns.find(c => c.title === 'Year')?.value || '';
    const licensePlate = vehicleData.columns.find(c => c.title === 'License Plate')?.value || '';

    return res.status(200).json({
      vin: vin.toUpperCase(),
      make,
      model,
      year,
      licensePlate,
      mondayItemId: vehicle.id,
    });
  } catch (error) {
    console.error('VIN lookup error:', error);
    return res.status(500).json({ error: 'Failed to lookup vehicle' });
  }
}

/**
 * Submit Vehicle Retirement - Create item in Vehicle Retirement board
 * POST /api/vehicle/retire
 */
export async function handleVehicleRetirement(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    manager,
    office,
    vin,
    make,
    model,
    year,
    licensePlate,
    mileage,
    gpsRemoved,
    equipmentRemoved,
    tagsValid,
    condition,
    notes,
  } = req.body;

  // Validate required fields
  const errors = [];
  if (!manager) errors.push('manager');
  if (!vin) errors.push('vin');
  if (!mileage) errors.push('mileage');
  if (!condition) errors.push('condition');
  if (!gpsRemoved || !equipmentRemoved || !tagsValid) errors.push('checkboxes');

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      fields: errors,
    });
  }

  try {
    // Upload photos if present
    let photoUrls = [];
    if (req.files && Object.keys(req.files).length > 0) {
      photoUrls = await uploadPhotosToMonday(req.files);
    }

    // Create item in Vehicle Retirement board (id: 18419998708)
    const itemData = {
      name: `${year} ${make} ${model} (${vin})`,
      columnValues: {
        status: 'Submission',
        text_mm4t4qgh: vin, // VIN column
        text_mm4tqmew: `${make} ${model}`, // Make/Model/Year
        text_mm4tcyx0: licensePlate, // License Plate
        text_mm4tvvtc: office, // Office Location
        boolean_mm4tcx3f: gpsRemoved, // GPS Removed
        boolean_mm4tj15z: equipmentRemoved, // Frontline Equipment Removed
        boolean_mm4tmpn3: tagsValid, // Tags Valid
        numeric_mm4tggtq: parseInt(mileage), // Current Mileage
        dropdown_mm4t7a05: condition, // Vehicle Condition
        file_mm4t8cay: photoUrls, // Inspection Photos
        multiple_person_mm4tz33p: manager, // Manager
        date_mm4tavn0: new Date().toISOString().split('T')[0], // Submission Date
      },
    };

    if (notes) {
      // Add notes to item description if available
      itemData.body = notes;
    }

    const result = await mondayApi.createBoardItem(
      18419998708,
      itemData
    );

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

/**
 * API Route Handler
 */
export default function handler(req, res) {
  const { action } = req.query;

  if (action === 'lookup') {
    return handleVinLookup(req, res);
  } else if (action === 'retire') {
    return handleVehicleRetirement(req, res);
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}
