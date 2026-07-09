import { MondayApi } from '../../../lib/mondayApi';

const mondayApi = new MondayApi(process.env.MONDAY_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vin } = req.body;

  if (!vin) {
    return res.status(400).json({ error: 'VIN is required' });
  }

  try {
    const vinUpper = vin.toUpperCase().trim();

    // Query FL TRUCKS ENTERPRISE board directly (id: 18391343450)
    // Get all items and search through them
    const query = `
      query {
        boards(ids: [18391343450]) {
          items_page(limit: 500) {
            items {
              id
              name
              column_values {
                id
                text
                type
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MONDAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('Monday API error:', data.errors);
      return res.status(500).json({ error: 'API error: ' + data.errors[0].message });
    }

    const items = data.data.boards[0].items_page.items;

    // Search through items to find VIN
    const foundItem = items.find(item => {
      return item.column_values.some(cv =>
        cv.text && cv.text.toUpperCase().includes(vinUpper)
      );
    });

    if (!foundItem) {
      return res.status(404).json({ error: 'Vehicle not found in system' });
    }

    // Extract vehicle data from columns
    const columnData = {};
    foundItem.column_values.forEach(cv => {
      if (cv.text) {
        columnData[cv.id] = cv.text;
      }
    });

    // Based on the board structure, map columns
    // The columns appear to be in this order: Vehicle unit, Year, VIN, Make, Model, Series
    const columnValues = foundItem.column_values.map(cv => cv.text).filter(Boolean);

    return res.status(200).json({
      vin: vinUpper,
      make: columnValues[3] || columnData.make || '', // Make is typically 4th column
      model: columnValues[4] || columnData.model || '', // Model is typically 5th column
      year: columnValues[1] || columnData.year || '', // Year is typically 2nd column
      licenseState: columnValues[7] || columnData.licenseState || '', // License State
      licensePlate: columnValues[8] || columnData.licensePlate || '', // License Num
      mondayItemId: foundItem.id,
    });
  } catch (error) {
    console.error('VIN lookup error:', error);
    return res.status(500).json({ error: 'Failed to lookup vehicle: ' + error.message });
  }
}
