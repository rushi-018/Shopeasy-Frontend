import api from '../services/api'

export const uploadImage = async (file) => {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    throw new Error('Failed to upload image')
  }
}

export const deleteImage = async (publicId) => {
  try {
    await api.delete('/upload/image', {
      data: { public_id: publicId },
    })
  } catch (error) {
    throw new Error('Failed to delete image')
  }
} 