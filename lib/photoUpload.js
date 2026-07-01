/**
 * Photo Upload Handler for Monday.com
 */

export async function uploadPhotosToMonday(files) {
  const photoUrls = [];

  try {
    for (const [key, file] of Object.entries(files)) {
      if (!file) continue;

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} exceeds 5MB limit`);
      }

      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        throw new Error(`File ${file.name} must be JPG or PNG`);
      }

      // Upload to monday.com
      try {
        const uploadUrl = await getMonday AttachmentUploadUrl(file.name);
        await uploadFileToUrl(uploadUrl, file);
        photoUrls.push(uploadUrl);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      }
    }

    return photoUrls;
  } catch (error) {
    console.error('Photo upload error:', error);
    throw error;
  }
}

/**
 * Get Monday.com file upload URL
 */
async function getMondayAttachmentUploadUrl(fileName) {
  const query = `
    mutation getAssetUploadUrl($fileName: String!) {
      get_asset_upload_url(file_name: $fileName) {
        upload_url
        asset_id
      }
    }
  `;

  try {
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MONDAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          fileName,
        },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`Monday API error: ${data.errors[0].message}`);
    }

    return data.data.get_asset_upload_url;
  } catch (error) {
    console.error('Failed to get upload URL:', error);
    throw error;
  }
}

/**
 * Upload file to URL
 */
async function uploadFileToUrl(uploadData, file) {
  try {
    const formData = new FormData();
    formData.append('file', file.data, file.name);

    const response = await fetch(uploadData.upload_url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return uploadData.asset_id;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

export default uploadPhotosToMonday;
