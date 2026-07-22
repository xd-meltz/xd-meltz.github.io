import React, { useState, useEffect } from 'react';
import { Photo, Album } from '../types';
import { albumsData } from '../data';
import { Camera, MapPin, Calendar, Maximize2, ChevronLeft, ChevronRight, X, FileText, ShoppingBag, Eye, Folder, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryProps {
  onOrderPrint: (photoTitle: string, imageUrl?: string) => void;
  searchQuery?: string;
}

function SmartImage({ src, alt, className = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);

  const isResolving = !src;

  return (
    <div className="relative w-full h-full bg-neutral-950/10 overflow-hidden flex items-center justify-center">
      {(isResolving || !loaded) && !errorStatus && (
        <div className="absolute inset-0 bg-neutral-50/5 flex flex-col items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-neutral-400 animate-spin mb-2" />
          <span className="font-mono text-[8px] tracking-[0.2em] text-neutral-400 uppercase animate-pulse">
            LOADING SHOT...
          </span>
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setErrorStatus(true)}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 select-none`}
          {...props}
        />
      )}
      {errorStatus && (
        <div className="absolute inset-0 bg-neutral-100 flex flex-col items-center justify-center p-4 text-center">
          <span className="text-[9px] font-mono tracking-wider text-neutral-400">FAILED TO RESOLVE MEDIA IMAGE</span>
        </div>
      )}
    </div>
  );
}

// Framer Motion Animation Variants for Staggered Fade-in-up
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const photoItemVariants = {
  hidden: { opacity: 0, y: 35 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] // Custom refined ease out
    }
  }
};

const extractFolderId = (url?: string): string | null => {
  if (!url) return null;
  // Parses folder ID from google drive links
  const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

export default function Gallery({ onOrderPrint, searchQuery = '' }: GalleryProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Dynamic EXIF metadata cache
  const [photoExifCache, setPhotoExifCache] = useState<Record<string, {
    camera: string | null;
    lens: string | null;
    shutter: string | null;
    aperture: string | null;
    iso: string | null;
    story: string | null;
    loaded?: boolean;
  }>>({});

  // Live Google drive state trackers
  const [drivePhotos, setDrivePhotos] = useState<Record<string, Photo[]>>({});
  const [loadingDrive, setLoadingDrive] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [masterError, setMasterError] = useState<string | null>(null);
  const [cloudConfig, setCloudConfig] = useState<{
    provider: string;
    onedriveUrl: string;
    googleDriveId: string;
  } | null>(null);

  // Find currently active album (expanded view)
  const activeAlbum = albums.find((a) => a.id === selectedAlbumId);

  // Check if active album/folder is a hidden folder
  const isHiddenFolder = activeAlbum && (
    activeAlbum.title.toLowerCase().startsWith('.') ||
    activeAlbum.title.toLowerCase().includes('hidden') ||
    activeAlbum.title.toLowerCase().includes('private') ||
    activeAlbum.folderCode.toLowerCase().includes('hidden') ||
    activeAlbum.folderCode.toLowerCase().includes('private') ||
    activeAlbum.folderCode.toLowerCase().startsWith('dir_.') ||
    activeAlbum.folderCode.toLowerCase().includes('dir__')
  );

  // Resolve active photos list (falls back to offline templates if drive is fetching or key is missing)
  const currentAlbumPhotos = activeAlbum
    ? (drivePhotos[activeAlbum.id] || activeAlbum.photos)
    : [];

  // Filter root albums by search query (matching title or location)
  const filteredAlbums = searchQuery.trim() === ''
    ? albums
    : albums.filter((album) =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.folderCode.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Filter photos in current expanded album by search query (if expanded)
  const filteredAlbumPhotos = activeAlbum
    ? (searchQuery.trim() === ''
        ? currentAlbumPhotos
        : currentAlbumPhotos.filter((photo) =>
            photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            photo.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            photo.location.toLowerCase().includes(searchQuery.toLowerCase())
          ))
    : [];

  // Master Cloud Discovery Hook (supports OneDrive and Google Drive)
  useEffect(() => {
    setLoadingMaster(true);
    setMasterError(null);

    fetch('/api/cloud/config')
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((config) => {
        setCloudConfig(config);

        if (config.provider === 'onedrive') {
          // For OneDrive: Use the high-end template albumsData as static portfolio,
          // and let each album point to the user's specific public OneDrive folder!
          const onedriveAlbums: Album[] = albumsData.map((album) => ({
            ...album,
            driveUrl: config.onedriveUrl
          }));
          setAlbums(onedriveAlbums);
          setLoadingMaster(false);
        } else {
          // For Google Drive: Run dynamic subfolder discovery
          fetch(`/api/drive/subfolders/${config.googleDriveId}`)
            .then((res) => {
              if (!res.ok) throw new Error(`Status ${res.status}`);
              return res.json();
            })
            .then((data) => {
              if (data.folders && data.folders.length > 0) {
                const dynamicAlbums: Album[] = data.folders.map((folder: any, index: number) => {
                  const existing = albumsData.find(
                    (a) => a.title.toLowerCase() === folder.name.toLowerCase() || a.id === folder.id
                  );
                  return {
                    id: folder.id,
                    title: folder.name.toUpperCase(),
                    folderCode: `DIR_${folder.name.toUpperCase().replace(/[^a-zA-Z0-9]/g, '_')}`,
                    coverImageUrl: existing?.coverImageUrl || '',
                    date: existing?.date || 'LIVE CLOUD GALLERY',
                    location: existing?.location || 'STELLENBOSCH, SOUTH AFRICA',
                    photos: existing?.photos || [],
                    driveUrl: `https://drive.google.com/drive/folders/${folder.id}?usp=drive_link`
                  };
                });

                setAlbums(dynamicAlbums);

                // Launch background fetches to cache photo arrays and dynamically match cover thumbnails
                dynamicAlbums.forEach((targetAlbum) => {
                  fetch(`/api/drive/folder/${targetAlbum.id}`)
                    .then((res) => res.json())
                    .then((pData) => {
                      if (pData.files && pData.files.length > 0) {
                        const firstFileId = pData.files[0].id;
                        const drivePhotosList: Photo[] = pData.files.map((file: any, pIdx: number) => {
                          const cleanedTitle = file.name ? file.name.replace(/\.[^/.]+$/, "").toUpperCase() : `CAPTURE_${pIdx + 1}`;
                          const lenses = ['45mm', '90mm', '24-70mm f/2.8', '85mm f/1.4', '135mm f/1.8'];
                          const shutterSpeeds = ['1/1000s', '1/800s', '1/1600s', '1/2000s', '1/500s'];
                          const apertures = ['f/2.8', 'f/4.0', 'f/1.8', 'f/2.0', 'f/5.6'];
                          const isos = ['100', '200', '400', '64'];

                          return {
                            id: file.id,
                            title: cleanedTitle,
                            category: 'automotive',
                            tagline: `FRAME ${String(pIdx + 1).padStart(2, '0')}`,
                            date: targetAlbum.date,
                            location: targetAlbum.location,
                            imageUrl: `https://lh3.googleusercontent.com/d/${file.id}`,
                            specs: {
                              camera: 'HASSELBLAD 907X',
                              lens: lenses[pIdx % lenses.length],
                              shutter: shutterSpeeds[pIdx % shutterSpeeds.length],
                              aperture: apertures[pIdx % apertures.length],
                              iso: isos[pIdx % isos.length]
                            },
                            story: `Live production asset synchronized from Google Drive subfolder album directory.`
                          };
                        });

                        setDrivePhotos((prevByFolderId) => ({ ...prevByFolderId, [targetAlbum.id]: drivePhotosList }));
                        setAlbums((prevAlbums) =>
                          prevAlbums.map((a) =>
                            a.id === targetAlbum.id
                              ? { ...a, coverImageUrl: `https://lh3.googleusercontent.com/d/${firstFileId}`, photos: drivePhotosList }
                              : a
                          )
                        );
                      }
                    })
                    .catch((err) => console.warn("Background fetch warning for subfolder:", targetAlbum.id, err));
                });
              }
              setLoadingMaster(false);
            })
            .catch((err) => {
              console.error("Master folder fetching error:", err);
              setMasterError(err.message || 'Offline fallback mode active');
              setLoadingMaster(false);
            });
        }
      })
      .catch((err) => {
        console.error("Cloud config fetching error:", err);
        setCloudConfig({
          provider: 'onedrive',
          onedriveUrl: 'https://1drv.ms/f/c/332078fda1eb73c6/IgBOwFeuKDLcQryLYp6XtFdCAVggKw2y2EOtxCPBOk3PbSQ?e=wXaX9z',
          googleDriveId: ''
        });
        const onedriveAlbums: Album[] = albumsData.map((album) => ({
          ...album,
          driveUrl: 'https://1drv.ms/f/c/332078fda1eb73c6/IgBOwFeuKDLcQryLYp6XtFdCAVggKw2y2EOtxCPBOk3PbSQ?e=wXaX9z'
        }));
        setAlbums(onedriveAlbums);
        setLoadingMaster(false);
      });
  }, []);

  // Async Google Drive synchronization handler for a specific active album if not already background-loaded
  useEffect(() => {
    if (!selectedAlbumId) {
      setDriveError(null);
      return;
    }

    const album = albums.find((a) => a.id === selectedAlbumId);
    if (!album || !album.driveUrl) return;

    if (cloudConfig?.provider === 'onedrive') {
      setLoadingDrive(null);
      setDriveError(null);
      return;
    }

    if (drivePhotos[selectedAlbumId] && drivePhotos[selectedAlbumId].length > 0) {
      return;
    }

    const folderId = extractFolderId(album.driveUrl);
    if (!folderId) return;

    setLoadingDrive(selectedAlbumId);
    setDriveError(null);

    fetch(`/api/drive/folder/${folderId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error && data.isMocked) {
          console.warn("Drive API synchronization warning:", data.error);
          setDriveError(data.error);
          setLoadingDrive(null);
          return;
        }

        if (data.files && data.files.length > 0) {
          const mapped: Photo[] = data.files.map((file: any, index: number) => {
            const cleanedTitle = file.name ? file.name.replace(/\.[^/.]+$/, "").toUpperCase() : `CAPTURE_${index + 1}`;
            const lenses = ['45mm', '90mm', '24-70mm f/2.8', '85mm f/1.4', '135mm f/1.8'];
            const shutterSpeeds = ['1/1000s', '1/800s', '1/1600s', '1/2000s', '1/500s'];
            const apertures = ['f/2.8', 'f/4.0', 'f/1.8', 'f/2.0', 'f/5.6'];
            const isos = ['100', '200', '400', '64'];
            
            return {
              id: file.id,
              title: cleanedTitle,
              category: 'automotive',
              tagline: `FRAME ${String(index + 1).padStart(2, '0')}`,
              date: album.date,
              location: album.location,
              imageUrl: `https://lh3.googleusercontent.com/d/${file.id}`,
              specs: {
                camera: 'HASSELBLAD 907X',
                lens: lenses[index % lenses.length],
                shutter: shutterSpeeds[index % shutterSpeeds.length],
                aperture: apertures[index % apertures.length],
                iso: isos[index % isos.length]
              },
              story: `Dynamic delivery capture. Loaded live from Drive workspace workspace directory. Origin filename: ${file.name}.`
            };
          });

          setDrivePhotos(prev => ({ ...prev, [selectedAlbumId]: mapped }));
          setAlbums(prevAlbums =>
            prevAlbums.map((a) =>
              a.id === selectedAlbumId
                ? { ...a, coverImageUrl: `https://lh3.googleusercontent.com/d/${data.files[0].id}`, photos: mapped }
                : a
            )
          );
        }
        setLoadingDrive(null);
      })
      .catch((err) => {
        console.error("Failed loading Google Drive files:", err);
        setDriveError(err.message || 'Network error');
        setLoadingDrive(null);
      });
    // ESLint rule warning: we only want to refetch when selectedAlbumId changes, not when general state registers update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlbumId]);

  // Load EXIF on demand when a photo is shown/selected in the active view
  useEffect(() => {
    if (activePhotoIndex === null) return;
    const photo = currentAlbumPhotos[activePhotoIndex];
    if (!photo || !photo.id) return;
    
    const photoId = photo.id;
    if (photoExifCache[photoId]) return; // already fetched / cached
    
    fetch(`/api/drive/exif/${photoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPhotoExifCache((prev) => ({
            ...prev,
            [photoId]: {
              camera: data.camera,
              lens: data.lens,
              shutter: data.shutter,
              aperture: data.aperture,
              iso: data.iso,
              story: data.story,
              loaded: true
            }
          }));
        } else {
          setPhotoExifCache((prev) => ({
            ...prev,
            [photoId]: {
              camera: null,
              lens: null,
              shutter: null,
              aperture: null,
              iso: null,
              story: null,
              loaded: true
            }
          }));
        }
      })
      .catch((err) => {
        console.warn("Could not retrieve EXIF parameters: ", err);
        setPhotoExifCache((prev) => ({
          ...prev,
          [photoId]: {
            camera: null,
            lens: null,
            shutter: null,
            aperture: null,
            iso: null,
            story: null,
            loaded: true
          }
        }));
      });
  }, [activePhotoIndex, currentAlbumPhotos, photoExifCache]);

  const handleOpenLightbox = (index: number) => {
    setActivePhotoIndex(index);
  };

  const handleCloseLightbox = () => {
    setActivePhotoIndex(null);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null && activeAlbum) {
      setActivePhotoIndex((activePhotoIndex + 1) % currentAlbumPhotos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null && activeAlbum) {
      setActivePhotoIndex((activePhotoIndex - 1 + currentAlbumPhotos.length) % currentAlbumPhotos.length);
    }
  };

  const currentPhoto = (activePhotoIndex !== null && activeAlbum)
    ? currentAlbumPhotos[activePhotoIndex]
    : null;

  const activeExif = currentPhoto ? photoExifCache[currentPhoto.id] : null;
  const isDynamicPhoto = currentPhoto && !['porsche_gt3_1', 'cockpit_night_1', 'hero_igor_1'].includes(currentPhoto.id);

  const currentCamera = activeExif?.camera || (isDynamicPhoto ? (activeExif?.loaded ? "NOT DISCLOSED" : "LOADING...") : currentPhoto?.specs?.camera) || "NOT DISCLOSED";
  const currentLens = activeExif?.lens || (isDynamicPhoto ? (activeExif?.loaded ? "NOT DISCLOSED" : "LOADING...") : currentPhoto?.specs?.lens) || "NOT DISCLOSED";
  const currentShutter = activeExif?.shutter || (isDynamicPhoto ? (activeExif?.loaded ? "NOT DISCLOSED" : "LOADING...") : currentPhoto?.specs?.shutter) || "NOT DISCLOSED";
  const currentAperture = activeExif?.aperture || (isDynamicPhoto ? (activeExif?.loaded ? "NOT DISCLOSED" : "LOADING...") : currentPhoto?.specs?.aperture) || "NOT DISCLOSED";
  const currentIso = activeExif?.iso || (isDynamicPhoto ? (activeExif?.loaded ? "NOT DISCLOSED" : "LOADING...") : currentPhoto?.specs?.iso) || "NOT DISCLOSED";
  const currentStory = activeExif?.story || currentPhoto?.story || `Live production asset synchronized from Google Drive subfolder.`;

  return (
    <section className="py-12 bg-white" id="gallery-section">
      <div className="max-w-7xl mx-auto px-6">
        
        <AnimatePresence mode="wait">
          {!selectedAlbumId ? (
            /* ================= ROOT ALBUMS / FOLDERS GRID ================= */
            <motion.div
              key="root-albums"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center mb-10 text-center">
                <span className="font-mono text-[10px] tracking-[0.35em] text-neutral-400 uppercase mb-2">
                  ARCHIVES & CLASSIFIED MEDIA
                </span>
                <h2 className="font-sans text-xl font-bold tracking-[0.2em] text-neutral-900 uppercase">
                  PROJECT FOLDERS
                </h2>
                <div className="w-12 h-[1px] bg-neutral-200 mt-4"></div>
              </div>

              {loadingMaster && albums.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-4" />
                  <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase animate-pulse">
                    DISCOVERING PORTFOLIO ALBUMS FROM MASTER DIRECTORY...
                  </p>
                </div>
              ) : filteredAlbums.length === 0 ? (
                <div className="text-center py-20 text-neutral-400 font-mono text-xs tracking-widest">
                  NO ALBUMS MATCHING YOUR SEARCH FOUND
                </div>
              ) : (
                <motion.div 
                  variants={gridContainerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
                >
                  {filteredAlbums.map((album) => (
                    <motion.div
                      variants={photoItemVariants}
                      whileHover={{ y: -4 }}
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="group flex flex-col cursor-pointer text-left"
                      id={`album-folder-${album.id}`}
                    >
                      {/* Interactive stacked physical folders mockup */}
                      <div className="relative w-full aspect-[3/2] mb-6 select-none">
                        {/* Layer 3 - Offset shadow layer */}
                        <div className="absolute inset-0 bg-neutral-100 border border-neutral-200/40 translate-x-3 translate-y-3 rounded-lg rotate-2 group-hover:translate-x-5 group-hover:translate-y-5 group-hover:rotate-3 transition-transform duration-500 ease-out" />
                        
                        {/* Layer 2 - Offset medium layer */}
                        <div className="absolute inset-0 bg-neutral-50 border border-neutral-200/60 translate-x-1.5 translate-y-1.5 rounded-lg -rotate-1 group-hover:translate-x-2.5 group-hover:translate-y-2.5 group-hover:-rotate-2 transition-transform duration-500 ease-out" />
                        
                        {/* Layer 1 - Cover Image printed print */}
                        <div className="absolute inset-0 overflow-hidden bg-neutral-100 border border-neutral-300 shadow-md rounded-lg group-hover:shadow-xl transition-shadow duration-500">
                          <SmartImage
                            src={album.coverImageUrl}
                            alt={album.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                          />
                          {/* Folder Tab Overlay Tag */}
                          <div className="absolute top-3 left-3 bg-neutral-900/90 text-white font-mono text-[9px] tracking-widest px-2.5 py-1 uppercase rounded backdrop-blur-xs flex items-center gap-1.5 border border-white/10">
                            <Folder size={10} className="text-neutral-400" />
                            <span>{album.folderCode}</span>
                          </div>

                          {/* Hover action banner */}
                          <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white text-black font-mono text-[9px] tracking-[0.25em] px-4 py-2.5 border border-black/10 shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                              OPEN ALBUM FOLDER ({album.photos.length} FRAMES)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Folder descriptions */}
                      <div className="px-1">
                        <h3 className="font-sans text-xs font-bold tracking-[0.16em] text-neutral-900 uppercase group-hover:text-black transition-colors text-center sm:text-left">
                          {album.title}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* ================= ALBUM PHOTOS GRID (EXPANDED FOLDER) ================= */
            <motion.div
              key="expanded-album"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Folder Breadcrumbs and Navigation */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 pb-6 mb-10 gap-4 text-left">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setSelectedAlbumId(null)}
                    className="flex items-center gap-2 px-3.5 py-2 border border-neutral-200 hover:border-black rounded-lg text-neutral-700 hover:text-black transition-all group cursor-pointer"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-mono text-[10px] tracking-widest uppercase">BACK TO LIBRARIES</span>
                  </button>
                  <div className="h-6 w-[1px] bg-neutral-200 hidden md:block"></div>
                  <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-neutral-400">
                    <span>COLLECTIONS</span>
                    <span>/</span>
                    <span className="text-neutral-950 font-bold">{activeAlbum.folderCode}</span>
                    {loadingDrive === activeAlbum.id ? (
                      <span className="text-neutral-400 uppercase text-[8px] font-medium tracking-widest animate-pulse ml-2 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin text-neutral-400" />
                        SYNCING CLOUD...
                      </span>
                    ) : cloudConfig?.provider === 'onedrive' ? (
                      <span className="text-blue-600 bg-blue-50 border border-blue-100 uppercase text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded ml-2 flex items-center gap-1">
                        ONEDRIVE SYNCED
                      </span>
                    ) : drivePhotos[activeAlbum.id] ? (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded ml-2">
                        GP SYNCED
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <h2 className="font-sans text-lg font-bold tracking-[0.15em] text-neutral-950 uppercase">
                    {activeAlbum.title}
                  </h2>
                </div>
              </div>

              {loadingDrive === activeAlbum.id ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Loader2 className="w-6 h-6 text-neutral-400 animate-spin mb-4" />
                  <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase animate-pulse">
                    RESOLVING MEDIA DIRECTORY FROM SECURE GOOGLE DRIVE...
                  </p>
                </div>
              ) : filteredAlbumPhotos.length === 0 ? (
                <div className="text-center py-20 text-neutral-400 font-mono text-xs tracking-widest">
                  NO MATCHING CAPTURES FOUND IN THIS SPECIFIC ALBUM
                </div>
              ) : (
                <motion.div 
                  variants={gridContainerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
                >
                  {filteredAlbumPhotos.map((photo, index) => (
                    <motion.div
                      variants={photoItemVariants}
                      whileHover={{ y: -4 }}
                      key={photo.id}
                      onClick={() => handleOpenLightbox(index)}
                      className="group flex flex-col items-center cursor-pointer text-center"
                      id={`album-photo-card-${photo.id}`}
                    >
                      {/* Photo print matte frame with real natural aspect ratio */}
                      <div className="relative w-full overflow-hidden bg-neutral-950/5 mb-4 border border-neutral-200 shadow-xs group-hover:shadow-md transition-shadow">
                        <SmartImage
                          src={photo.imageUrl}
                          alt={photo.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-auto object-contain group-hover:scale-102 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white/95 text-black font-mono text-[9px] tracking-[0.2em] px-4 py-2 border border-black/10 flex items-center gap-1.5">
                            <Eye size={12} />
                            INSPECT SHOT
                          </span>
                        </div>
                      </div>

                      {/* Caption specs */}
                      <h3 className="font-sans text-xs font-bold tracking-[0.15em] text-neutral-900 group-hover:text-black transition-colors uppercase">
                        {photo.title}
                      </h3>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= LIGHTBOX WITH ALBUM NAVIGATION ================= */}
      <AnimatePresence>
        {currentPhoto && activeAlbum && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/98 flex items-center justify-center p-0 md:p-6 backdrop-blur-xs" id="lightbox-overlay">
            {/* Dark dismissable layer */}
            <div className="absolute inset-0 cursor-zoom-out" onClick={handleCloseLightbox} />

            <div className="absolute top-4 right-4 z-50 flex items-center space-x-4">
              {/* Image index badge */}
              <span className="text-white/60 font-mono text-[10px] tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                {(activePhotoIndex !== null ? activePhotoIndex + 1 : 0)} / {currentAlbumPhotos.length}
              </span>
              <button
                onClick={handleCloseLightbox}
                className="p-2.5 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-colors"
                aria-label="Close Lightbox"
              >
                <X size={16} />
              </button>
            </div>

            {/* High fidelity split panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-black text-white w-full max-w-6xl mx-auto flex flex-col lg:flex-row relative z-10 border border-neutral-900 overflow-hidden md:rounded-lg shadow-2xl h-screen md:h-auto md:max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Arrows for expanding the album */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/55 text-white hover:bg-white hover:text-black rounded-full transition-colors hidden md:block border border-white/10"
                aria-label="Previous active print"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/55 text-white hover:bg-white hover:text-black rounded-full transition-colors hidden md:block border border-white/10"
                aria-label="Next active print"
              >
                <ChevronRight size={18} />
              </button>

              {/* Photo View Box */}
              <div className="flex-1 bg-neutral-950 flex items-center justify-center p-4 min-h-[40vh] max-h-[52vh] lg:max-h-none lg:h-auto relative overflow-hidden select-none">
                <div className="relative max-w-full max-h-[48vh] lg:max-h-[75vh] select-none">
                  {/* Invisible pointer-events protection overlay */}
                  <div 
                    className="absolute inset-0 z-20 bg-transparent select-none cursor-default" 
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                  <img
                    src={currentPhoto.imageUrl}
                    alt={currentPhoto.title}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="max-w-full max-h-[48vh] lg:max-h-[75vh] object-contain shadow-2xl select-none pointer-events-none"
                  />

                  {/* Highly dense Repeating Diagonal Watermark Grid exactly over the image */}
                  <div className="absolute inset-0 z-10 pointer-events-none grid grid-cols-3 grid-rows-3 gap-2 p-4 select-none overflow-hidden opacity-30 mix-blend-screen">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="flex items-center justify-center -rotate-12 whitespace-nowrap">
                        <span className="font-mono text-[8px] sm:text-[10px] tracking-[0.3em] text-white border border-white/30 px-2 py-1 bg-black/50 backdrop-blur-xs shadow-md">
                          RIX VISUALS PROOF
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotspots for mobile navigation (high z-index above protection overlay) */}
                <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center md:hidden z-30 cursor-pointer" onClick={handlePrevPhoto}>
                  <ChevronLeft className="text-white bg-black/50 p-1.5 rounded-full shadow" size={24} />
                </div>
                <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center md:hidden z-30 cursor-pointer" onClick={handleNextPhoto}>
                  <ChevronRight className="text-white bg-black/50 p-1.5 rounded-full shadow" size={24} />
                </div>
              </div>

              {/* Specs & Narrative Sidebar */}
              <div className="w-full lg:w-[370px] bg-neutral-950 border-t lg:border-t-0 lg:border-l border-neutral-900 p-6 flex flex-col justify-between overflow-y-auto h-auto lg:max-h-[85vh]">
                <div>
                  <span className="text-[9px] font-mono tracking-[0.3em] text-pink-500 font-semibold uppercase block mb-1">
                    FRAME {activePhotoIndex !== null ? activePhotoIndex + 1 : 1}
                  </span>
                  <h2 className="text-lg font-bold tracking-wider mb-1 font-sans text-white uppercase">
                    {currentPhoto.title}
                  </h2>
                  <p className="text-[10px] font-mono tracking-widest text-neutral-500 mb-6 uppercase">
                    {currentPhoto.tagline}
                  </p>

                  {/* Lens & exposure metadata */}
                  <div className="bg-neutral-900/40 p-4 border border-neutral-900 space-y-3 mb-5">
                    <h4 className="text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase flex items-center gap-2">
                      <Camera size={11} />
                      EXIF DISCLOSURE
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 font-mono text-[10px] text-neutral-300">
                      <div>
                        <span className="text-[8px] text-neutral-500 block uppercase font-light">BODY</span>
                        <span className="font-semibold">{currentCamera}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-500 block uppercase font-light">GLASS</span>
                        <span className="font-semibold text-neutral-100">{currentLens}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-500 block uppercase font-light">EXPOSURE</span>
                        <span>{currentShutter}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-500 block uppercase font-light font-sans">APERTURE</span>
                        <span>{currentAperture}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-500 block uppercase font-light">ISO PROFILE</span>
                        <span>{currentIso}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom button tray */}
                <div className="pt-4 border-t border-neutral-900 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onOrderPrint(`${activeAlbum.title} — ${currentPhoto.title}`, currentPhoto.imageUrl);
                      handleCloseLightbox();
                    }}
                    className="w-full font-mono text-[10px] tracking-widest text-center stroke-none bg-white text-black py-3 hover:bg-neutral-200 transition-colors font-medium flex items-center justify-center gap-2 uppercase"
                  >
                    <ShoppingBag size={13} />
                    ORDER CUSTOM PRINT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

