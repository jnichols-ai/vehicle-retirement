import { MondayApi } from '../../../lib/mondayApi';

const mondayApi = new MondayApi(process.env.MONDAY_API_KEY);

export default async function handler(req, res) {
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
      searchTerm: vin.toUpperCase(),
    });

    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found in system' });
    }

    const vehicle = vehicles[0];
    const vehicleData = await mondayApi.getItemDetails(vehicle.id, 18391343450);

    // Extract column values - they contain text representation of the data
    // Column structure: Vehicle unit, Year, VIN, Make, Model, Series, etc.
    const columnTexts = vehicleData.column_values.map(cv => cv.text).filter(Boolean);

    // Parse the values - based on the board structure
    // The column_values array should have: vehicle_unit, year, vin, make, model, series, license_plate
    let extractedData = {
      vin: vin.toUpperCase(),
      make: '',
      model: '',
      year: '',
      licensePlate: '',
    };

    // Try to find data by matching position in column_values
    // Column order: Vehicle unit (idx 0), Year (idx 1), VIN (idx 2), Make (idx 3), Model (idx 4), Series (idx 5), etc.
    vehicleData.column_values.forEach((cv, idx) => {
      const text = cv.text || '';
      if (text) {
        // Match by column position or content
        if (cv.id && cv.id.includes('year')) extractedData.year = text;
        if (cv.id && cv.id.includes('make')) extractedData.make = text;
        if (cv.id && cv.id.includes('model')) extractedData.model = text;
        if (cv.id && cv.id.includes('vin')) extractedData.vin = text.toUpperCase();
      }
    });

    // If we didn't find values by ID, use position-based extraction
    if (!extractedData.year && columnTexts[1]) extractedData.year = columnTexts[1];
    if (!extractedData.make && columnTexts[3]) extractedData.make = columnTexts[3];
    if (!extractedData.model && columnTexts[4]) extractedData.model = columnTexts[4];

    return res.status(200).json({
      vin: extractedData.vin || vin.toUpperCase(),
      make: extractedData.make,
      model: extractedData.model,
      year: extractedData.year,
      licensePlate: extractedData.licensePlate,
      mondayItemId: vehicle.id,
    });
  } catch (error) {
    console.error('VIN lookup error:', error);
    return res.status(500).json({ error: 'Failed to lookup vehicle' });
  }
}
