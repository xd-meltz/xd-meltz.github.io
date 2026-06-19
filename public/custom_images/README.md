# Custom User Images Folder

You can drop, upload, or paste your own custom images directly into this folder (`/public/custom_images/`).

## How to reference these images in your code:

Because this folder is inside the `/public/` directory, any image you upload here is instantly available as a public static asset. You can load it directly in your HTML or React code using a simple relative path:

```tsx
<img 
  src="/custom_images/your_image_name.jpg" 
  alt="My Coffee Shop" 
/>
```

For example, if you upload `our_story.jpg` to this folder, you can use:
`src="/custom_images/our_story.jpg"`
