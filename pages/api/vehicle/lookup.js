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

    // Extract columns from the item
    const getColumnValue = (title) => {
      const col = vehicleData.column_values.find(c => c.type === title || c.id === title);
      return col?.text || col?.value || '';
    };

    return res.status(200).json({
      vin: vin.toUpperCase(),
      make: getColumnValue('Make') || '',
      model: getColumnValue('Model') || '',
      year: getColumnValue('Year') || '',
      licensePlate: getColumnValue('License Plate') || '',
      mondayItemId: vehicle.id,
    });
  } catch (error) {
    console.error('VIN lookup error:', error);
    return res.status(500).json({ error: 'Failed to lookup vehicle' });
  }
}
