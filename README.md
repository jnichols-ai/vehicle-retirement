# Vehicle Retirement Portal

A Progressive Web App (PWA) for Frontline Pest Control managers to submit vehicles for retirement and disposal.

## Features

- **Manager Selection** — Auto-populate office location from manager dropdown
- **VIN Lookup** — Auto-fill make, model, year, and license plate from FL Trucks Enterprise board
- **Pre-Retirement Checklist** — Confirm GPS removal, equipment removal, and tag validity
- **Vehicle Condition** — Select condition (Good Running / Needs Repair / Needs Towing)
- **Photo Upload** — Required 6-photo documentation (4 sides + driver compartment + chemical storage)
- **Monday.com Integration** — Automatic submission to Vehicle Retirement board
- **PWA Support** — Install as app on mobile/desktop, offline capability
- **Frontline Branding** — Navy blue + red color scheme matching company brand

## Tech Stack

- **Framework**: Next.js 14
- **Frontend**: React 18
- **Styling**: CSS3 with Frontline color scheme
- **Backend**: Node.js API routes
- **Database**: monday.com API
- **Deployment**: Vercel
- **VCS**: GitHub

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- monday.com API key
- GitHub account
- Vercel account

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/frontlinepest/vehicle-retirement-portal.git
   cd vehicle-retirement-portal
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create `.env.local`:
   ```env
   MONDAY_API_KEY=your_monday_api_key_here
   MONDAY_BOARD_ID=18419998708
   FL_TRUCKS_BOARD_ID=18391343450
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Option 1: Via GitHub

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/frontlinepest/vehicle-retirement-portal.git
   git branch -M main
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import GitHub repository
   - Add environment variables:
     - `MONDAY_API_KEY`
     - `MONDAY_BOARD_ID`
     - `FL_TRUCKS_BOARD_ID`
   - Deploy

### Option 2: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel env add MONDAY_API_KEY
   vercel env add MONDAY_BOARD_ID
   vercel env add FL_TRUCKS_BOARD_ID
   vercel --prod
   ```

## Monday.com Configuration

### Boards Used

- **Vehicle Retirement** (18419998708) — Submission tracking board
- **FL Trucks Enterprise** (18391343450) — Vehicle inventory lookup

### Column Mappings

**Vehicle Retirement Board:**
- `text_mm4t4qgh` — VIN
- `text_mm4tqmew` — Make/Model/Year
- `text_mm4tcyx0` — License Plate
- `text_mm4tvvtc` — Office Location
- `boolean_mm4tcx3f` — GPS Removed
- `boolean_mm4tj15z` — Frontline Equipment Removed
- `boolean_mm4tmpn3` — Tags Valid
- `numeric_mm4tggtq` — Current Mileage
- `dropdown_mm4t7a05` — Vehicle Condition
- `file_mm4t8cay` — Inspection Photos
- `multiple_person_mm4tz33p` — Manager
- `date_mm4tavn0` — Submission Date

## API Endpoints

### POST /api/vehicle/lookup

Lookup vehicle information by VIN.

**Request:**
```json
{
  "vin": "1HGCV41JXMN109186"
}
```

**Response:**
```json
{
  "vin": "1HGCV41JXMN109186",
  "make": "Honda",
  "model": "Accord",
  "year": "2023",
  "licensePlate": "ABC-1234",
  "mondayItemId": "12345678"
}
```

### POST /api/vehicle/retire

Submit vehicle retirement request.

**Request:**
```
Content-Type: multipart/form-data

- manager: "Josh Emerson"
- office: "Baltimore, MD"
- vin: "1HGCV41JXMN109186"
- make: "Honda"
- model: "Accord"
- year: "2023"
- licensePlate: "ABC-1234"
- mileage: "45000"
- gpsRemoved: true
- equipmentRemoved: true
- tagsValid: true
- condition: "Good Running"
- notes: "Additional notes here"
- photo_0: [File]
- photo_1: [File]
- ...
- photo_5: [File]
```

**Response:**
```json
{
  "success": true,
  "itemId": "12345678",
  "message": "Vehicle retirement request submitted successfully"
}
```

## Form Validation

- **Manager**: Required
- **VIN**: Required, 17 characters
- **Mileage**: Required, numeric
- **Checkboxes**: All must be checked
- **Condition**: Required
- **Photos**: Exactly 6 required (JPG/PNG, max 5MB each)

## PWA Features

The app includes PWA support for installation on mobile and desktop:

- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **Icons**: Place in `public/` directory:
  - `icon-192.png`
  - `icon-512.png`
  - `icon-192-maskable.png`
  - `icon-512-maskable.png`

### Install Instructions

- **Mobile**: Open in browser → Menu → "Add to Home Screen"
- **Desktop**: Open in Chrome → Menu → "Install app"

## Troubleshooting

### VIN Lookup Returns 404
- Verify VIN exists in FL Trucks Enterprise board
- Check monday.com API key has correct permissions

### Photos Not Uploading
- Verify files are JPG/PNG
- Check file size (max 5MB)
- Ensure exactly 6 photos are selected

### Form Won't Submit
- Check all required fields are filled
- Verify all checkboxes are checked
- Ensure photos are selected
- Check browser console for errors

## Development

### Project Structure

```
vehicle-retirement-portal/
├── pages/
│   ├── index.jsx          # Main form page
│   └── api/
│       └── vehicle/
│           ├── lookup.js  # VIN lookup endpoint
│           └── retire.js  # Form submission endpoint
├── lib/
│   ├── mondayApi.js       # Monday.com API client
│   └── photoUpload.js     # Photo upload handler
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   └── [icons]            # PWA icons
├── VehicleRetirementForm.jsx  # React form component
├── VehicleRetirementForm.css  # Component styling
├── package.json           # Dependencies
├── next.config.js         # Next.js config
└── README.md              # This file
```

### Running Tests

```bash
npm run lint
```

## Future Enhancements

- [ ] Photo upload to Monday.com files
- [ ] Email notifications on submission
- [ ] Dashboard for submission tracking
- [ ] Bulk vehicle import
- [ ] QR code generation for vehicles
- [ ] Offline form submission queue

## Support

For issues or questions, contact the development team.

## License

Internal use only — Frontline Pest Control
