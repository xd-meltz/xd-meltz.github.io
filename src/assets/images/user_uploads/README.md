# Igor's Custom Photo Upload Folder (`/src/assets/images/user_uploads/`)

Welcome to your dedicated uploads directory! This folder was created specifically for you to upload images you have taken.

## How to use this folder:

1. **Upload your files**: Simply use the AI Studio file explorer or files sidebar to upload your JPEG/PNG capture files directly into this directory (`/src/assets/images/user_uploads/`).
2. **Reference them in your portfolio**: To display a new photo in any of your albums, open `/src/data.ts` and add a photo object in the appropriate album with the `imageUrl` pointing to your file.

### Example configuration in `/src/data.ts`:

```typescript
{
  id: 'my-custom-photo-01',
  title: 'MY RACING CAPTURE',
  category: 'automotive',
  tagline: 'TRACKSIDE GLOW',
  date: '2026',
  location: 'MELBOURNE',
  imageUrl: '/src/assets/images/user_uploads/my_uploaded_car_photo.jpg', // <-- Points to your file
  specs: {
    camera: 'HASSELBLAD 907X',
    lens: '45mm',
    shutter: '1/1000s',
    aperture: 'f/4.0',
    iso: '100'
  },
  story: 'This is the description story of the car that I shot.'
}
```
